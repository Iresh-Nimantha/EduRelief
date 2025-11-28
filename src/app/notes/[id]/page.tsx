import Link from "next/link";
import { notFound } from "next/navigation";
import { getNoteById } from "@/lib/firestore";
import { use } from "react";

type NoteDetailsProps = {
  params: Promise<{ id: string }>; // params is now a Promise
};

export default async function NoteDetailsPage({ params }: NoteDetailsProps) {
  const resolvedParams = await params; // unwrap the Promise
  const note = await getNoteById(resolvedParams.id);

  if (!note) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-12">
      <div className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
          {note.grade} · {note.subject}
        </div>
        <h1 className="text-4xl font-semibold text-zinc-900">{note.title}</h1>
        <p className="text-lg text-zinc-600">{note.description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-zinc-500">
            Shared by
          </p>
          <p className="text-xl font-semibold text-zinc-900">
            {note.uploaderName}
          </p>
          <p className="text-sm text-zinc-500">
            Uploaded on {new Date(note.uploadedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-zinc-500">
            File storage
          </p>
          <p className="text-sm text-zinc-600">
            Stored securely on GitHub via server-side Personal Access Token.
          </p>
          <Link
            href={note.fileUrl}
            target="_blank"
            className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-emerald-500"
          >
            Download file
          </Link>
        </div>
      </div>
    </div>
  );
}
