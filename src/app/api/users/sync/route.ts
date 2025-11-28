import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/auth";
import { syncUserProfile } from "@/lib/firestore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") ?? undefined;
    const user = await verifyIdToken(authHeader);
    const profile = await syncUserProfile({
      uid: user.uid,
      name: user.name,
      email: user.email,
    });
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync user" },
      { status: 400 }
    );
  }
}

