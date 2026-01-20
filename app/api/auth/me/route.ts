import { NextResponse } from "next/server";
import { requireAuth } from "../../../lib/require-auth";

export async function GET() {
  try {
    const session = await requireAuth();
    return NextResponse.json({ username: session.username });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
