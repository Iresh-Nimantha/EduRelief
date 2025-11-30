import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, assertAdmin } from "@/lib/auth";
import { deleteNoteAsAdmin } from "@/lib/firestore";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization") ?? undefined;
    const user = await verifyIdToken(authHeader);

    // Verify user is admin
    await assertAdmin(user.uid, user.email);

    const resolvedParams = await params;
    const note = await deleteNoteAsAdmin(resolvedParams.id);

    return NextResponse.json({ note });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 400 }
    );
  }
}

