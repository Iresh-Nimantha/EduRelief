import Link from "next/link";
import { listNotes } from "@/lib/firestore";
import { NoteGrid } from "@/components/notes/NoteGrid";
import { SubjectsSection } from "@/components/layout/SubjectsSection";

export default async function Home() {
  const notes = await listNotes();
  const featured = notes.slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className="relative flex h-screen items-center bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/hero.png')", // Replace with your hero image path
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="mx-auto z-10 flex max-w-6xl flex-col gap-16 px-6 py-16 md:flex-row md:items-center">
          {/* Left Content */}
          <div className="space-y-6 text-white md:w-1/2">
            <p className="text-sm font-semibold uppercase text-emerald-300">
              Sri Lanka Learning Support Network
            </p>
            <h1 className="text-4xl font-semibold leading-tight">
              Access and share quality study material without paywalls.
            </h1>
            <p className="text-lg text-white/90">
              EduRelief combines Next.js, Firebase, and GitHub storage so every
              student can browse, search, and download notes freely. Uploaders
              use secure Firebase Auth and GitHub Access Tokens handled only on
              the server.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/upload"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-emerald-500"
              >
                Upload a note
              </Link>
              <Link
                href="/notes"
                className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:border-white"
              >
                Browse library
              </Link>
            </div>
          </div>

          {/* Right Content */}
          {/* <div className="rounded-3xl border text-white border-emerald-200/40  p-6 text-sm  md:w-1/2  shadow-sm">
            <h3 className="text-lg font-semibold text-emerald-800">
              Platform guarantees
            </h3>
            <ul className="mt-4 space-y-3 text-emerald-700">
              <li>• Guest access for browsing, searching, and downloading</li>
              <li>• Firebase Auth protected uploads & note management</li>
              <li>• GitHub repository for tamper-proof file storage</li>
              <li>• Firestore metadata powering filters & search</li>
            </ul>
          </div> */}
        </div>
      </section>

      {/* Latest Notes Section */}
      <section className="mx-auto max-w-6xl space-y-6 px-6 py-16">
        <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-emerald-600">Latest</p>
            <h2 className="text-2xl font-semibold text-zinc-900">
              Fresh uploads from the community
            </h2>
          </div>
          <Link
            href="/notes"
            className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:border-zinc-400"
          >
            View all notes
          </Link>
        </header>

        <NoteGrid notes={featured} />
        {/* Subjects Section */}
        <SubjectsSection />
      </section>
    </div>
  );
}
