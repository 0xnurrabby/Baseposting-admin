import { NextResponse } from "next/server";
import { requireAuth } from "../../lib/require-auth";
import { callRedis } from "../../lib/upstash";
import { DashboardStats } from "../../lib/types";

const parseInfo = (info: string) => {
  const lines = info.split("\n");
  const map = new Map<string, string>();
  lines.forEach((line) => {
    if (!line || line.startsWith("#")) return;
    const [key, value] = line.split(":");
    if (key && value) {
      map.set(key.trim(), value.trim());
    }
  });
  return map;
};

const scanKeys = async (match: string, maxKeys = 500) => {
  let cursor = "0";
  const keys: string[] = [];
  do {
    const [nextCursor, batch] = (await callRedis<[string, string[]]>("SCAN", [cursor, "MATCH", match, "COUNT", 200])) as [
      string,
      string[]
    ];
    cursor = nextCursor;
    keys.push(...batch);
  } while (cursor !== "0" && keys.length < maxKeys);
  return keys.slice(0, maxKeys);
};

export async function GET() {
  try {
    await requireAuth();
    const [totalKeys, info] = await Promise.all([callRedis<number>("DBSIZE"), callRedis<string>("INFO")]);
    const infoMap = parseInfo(info);

    const dailyKeys = await scanKeys("daily:post:*");
    const dailyMap = new Map<string, number>();
    dailyKeys.forEach((key) => {
      const parts = key.split(":");
      const date = parts[2] ?? "unknown";
      dailyMap.set(date, (dailyMap.get(date) ?? 0) + 1);
    });
    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));

    const sampleKeys = await scanKeys("*", 300);
    const prefixMap = new Map<string, number>();
    const typeMap = new Map<string, number>();

    for (const key of sampleKeys) {
      const prefix = key.includes(":") ? `${key.split(":")[0]}:` : "other";
      prefixMap.set(prefix, (prefixMap.get(prefix) ?? 0) + 1);
      const type = await callRedis<string>("TYPE", [key]);
      typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
    }

    const prefixDistribution = Array.from(prefixMap.entries()).map(([name, value]) => ({ name, value }));
    const typeBreakdown = Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));

    const stats: DashboardStats = {
      totalKeys,
      memory: infoMap.get("used_memory_human") ?? null,
      opsPerSec: infoMap.get("instantaneous_ops_per_sec") ?? null,
      clients: infoMap.get("connected_clients") ?? null,
      dailyTrend,
      prefixDistribution,
      typeBreakdown
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
