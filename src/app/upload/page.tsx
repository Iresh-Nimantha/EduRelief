import { RequireAuth } from "@/components/auth/RequireAuth";
import { UploadForm } from "@/components/notes/UploadForm";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 px-6 py-12">
      <header className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
          Upload Center
        </p>
        <h1 className="text-4xl font-semibold text-zinc-900">
          Share your learning resources
        </h1>
        <p className="text-lg text-zinc-600">
          Uploads are protected by Firebase Auth. Files are committed to GitHub
          with a server-side Access Token and never exposed to guests.
        </p>
      </header>

      <RequireAuth>
        <UploadForm />
      </RequireAuth>
    </div>
  );
}

