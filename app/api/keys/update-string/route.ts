import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/require-auth";
import { callRedis } from "../../../lib/upstash";

export async function POST(request: Request) {
  try {
    await requireAuth();
    const body = (await request.json()) as { key?: string; value?: string };
    if (!body.key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }
    await callRedis("SET", [body.key, body.value ?? ""]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
