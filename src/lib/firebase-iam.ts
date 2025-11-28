const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

// Cache for IAM members to avoid repeated API calls
let cachedIamMembers: Set<string> | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 1 * 60 * 1000; // 1 minute (reduced for testing, can increase later)

/**
 * Get an access token for Google Cloud APIs using service account
 */
async function getAccessToken(): Promise<string> {
  if (!clientEmail || !privateKey) {
    throw new Error("Firebase service account credentials not configured");
  }

  // Use Node.js crypto to create JWT
  const crypto = await import("crypto");
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: clientEmail,
    sub: clientEmail,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
    scope: "https://www.googleapis.com/auth/cloud-platform",
  };

  const base64UrlEncode = (str: string) => {
    return Buffer.from(str)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(signatureInput)
    .sign(privateKey, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const token = `${encodedHeader}.${encodedPayload}.${signature}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: token,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to get access token:", errorText);
    throw new Error("Failed to get access token");
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Fetch Firebase project IAM members
 */
async function fetchIamMembers(): Promise<Set<string>> {
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID not configured");
  }

  try {
    const accessToken = await getAccessToken();
    const url = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}:getIamPolicy`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to fetch IAM policy:", errorText);
      // Fallback: return empty set if API call fails
      return new Set();
    }

    const data = await response.json();
    const members = new Set<string>();

    // Extract email addresses from IAM bindings
    // IAM members are in format: "user:email@example.com" or "serviceAccount:..."
    if (data.bindings) {
      for (const binding of data.bindings) {
        if (binding.members) {
          for (const member of binding.members) {
            if (member.startsWith("user:")) {
              const email = member.replace("user:", "");
              members.add(email.toLowerCase());
            }
          }
        }
      }
    }

    console.log(`[fetchIamMembers] Found ${members.size} IAM members:`, Array.from(members));
    return members;
  } catch (error) {
    console.error("Error fetching IAM members:", error);
    // Return empty set on error to fail safely
    return new Set();
  }
}

/**
 * Check if an email is a Firebase project IAM member (with caching)
 */
export async function isFirebaseIamMember(email: string | null | undefined): Promise<boolean> {
  if (!email) {
    return false;
  }

  const now = Date.now();
  const emailLower = email.toLowerCase();
  
  // Refresh cache if expired
  if (!cachedIamMembers || now - cacheTimestamp > CACHE_TTL) {
    console.log(`[isFirebaseIamMember] Cache expired or empty, fetching IAM members...`);
    cachedIamMembers = await fetchIamMembers();
    cacheTimestamp = now;
  }

  const isMember = cachedIamMembers.has(emailLower);
  console.log(`[isFirebaseIamMember] Checking ${emailLower}: ${isMember} (cache has ${cachedIamMembers.size} members)`);
  return isMember;
}

/**
 * Get all Firebase IAM member emails (with caching)
 */
export async function getFirebaseIamMembers(): Promise<Set<string>> {
  const now = Date.now();
  
  // Refresh cache if expired
  if (!cachedIamMembers || now - cacheTimestamp > CACHE_TTL) {
    cachedIamMembers = await fetchIamMembers();
    cacheTimestamp = now;
  }

  return new Set(cachedIamMembers);
}

