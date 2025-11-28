import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { OwnerGate } from "@/components/auth/OwnerGate";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <header className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Owner tools
        </p>
        <h1 className="text-4xl font-semibold text-zinc-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-zinc-500">
          Log in with the Firebase owner account to review every synced user and
          promote trusted collaborators to admin status.
        </p>
      </header>

      <RequireAuth>
        <OwnerGate>
          <AdminDashboard />
        </OwnerGate>
      </RequireAuth>
    </div>
  );
}


