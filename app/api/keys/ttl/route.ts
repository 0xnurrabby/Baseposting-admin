import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/require-auth";
import { callRedis } from "../../../lib/upstash";

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = (await request.json()) as { key?: string; ttl?: number | null };
    if (!body.key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }
    if (body.ttl === null || body.ttl === undefined) {
      await callRedis("PERSIST", [body.key]);
    } else {
      await callRedis("EXPIRE", [body.key, body.ttl]);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
