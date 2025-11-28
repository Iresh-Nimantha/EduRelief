"use client";

import { ReactNode } from "react";
import { useAuth } from "../providers/AuthProvider";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, login } = useAuth();

  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 shadow">
        Checking your session...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow">
        <p className="text-lg font-semibold text-zinc-800">
          Log in to continue
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Uploading, editing, and deleting notes requires an EduRelief account.
        </p>
        <button
          onClick={login}
          className="mt-6 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-emerald-500"
        >
          Log in with Google
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

