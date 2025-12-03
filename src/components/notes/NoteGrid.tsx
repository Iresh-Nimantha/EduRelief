import { Note } from "@/types/note";
import { NoteCard } from "./NoteCard";

export function NoteGrid({ 
  notes, 
  limit 
}: { 
  notes: Note[]; 
  limit?: number;
}) {
  // If limit is provided, show only that many notes, otherwise show all
  const displayedNotes = limit !== undefined ? notes.slice(0, limit) : notes;

  if (!displayedNotes.length) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-12 text-center text-zinc-500">
        No notes yet. Be the first to upload!
      </p>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {displayedNotes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
