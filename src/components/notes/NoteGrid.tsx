import { Note } from "@/types/note";
import { NoteCard } from "./NoteCard";

export function NoteGrid({ notes }: { notes: Note[] }) {
  // Always show only latest 2 notes
  const latestNotes = notes.slice(0, 2);

  if (!latestNotes.length) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-12 text-center text-zinc-500">
        No notes yet. Be the first to upload!
      </p>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {latestNotes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
