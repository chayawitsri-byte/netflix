import { NextResponse } from "next/server";
import { getAllKeys, createKey, deleteKey } from "@/lib/storage";

const ADMIN_KEY = "devarty";

function isAdmin(req: Request) {
  return req.headers.get("x-admin-key") === ADMIN_KEY;
}

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const keys = getAllKeys();
  return NextResponse.json({ keys });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { durationMs } = await req.json();
    if (!durationMs || typeof durationMs !== "number") {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    const newKey = createKey(durationMs);
    return NextResponse.json({ success: true, key: newKey });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Key code is required" }, { status: 400 });
    }

    const success = deleteKey(code);
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Key not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
