import Link from "next/link";

const categories = [
  {
    key: "scholarship",
    label: "Scholarship",
    description: "Focused notes for scholarship exams",
    imageSrc: "/images/5.png",
    href: "/notes?category=scholarship",
  },
  {
    key: "ol",
    label: "Ordinary Level (OL)",
    description: "Comprehensive notes for Ordinary Level",
    imageSrc: "/images/ol.png",
    href: "/notes?category=ol",
  },
  {
    key: "al",
    label: "Advanced Level (AL)",
    description: "Notes for all Advanced Level streams",
    imageSrc: "/images/al.png",
    href: "/notes?category=al",
  },
  {
    key: "university",
    label: "University",
    description: "University-level study materials",
    imageSrc: "/images/uni.png",
    href: "/notes?category=university",
  },
];

export function SubjectsSection() {
  return (
    <section className="space-y-8 py-8">
      {" "}
      {/* Increased section spacing */}
      <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-emerald-600">
            Categories
          </p>
          <h2 className="text-3xl font-semibold text-zinc-900">
            {" "}
            Browse notes by education stage
          </h2>
        </div>
        <Link
          href="/notes"
          className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-600 hover:border-zinc-400"
        >
          View all notes
        </Link>
      </header>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
        {" "}
        {/* Increased gap */}
        {categories.map(({ key, label, description, imageSrc, href }) => (
          <Link
            key={key}
            href={href}
            className="group flex flex-col rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
          >
            <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-zinc-100 mb-6">
              {" "}
              {/* Taller image: h-48, added margin-bottom */}
              <img
                src={imageSrc}
                alt={`${label} cover`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 mb-2">
              {" "}
              {/* Bigger text */}
              {label}
            </h3>
            <p className="text-base text-zinc-600 leading-relaxed">
              {" "}
              {/* Bigger text, better line height */}
              {description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
