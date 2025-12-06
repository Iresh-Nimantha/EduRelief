import { adminAuth } from "./firebase/admin";
import { isFirebaseIamMember } from "./firebase-iam";

export async function verifyIdToken(
  authHeader?: string
): Promise<{ uid: string; name?: string | null; email?: string | null }> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing Authorization header");
  }

  const idToken = authHeader.replace("Bearer ", "").trim();
  
  if (!idToken || idToken.length === 0) {
    throw new Error("Invalid token: token is empty");
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true); // Check revoked tokens
    
    return {
      uid: decoded.uid,
      name: decoded.name ?? decoded.email,
      email: decoded.email,
    };
  } catch (error: any) {
    // Provide more specific error messages
    if (error?.code === "auth/id-token-expired") {
      throw new Error("Your session has expired. Please log in again.");
    }
    if (error?.code === "auth/id-token-revoked") {
      throw new Error("Your session has been revoked. Please log in again.");
    }
    if (error?.code === "auth/argument-error") {
      throw new Error("Invalid authentication token. Please log in again.");
    }
    // Re-throw with original message if it's a known error format
    throw new Error(error?.message || "Authentication failed. Please log in again.");
  }
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

