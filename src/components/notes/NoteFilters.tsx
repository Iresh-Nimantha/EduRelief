"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const categories = [
  {
    key: "grade",
    label: "Grade Level",
    sections: [
      {
        level: "Scholarship",
        options: ["Scholarship"],
      },
      {
        level: "Ordinary Level (OL)",
        options: ["10", "11", "OL"],
      },
      {
        level: "Advanced Level (AL)",
        options: ["AL-Science", "AL-Commerce", "AL-Arts", "AL-Technology"],
      },
      {
        level: "University",
        options: ["University"],
      },
    ],
  },
  {
    key: "subject",
    label: "Subject",
    sections: [
      {
        level: "Scholarship",
        options: [
          "Scholarship-Maths",
          "Scholarship-Science",
          "Scholarship-English",
          "Scholarship-Reasoning",
          "Scholarship-Sinhala",
          "Scholarship-Tamil",
        ],
      },
      {
        level: "Ordinary Level (OL)",
        options: [
          "Maths",
          "Science",
          "English",
          "Sinhala",
          "Tamil",
          "ICT",
          "History",
          "Geography",
          "Religion-Buddhism",
          "Religion-Christianity",
          "Religion-Islam",
          "Religion-Hinduism",
          "Business-Accounting",
          "Commerce",
          "Economics-OL",
          "Health-Science",
          "Beauty-Care",
          "Food-Technology",
        ],
      },
      {
        level: "Advanced Level (AL)",
        options: [
          // Science Stream
          "Biology",
          "Chemistry",
          "Physics",
          "Combined-Mathematics",
          "Higher-Mathematics",
          // Commerce Stream
          "Accounting",
          "Business-Studies",
          "Economics-AL",
          "Logic-Scientific-Method",
          // Arts Stream
          "Political-Science",
          "Geography-AL",
          "History-AL",
          "Communication-Media",
          "Sinhala-Literature",
          "Tamil-Literature",
          "English-Literature",
          "Drama-Theatre",
          "Dancing",
          "Music",
          "Art",
          "Entrepreneurship",
          // Technology Stream
          "Civil-Technology",
          "Electrical-Technology",
          "Mechanical-Technology",
          "Bio-system-Technology",
          "Science-for-Technology",
        ],
      },
      {
        level: "University",
        options: [
          "University-Maths",
          "University-Physics",
          "University-Chemistry",
          "University-Engineering",
          "University-Medicine",
          "University-Law",
          "University-Management",
          "University-IT",
          // Additional Subjects
          "Agriculture",
          "Aquatic-Resources",
        ],
      },
    ],
  },
];

export function NoteFilters() {
  const router = useRouter();
  const search = useSearchParams();

  const activeFilters = {
    grade: search.get("grade") ?? "",
    subject: search.get("subject") ?? "",
  } as const;

  const [openSection, setOpenSection] = useState<"grade" | "subject" | null>(
    null
  );

  const updateFilter = (key: keyof typeof activeFilters, value: string) => {
    const params = new URLSearchParams(search.toString());
    if (!value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/notes?${params.toString()}`, { scroll: false });
  };

  const toggleSection = (section: "grade" | "subject") => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="w-full space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900">Filters</h2>

      {categories.map(({ key, label, sections }) => {
        const typedKey = key as keyof typeof activeFilters;

        return (
          <div
            key={key}
            className="border rounded-2xl border-zinc-300 bg-white shadow-sm"
          >
            <button
              onClick={() => toggleSection(typedKey)}
              className="flex w-full items-center justify-between p-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-all duration-200"
              aria-expanded={openSection === typedKey}
              aria-controls={`${key}-filters`}
            >
              <span className="font-bold">{label}</span>
              <svg
                className={`h-5 w-5 transform transition-transform duration-300 ${
                  openSection === typedKey ? "rotate-180" : "rotate-0"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              id={`${key}-filters`}
              className={`overflow-hidden px-4 pb-4 transition-all duration-500 ease-in-out ${
                openSection === typedKey
                  ? "max-h-[2000px] opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              {sections.map((section) => (
                <div key={section.level} className="mt-4">
                  <h4 className="text-xs font-semibold text-zinc-500 mb-2">
                    {section.level}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <FilterChip
                      label="All"
                      active={!activeFilters[typedKey]}
                      onClick={() => updateFilter(typedKey, "")}
                    />
                    {section.options.map((option, index) => (
                      <FilterChip
                        key={`${typedKey}-${option}-${index}`}
                        label={option}
                        active={activeFilters[typedKey] === option}
                        onClick={() => updateFilter(typedKey, option)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 shadow-sm ${
        active
          ? "border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 shadow-emerald-200"
          : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm"
      }`}
    >
      {label}
    </button>
  );
}
