import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

type AdminApp = App & { projectId?: string };

// Initialize Firebase Admin with error handling
let firebaseAdminApp: AdminApp;

try {
  const existingApp = getApps()[0] as AdminApp | undefined;
  
  if (existingApp) {
    firebaseAdminApp = existingApp;
  } else {
    // Validate required environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Firebase Admin initialization error: Missing required environment variables");
      console.error("Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
      throw new Error(
        "Firebase Admin SDK not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables."
      );
    }

    firebaseAdminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
      projectId,
    }) as AdminApp;
    
    console.log("Firebase Admin initialized successfully");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
  throw error;
}

export const adminAuth = getAuth(firebaseAdminApp);
export const adminDb = getFirestore(firebaseAdminApp);

