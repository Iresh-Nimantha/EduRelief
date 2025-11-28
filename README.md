## EduRelief — Sri Lanka Learning Support Network

Next.js 16 App Router project that brings together:

- Firebase Authentication (client) for secure uploads
- Firestore (via Firebase Admin in API routes) for metadata
- GitHub repository storage using a server-only Personal Access Token (PAT)
- Tailwind CSS 4 utility classes for a clean, responsive UI

Guests can browse, search, and download freely. Logged-in users can upload, edit, and delete *only* their own entries.

---

## Project structure

- `src/app` — Next.js routes (public pages + API routes)
- `src/components` — UI, auth, layout, and note modules
- `src/lib` — Firebase client/admin initializers, GitHub helpers, validation, Firestore helpers
- `src/types` — shared TypeScript types

---

## Environment variables

Copy `.env.example` → `.env.local` and populate:

```
# GitHub (server only)
GITHUB_TOKEN=ghp_xxx
GITHUB_USERNAME=yourusername
GITHUB_REPO=edu-storage
GITHUB_BRANCH=main

# Firebase client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx

# Firebase Admin SDK (for token verification + Firestore writes)
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@xxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> ⚠️ Never expose `GITHUB_TOKEN` or admin credentials to the client. They are referenced only inside Next.js API routes.

---

## Firestore data model

```
notes (collection)
  noteId
    title, description, grade, subject
    filePath, fileUrl
    uploaderId, uploaderName
    uploadedAt (timestamp)

users (collection)
  uid
    name, email, createdAt
```

Security rules should allow read access to everyone, but write/delete access only to authenticated users operating on their own documents.

---

## Running locally

```bash
cd web
npm install
npm run dev
```

Visit `http://localhost:3000`.

---

## Deployment checklist

- Provide production Firebase keys + admin credentials via environment variables
- Configure GitHub PAT with `repo` scope and add it to the hosting provider secrets
- Ensure Firestore indexes exist for `grade`, `subject`, and `uploaderId` queries
- Confirm Firebase Auth providers (e.g., Google) are enabled in the Firebase console

---

## Key API routes

| Route | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/notes` | GET | No | List notes with optional grade/subject/search filters |
| `/api/notes/[id]` | GET | No | Fetch a single note document |
| `/api/upload` | POST | Yes | Validate Firebase ID token, commit file to GitHub, save metadata |
| `/api/delete/[id]` | DELETE | Yes | Only uploader can delete their note |

Uploads convert the file to Base64, push to GitHub, then persist metadata in Firestore. Downloads always use the GitHub raw URL and require no login.
