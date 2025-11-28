"use client";

import { useAuth } from "../providers/AuthProvider";

export function ProfilePanel() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Profile
        </p>
        <h2 className="text-3xl font-semibold text-zinc-900">
          {user.displayName ?? "Anonymous Learner"}
        </h2>
        <p className="text-sm text-zinc-500">{user.email}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info label="User ID" value={user.uid} />
          <Info
            label="Last sign-in"
            value={
              user.metadata.lastSignInTime
                ? new Date(user.metadata.lastSignInTime).toLocaleString()
                : "N/A"
            }
          />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-zinc-800 break-all">{value ?? "—"}</p>
    </div>
  );
}

