import { NextRequest, NextResponse } from "next/server";
import { listNotes } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notes = await listNotes({
      grade: searchParams.get("grade") ?? undefined,
      subject: searchParams.get("subject") ?? undefined,
      uploaderId: searchParams.get("uploaderId") ?? undefined,
      searchTerm: searchParams.get("q") ?? undefined,
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes", notes: [] },
      { status: 500 }
    );
  }
}

