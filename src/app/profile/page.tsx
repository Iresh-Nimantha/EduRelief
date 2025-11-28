import { RequireAuth } from "@/components/auth/RequireAuth";
import { ProfilePanel } from "@/components/auth/ProfilePanel";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <header className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Your space
        </p>
        <h1 className="text-4xl font-semibold text-zinc-900">Profile</h1>
      </header>

      <RequireAuth>
        <ProfilePanel />
      </RequireAuth>
    </div>
  );
}

