import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/auth";
import { noteSchema } from "@/lib/validation";
import {
  buildGitHubPath,
  buildRawGitHubUrl,
  commitFileToGitHub,
} from "@/lib/github";
import { createNote } from "@/lib/firestore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") ?? undefined;
    const user = await verifyIdToken(authHeader);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const parsed = noteSchema.parse({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      grade: String(formData.get("grade") ?? ""),
      subject: String(formData.get("subject") ?? ""),
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const githubPath = buildGitHubPath(parsed.grade, parsed.subject, file.name);

    await commitFileToGitHub({
      path: githubPath,
      content: buffer.toString("base64"),
      message: `feat(notes): add ${parsed.title}`,
    });

    const note = await createNote({
      data: parsed,
      filePath: githubPath,
      fileUrl: buildRawGitHubUrl(githubPath),
      uploaderId: user.uid,
      uploaderName: user.name ?? user.email ?? "Contributor",
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Upload error", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to upload the file",
      },
      { status: 400 }
    );
  }
}

