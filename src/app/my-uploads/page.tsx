import { RequireAuth } from "@/components/auth/RequireAuth";
import { MyUploadsView } from "@/components/notes/MyUploadsView";

export default function MyUploadsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <header className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
          Your uploads
        </p>
        <h1 className="text-4xl font-semibold text-zinc-900">
          Manage your study notes
        </h1>
        <p className="text-sm text-zinc-500">
          You can edit metadata via Firestore or delete files directly here.
        </p>
      </header>

      <RequireAuth>
        <MyUploadsView />
      </RequireAuth>
    </div>
  );
}

