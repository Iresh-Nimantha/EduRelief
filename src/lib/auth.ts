import { adminAuth } from "./firebase/admin";
import { isFirebaseIamMember } from "./firebase-iam";

export async function verifyIdToken(
  authHeader?: string
): Promise<{ uid: string; name?: string | null; email?: string | null }> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing Authorization header");
  }

  const idToken = authHeader.replace("Bearer ", "").trim();
  const decoded = await adminAuth.verifyIdToken(idToken);

  return {
    uid: decoded.uid,
    name: decoded.name ?? decoded.email,
    email: decoded.email,
  };
}

/**
 * Assert that the user is an admin (Firebase IAM member)
 * Admins are determined solely by Firebase project IAM membership
 */
export async function assertAdmin(uid: string, email?: string | null) {
  if (!email) {
    throw new Error("Email is required to verify admin status");
  }

  const isIamMember = await isFirebaseIamMember(email);
  if (!isIamMember) {
    throw new Error("Only Firebase IAM members (admins) can perform this action");
  }
}

