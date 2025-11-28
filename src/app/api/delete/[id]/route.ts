import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/auth";
import { deleteNote } from "@/lib/firestore";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization") ?? undefined;
    const user = await verifyIdToken(authHeader);

    const resolvedParams = await params; // Await the Promise
    const note = await deleteNote(resolvedParams.id, user.uid);

    return NextResponse.json({ note });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed" },
      { status: 400 }
    );
  }
}
