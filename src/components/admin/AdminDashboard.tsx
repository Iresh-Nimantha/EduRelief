"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { UserProfile, UserRole } from "@/types/user";

type DashboardUser = UserProfile & { isUpdating?: boolean };

export function AdminDashboard() {
  const { user, getToken } = useAuth();
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    if (!user) {
      setUsers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing session token");
      }
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load users");
      }
      const data = (await response.json()) as { users: UserProfile[] };
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [getToken, user]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const handleRoleChange = async (target: DashboardUser, role: UserRole) => {
    if (target.role === role || role === "owner") return;
    setSuccess(null);
    setError(null);
    setUsers((prev) =>
      prev.map((u) => (u.uid === target.uid ? { ...u, isUpdating: true } : u))
    );
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing session token");
      }
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid: target.uid, role }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to update role");
      }
      const data = (await response.json()) as { user: UserProfile };
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === target.uid ? { ...data.user, isUpdating: false } : u
        )
      );
      setSuccess(`${data.user.name} is now ${data.user.role}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === target.uid ? { ...u, isUpdating: false } : u
        )
      );
    }
  };

  const metrics = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.role === "admin").length;
    const owner = users.find((u) => u.role === "owner");
    return { total, admins, ownerName: owner?.name ?? "—" };
  }, [users]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total users" value={metrics.total.toString()} />
        <MetricCard label="Admins" value={metrics.admins.toString()} />
        <MetricCard label="Owner" value={metrics.ownerName} />
      </section>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <header className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Role management
            </p>
            <h2 className="text-2xl font-semibold text-zinc-900">
              Promote or revoke admin access
            </h2>
          </div>
          <button
            onClick={refreshUsers}
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-400"
          >
            Refresh list
          </button>
        </header>

        {error && (
          <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </p>
        )}

        {loading ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">
            Loading user directory...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-100 text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="py-3">Name</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Role</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {users.map((u) => (
                  <tr key={u.uid} className="text-zinc-700">
                    <td className="py-4 font-medium">{u.name}</td>
                    <td className="py-4 text-zinc-500">{u.email}</td>
                    <td className="py-4">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleRoleChange(u, "admin")}
                          disabled={
                            u.role === "owner" ||
                            u.role === "admin" ||
                            u.isUpdating
                          }
                          className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 disabled:opacity-40"
                        >
                          Make admin
                        </button>
                        <button
                          onClick={() => handleRoleChange(u, "user")}
                          disabled={
                            u.role === "owner" ||
                            u.role === "user" ||
                            u.isUpdating
                          }
                          className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 disabled:opacity-40"
                        >
                          Revoke admin
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-zinc-900">{value}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    owner: "bg-amber-100 text-amber-800",
    admin: "bg-emerald-100 text-emerald-800",
    user: "bg-zinc-100 text-zinc-600",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[role]}`}>
      {role.toUpperCase()}
    </span>
  );
}

