import { NextResponse } from "next/server";
import { generateRandomLink } from "@/lib/links";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "generate") {
      const link = generateRandomLink();
      return NextResponse.json({
        link: {
          id: Math.random().toString(36).substring(2, 10),
          token: link.token,
          createdAt: new Date().toISOString(),
        },
        message: "Generated a new random cloaked link",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
