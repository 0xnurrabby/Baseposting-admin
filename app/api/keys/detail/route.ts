import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../lib/require-auth";
import { callRedis } from "../../../lib/upstash";
import { KeyDetail } from "../../../lib/types";

const getSize = async (type: string, key: string) => {
  switch (type) {
    case "string":
      return callRedis<number>("STRLEN", [key]);
    case "hash":
      return callRedis<number>("HLEN", [key]);
    case "list":
      return callRedis<number>("LLEN", [key]);
    case "set":
      return callRedis<number>("SCARD", [key]);
    case "zset":
      return callRedis<number>("ZCARD", [key]);
    case "stream":
      return callRedis<number>("XLEN", [key]);
    default:
      return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }
    const type = await callRedis<string>("TYPE", [key]);
    const ttlValue = await callRedis<number>("TTL", [key]);
    const ttl = ttlValue <= 0 ? null : ttlValue;
    const size = await getSize(type, key);

    const detail: KeyDetail = {
      key,
      type,
      ttl,
      size: size ?? null
    };

    if (type === "string") {
      detail.value = await callRedis<string>("GET", [key]);
    }
    if (type === "hash") {
      const result = await callRedis<Record<string, string>>("HGETALL", [key]);
      detail.value = result;
    }

    return NextResponse.json(detail);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
