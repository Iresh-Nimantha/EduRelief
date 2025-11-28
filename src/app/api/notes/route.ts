import { NextRequest, NextResponse } from "next/server";
import { listNotes } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const notes = await listNotes({
    grade: searchParams.get("grade") ?? undefined,
    subject: searchParams.get("subject") ?? undefined,
    uploaderId: searchParams.get("uploaderId") ?? undefined,
    searchTerm: searchParams.get("q") ?? undefined,
  });

  return NextResponse.json({ notes });
}

