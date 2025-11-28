import { NextRequest, NextResponse } from "next/server";
import { assertAdmin, verifyIdToken } from "@/lib/auth";
import { listAllUsers, updateUserRole } from "@/lib/firestore";
import { UserRole } from "@/types/user";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") ?? undefined;
    const caller = await verifyIdToken(authHeader);
    await assertAdmin(caller.uid, caller.email);

    const users = await listAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list users" },
      { status: 403 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") ?? undefined;
    const caller = await verifyIdToken(authHeader);
    await assertAdmin(caller.uid, caller.email);

    const body = await request.json();
    const targetUid = String(body.uid ?? "");
    const role = body.role as UserRole;

    if (!targetUid) {
      throw new Error("Target user id is required");
    }

    if (role !== "admin" && role !== "user") {
      throw new Error("Role must be 'admin' or 'user'");
    }

    const updated = await updateUserRole({ targetUid, role });
    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update role" },
      { status: 400 }
    );
  }
}

