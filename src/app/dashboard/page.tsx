"use client";

import { useState } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { DocumentManagement } from "@/components/admin/DocumentManagement";
import { OwnerGate } from "@/components/auth/OwnerGate";
import { RequireAuth } from "@/components/auth/RequireAuth";

type Tab = "roles" | "documents";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("roles");

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <header className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          Admin tools
        </p>
        <h1 className="text-4xl font-semibold text-zinc-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-zinc-500">
          Manage user roles and documents from a centralized admin panel.
        </p>
      </header>

      <RequireAuth>
        <OwnerGate>
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b border-zinc-200">
              <button
                onClick={() => setActiveTab("roles")}
                className={`px-6 py-3 text-sm font-semibold transition-colors ${
                  activeTab === "roles"
                    ? "border-b-2 border-emerald-600 text-emerald-600"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Role Management
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`px-6 py-3 text-sm font-semibold transition-colors ${
                  activeTab === "documents"
                    ? "border-b-2 border-emerald-600 text-emerald-600"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Document Management
              </button>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "roles" && <AdminDashboard />}
              {activeTab === "documents" && <DocumentManagement />}
            </div>
          </div>
        </OwnerGate>
      </RequireAuth>
    </div>
  );
}


