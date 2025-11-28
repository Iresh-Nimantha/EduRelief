import { listNotes } from "@/lib/firestore";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { NoteFilters } from "@/components/notes/NoteFilters";
import { SearchInput } from "@/components/common/SearchInput";
import { Note } from "@/types/note";

type NotesPageProps = {
  searchParams: {
    grade?: string;
    subject?: string;
    q?: string;
  };
};

export default async function NotesPage({ searchParams }: NotesPageProps) {
  const params = await searchParams; // unwrap the Promise
  const notes = await listNotes({
    grade: params.grade ?? undefined,
    subject: params.subject ?? undefined,
    searchTerm: params.q ?? undefined,
  });

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[280px,1fr]">
      <aside className="space-y-8">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Find notes</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Filter by grade, subject, or search by keyword.
          </p>
          <div className="mt-4">
            <SearchInput placeholder="Search by topic..." />
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <NoteFilters />
        </div>
      </aside>

      <section className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            {notes.length} resources
          </p>
          <h1 className="text-3xl font-semibold text-zinc-900">
            Notes library
          </h1>
        </header>

        <NoteGrid notes={notes} />
      </section>
    </div>
  );
}
