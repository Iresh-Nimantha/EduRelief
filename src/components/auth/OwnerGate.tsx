"use client";

import { ReactNode } from "react";
import { useAuth } from "../providers/AuthProvider";

export function OwnerGate({ children }: { children: ReactNode }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
        Checking permissions...
      </div>
    );
  }

  if (!user || userRole !== "admin") {
    return (
      <div className="rounded-3xl border border-red-200 bg-white p-8 text-center text-sm text-red-600">
        Only admins can access this dashboard.
      </div>
    );
  }

  return <>{children}</>;
}

