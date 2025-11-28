import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Note } from "@/types/note";

export function NoteCard({ note }: { note: Note }) {
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
          <span>{note.grade}</span>
          <span className="h-1 w-1 rounded-full bg-emerald-200" />
          <span>{note.subject}</span>
        </div>
        <h3 className="text-xl font-semibold text-zinc-900">{note.title}</h3>
        <p className="line-clamp-3 text-sm text-zinc-600">{note.description}</p>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-zinc-500">
        <div className="flex flex-col">
          <span>{note.uploaderName}</span>
          <span>
            {formatDistanceToNow(new Date(note.uploadedAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <div className="flex gap-2 text-sm font-medium">
          <Link
            href={note.fileUrl}
            target="_blank"
            className="rounded-full border border-zinc-200 px-3 py-1 hover:bg-zinc-100"
          >
            Download
          </Link>
          <Link
            href={`/notes/${note.id}`}
            className="rounded-full bg-zinc-900 px-3 py-1 text-white hover:bg-zinc-700"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

