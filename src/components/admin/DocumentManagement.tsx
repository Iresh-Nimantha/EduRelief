"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { Note } from "@/types/note";

type DocumentWithStatus = Note & { isDeleting?: boolean };

export function DocumentManagement() {
  const { user, getToken } = useAuth();
  const [documents, setDocuments] = useState<DocumentWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");

  const refreshDocuments = useCallback(async () => {
    if (!user) {
      setDocuments([]);
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

      const params = new URLSearchParams();
      if (gradeFilter) params.append("grade", gradeFilter);
      if (subjectFilter) params.append("subject", subjectFilter);
      if (searchTerm) params.append("q", searchTerm);

      const response = await fetch(`/api/notes?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to load documents");
      }
      const data = (await response.json()) as { notes: Note[] };
      setDocuments(data.notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [getToken, user, gradeFilter, subjectFilter, searchTerm]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const handleDelete = async (document: DocumentWithStatus) => {
    if (!confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }

    setSuccess(null);
    setError(null);
    setDocuments((prev) =>
      prev.map((d) => (d.id === document.id ? { ...d, isDeleting: true } : d))
    );

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing session token");
      }

      const response = await fetch(`/api/admin/documents/${document.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to delete document");
      }

      setDocuments((prev) => prev.filter((d) => d.id !== document.id));
      setSuccess(`Document "${document.title}" deleted successfully.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete document");
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === document.id ? { ...d, isDeleting: false } : d
        )
      );
    }
  };

  const metrics = useMemo(() => {
    const total = documents.length;
    const uniqueGrades = new Set(documents.map((d) => d.grade)).size;
    const uniqueSubjects = new Set(documents.map((d) => d.subject)).size;
    return { total, uniqueGrades, uniqueSubjects };
  }, [documents]);

  // Get unique grades and subjects for filters
  const availableGrades = useMemo(
    () => Array.from(new Set(documents.map((d) => d.grade))).sort(),
    [documents]
  );
  const availableSubjects = useMemo(
    () => Array.from(new Set(documents.map((d) => d.subject))).sort(),
    [documents]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Total documents" value={metrics.total.toString()} />
        <MetricCard
          label="Grades"
          value={metrics.uniqueGrades.toString()}
        />
        <MetricCard
          label="Subjects"
          value={metrics.uniqueSubjects.toString()}
        />
      </section>

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <header className="mb-4 flex flex-col gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Document management
            </p>
            <h2 className="text-2xl font-semibold text-zinc-900">
              Manage all documents
            </h2>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">All Grades</option>
              {availableGrades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="">All Subjects</option>
              {availableSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <button
              onClick={refreshDocuments}
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-400"
            >
              Refresh
            </button>
          </div>
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
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">
            No documents found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-100 text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  <th className="py-3">Title</th>
                  <th className="py-3">Description</th>
                  <th className="py-3">Grade</th>
                  <th className="py-3">Subject</th>
                  <th className="py-3">Uploader</th>
                  <th className="py-3">Uploaded</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="text-zinc-700">
                    <td className="py-4 font-medium">{doc.title}</td>
                    <td className="py-4 text-zinc-500 max-w-xs truncate">
                      {doc.description}
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                        {doc.grade}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
                        {doc.subject}
                      </span>
                    </td>
                    <td className="py-4 text-zinc-500">{doc.uploaderName}</td>
                    <td className="py-4 text-zinc-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600 hover:border-zinc-400"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleDelete(doc)}
                          disabled={doc.isDeleting}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-700 hover:border-red-400 disabled:opacity-40"
                        >
                          {doc.isDeleting ? "Deleting..." : "Delete"}
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

