import { NextResponse } from "next/server";
import { validateKey } from "@/lib/storage";

export async function POST(req: Request) {
  try {
    const { key } = await req.json();
    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const result = validateKey(key);
    if (result.valid) {
      return NextResponse.json({ success: true, message: "Access granted" });
    } else {
      return NextResponse.json({ error: result.error || "Invalid key" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Key is required" }, { status: 400 });
  }

  const result = validateKey(key);
  return NextResponse.json({ valid: result.valid });
}
