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

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: NextRequest) {
  // Ensure we always return JSON, even for errors
  try {
    const authHeader = request.headers.get("authorization");
    
    // Log for debugging (remove in production if needed)
    console.log("Upload request received");
    console.log("Upload request - Auth header present:", !!authHeader);
    console.log("Upload request - Auth header starts with Bearer:", authHeader?.startsWith("Bearer "));
    console.log("Upload request - Content-Type:", request.headers.get("content-type"));
    
    // Verify authentication first - return 403 for auth errors
    let user;
    try {
      if (!authHeader) {
        console.error("Upload error: No authorization header provided");
        return NextResponse.json(
          { error: "Authentication required. Please log in and try again." },
          { 
            status: 403,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      
      // Verify Firebase Admin is initialized
      try {
        user = await verifyIdToken(authHeader);
        console.log("Upload request - User authenticated:", user.uid);
      } catch (verifyError: any) {
        console.error("Token verification failed:", {
          error: verifyError?.message,
          code: verifyError?.code,
          stack: verifyError?.stack,
        });
        throw verifyError;
      }
    } catch (authError: any) {
      console.error("Auth error details:", {
        error: authError instanceof Error ? authError.message : String(authError),
        code: authError?.code,
        hasAuthHeader: !!authHeader,
        authHeaderPrefix: authHeader?.substring(0, 20),
      });
      return NextResponse.json(
        {
          error: authError instanceof Error 
            ? authError.message 
            : "Authentication failed. Please log in again.",
        },
        { 
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

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

