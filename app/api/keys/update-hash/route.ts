import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/require-auth";
import { callRedis } from "../../../lib/upstash";

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = (await request.json()) as {
      key?: string;
      entries?: Record<string, string>;
      removed?: string[];
    };
    if (!body.key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }
    if (body.entries) {
      const flat: (string | number)[] = [];
      Object.entries(body.entries).forEach(([field, value]) => {
        flat.push(field, value);
      });
      if (flat.length > 0) {
        await callRedis("HSET", [body.key, ...flat]);
      }
    }
    if (body.removed && body.removed.length > 0) {
      await callRedis("HDEL", [body.key, ...body.removed]);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
