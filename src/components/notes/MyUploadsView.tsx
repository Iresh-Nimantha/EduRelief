"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Note } from "@/types/note";
import { useAuth } from "../providers/AuthProvider";

export function MyUploadsView() {
  const { user, getToken } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/notes?uploaderId=${user.uid}`);
        if (!response.ok) {
          throw new Error("Failed to fetch notes");
        }
        const data = await response.json();
        setNotes(data.notes ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing session. Please log in again.");
      }
      const response = await fetch(`/api/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Delete failed");
      }
      setNotes((current) => current.filter((note) => note.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500 shadow">
        Loading your uploads...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-white p-8 text-center text-sm text-red-500 shadow">
        {error}
      </div>
    );
  }

  if (!notes.length) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500 shadow">
        You have not uploaded any notes yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:flex-row md:items-center"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              {note.grade} · {note.subject}
            </p>
            <h3 className="text-xl font-semibold text-zinc-900">{note.title}</h3>
            <p className="text-sm text-zinc-500">{note.description}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={note.fileUrl}
              target="_blank"
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-400"
            >
              Download
            </Link>
            <button
              onClick={() => handleDelete(note.id)}
              className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

