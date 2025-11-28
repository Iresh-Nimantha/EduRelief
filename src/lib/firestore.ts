import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebase/admin";
import { Note, NoteInput } from "@/types/note";
import { UserProfile, UserRole } from "@/types/user";
import { isFirebaseIamMember } from "./firebase-iam";

const notesCollection = adminDb.collection("notes");
const usersCollection = adminDb.collection("users");

export async function listNotes(filters?: {
  grade?: string;
  subject?: string;
  uploaderId?: string;
  searchTerm?: string;
}) {
  let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
    notesCollection;

  const hasCollectionFilters = Boolean(
    filters?.grade || filters?.subject || filters?.uploaderId
  );

  if (!hasCollectionFilters) {
    query = query.orderBy("uploadedAt", "desc");
  }

  if (filters?.grade) {
    query = query.where("grade", "==", filters.grade);
  }

  if (filters?.subject) {
    query = query.where("subject", "==", filters.subject);
  }

  if (filters?.uploaderId) {
    query = query.where("uploaderId", "==", filters.uploaderId);
  }

  const snapshot = await query.get();
  let notes = snapshot.docs.map(mapNote);

  if (hasCollectionFilters) {
    notes = notes.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  if (filters?.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(term) ||
        note.description.toLowerCase().includes(term)
    );
  }

  return notes;
}

export async function getNoteById(id: string) {
  const doc = await notesCollection.doc(id).get();
  if (!doc.exists) return null;
  return mapNote(doc);
}

export async function createNote({
  data,
  filePath,
  fileUrl,
  uploaderId,
  uploaderName,
}: {
  data: NoteInput;
  filePath: string;
  fileUrl: string;
  uploaderId: string;
  uploaderName: string;
}) {
  const docRef = await notesCollection.add({
    ...data,
    filePath,
    fileUrl,
    uploaderId,
    uploaderName,
    uploadedAt: FieldValue.serverTimestamp(),
  });

  const saved = await docRef.get();
  return mapNote(saved);
}

export async function deleteNote(id: string, userId: string) {
  const docRef = notesCollection.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error("Note not found");
  }

  const data = doc.data();
  if (data?.uploaderId !== userId) {
    throw new Error("You can only delete your own note");
  }

  await docRef.delete();
  return mapNote(doc);
}

function mapNote(
  doc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
): Note {
  const data = doc.data()!;
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    grade: data.grade,
    subject: data.subject,
    filePath: data.filePath,
    fileUrl: data.fileUrl,
    uploaderId: data.uploaderId,
    uploaderName: data.uploaderName ?? "Unknown",
    uploadedAt: toISOString(data.uploadedAt),
  };
}

function toISOString(value: Timestamp | FieldValue | undefined) {
  if (!value) return new Date().toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return new Date().toISOString();
}

export async function syncUserProfile({
  uid,
  name,
  email,
}: {
  uid: string;
  name?: string | null;
  email?: string | null;
}) {
  if (!email) {
    throw new Error("Email is required to sync profile");
  }

  const docRef = usersCollection.doc(uid);
  const snapshot = await docRef.get();
  
  // Check if user is a Firebase IAM member (project admin)
  // Firebase IAM membership is the source of truth for admin status
  let isIamMember = false;
  try {
    isIamMember = await isFirebaseIamMember(email);
    console.log(`[syncUserProfile] IAM check for ${email}: ${isIamMember}`);
  } catch (error) {
    console.error(`[syncUserProfile] Error checking IAM for ${email}:`, error);
    // Continue with non-admin role if IAM check fails
  }
  
  // Determine role: IAM members are always admins, others are users
  // Note: We don't store admin role in Firestore for IAM members since IAM is the source of truth
  // But we return admin role in the profile so the client knows
  let storedRole: UserRole;
  if (isIamMember) {
    // IAM members are admins, but we store "user" in Firestore since IAM is authoritative
    // The getUserRole function will check IAM first anyway
    storedRole = "user";
  } else {
    // Non-IAM members use their stored role or default to user
    storedRole = (snapshot.data()?.role as UserRole) ?? "user";
  }

  const payload = {
    name: name ?? email,
    email,
    role: storedRole,
    createdAt: snapshot.exists
      ? snapshot.data()?.createdAt ?? FieldValue.serverTimestamp()
      : FieldValue.serverTimestamp(),
  };

  await docRef.set(payload, { merge: true });
  const saved = await docRef.get();
  
  // Return profile with correct role (checking IAM if needed)
  const profile = mapUser(saved);
  // Override role if user is IAM member
  if (isIamMember) {
    profile.role = "admin";
  }
  return profile;
}

export async function listAllUsers() {
  const snapshot = await usersCollection.orderBy("createdAt", "desc").get();
  const users = snapshot.docs.map(mapUser);
  
  // Enrich users with IAM-based admin status
  // Firebase IAM membership is the source of truth for admin status
  const enrichedUsers = await Promise.all(
    users.map(async (user) => {
      if (user.email) {
        const isIamMember = await isFirebaseIamMember(user.email);
        if (isIamMember) {
          return { ...user, role: "admin" as UserRole };
        }
      }
      return user;
    })
  );
  
  return enrichedUsers;
}

export async function updateUserRole({
  targetUid,
  role,
}: {
  targetUid: string;
  role: Exclude<UserRole, "owner">;
}) {
  const docRef = usersCollection.doc(targetUid);
  const snapshot = await docRef.get();
  if (!snapshot.exists) {
    throw new Error("User profile not found");
  }

  const userData = snapshot.data()!;
  const currentRole = userData.role as UserRole;
  const userEmail = userData.email as string | undefined;

  if (currentRole === "owner") {
    throw new Error("Cannot modify the owner role");
  }

  // Prevent manually setting admin role - admin status is determined by Firebase IAM membership
  if (role === "admin") {
    // Check if user is actually an IAM member
    if (userEmail) {
      const isIamMember = await isFirebaseIamMember(userEmail);
      if (!isIamMember) {
        throw new Error("Cannot manually set admin role. Admin status is determined by Firebase IAM membership.");
      }
    } else {
      throw new Error("Cannot manually set admin role. Admin status is determined by Firebase IAM membership.");
    }
  }

  await docRef.set({ role }, { merge: true });
  const saved = await docRef.get();
  return mapUser(saved);
}

export async function getUserRole(uid: string, email?: string | null): Promise<UserRole> {
  // First check if user is a Firebase IAM member - they are always admins
  if (email) {
    const isIamMember = await isFirebaseIamMember(email);
    if (isIamMember) {
      return "admin";
    }
  }
  
  // Otherwise, check Firestore role
  const doc = await usersCollection.doc(uid).get();
  if (!doc.exists) {
    return "user";
  }
  return (doc.data()?.role as UserRole) ?? "user";
}

function mapUser(
  doc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
): UserProfile {
  const data = doc.data()!;
  // Note: The role returned here is from Firestore, but getUserRole() will check IAM first
  // For IAM members, their role should be determined by calling getUserRole() instead
  return {
    uid: doc.id,
    name: data.name,
    email: data.email,
    role: (data.role as UserRole) ?? "user",
    createdAt: toISOString(data.createdAt),
  };
}
