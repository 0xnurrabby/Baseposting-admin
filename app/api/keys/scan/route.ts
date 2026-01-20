import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../lib/require-auth";
import { callRedis } from "../../../lib/upstash";
import { KeySummary } from "../../../lib/types";

const getTypeForKeys = async (keys: string[]) => {
  const entries: KeySummary[] = [];
  for (const key of keys) {
    const type = await callRedis<string>("TYPE", [key]);
    entries.push({ key, type });
  }
  return entries;
};

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get("pattern") ?? "*";
    const cursor = searchParams.get("cursor") ?? "0";
    const filterType = searchParams.get("type") ?? "all";

    const [nextCursor, keys] = (await callRedis<[string, string[]]>("SCAN", [
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      50
    ])) as [string, string[]];

    const summaries = await getTypeForKeys(keys);
    const filtered = filterType === "all" ? summaries : summaries.filter((item) => item.type === filterType);

    return NextResponse.json({ keys: filtered, cursor: nextCursor });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
