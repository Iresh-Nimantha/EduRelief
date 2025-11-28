import { RequireAuth } from "@/components/auth/RequireAuth";

function SettingsContent() {
  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow">
      <div>
        <h2 className="text-xl font-semibold text-zinc-900">Security notes</h2>
        <p className="text-sm text-zinc-500">
          GitHub Personal Access Tokens never leave the server. Update your
          .env.local file to rotate credentials when needed.
        </p>
      </div>
      <ul className="list-disc space-y-3 pl-5 text-sm text-zinc-600">
        <li>Use Firebase Auth for uploads, edits, and deletions.</li>
        <li>Guests can browse, search, and download without login.</li>
        <li>All uploads commit to GitHub using the server-only PAT.</li>
      </ul>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <header className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Platform settings
        </p>
        <h1 className="text-4xl font-semibold text-zinc-900">Security</h1>
      </header>
      <RequireAuth>
        <SettingsContent />
      </RequireAuth>
    </div>
  );
}

