"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchInput({ placeholder }: { placeholder?: string }) {
  const router = useRouter();
  const search = useSearchParams();
  const [value, setValue] = useState(search.get("q") ?? "");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(search.toString());
    if (!value) {
      params.delete("q");
    } else {
      params.set("q", value);
    }
    router.push(`/notes?${params.toString()}`);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-sm"
    >
      <svg
        className="h-5 w-5 text-zinc-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M11 4.5a6.5 6.5 0 016.5 6.5 6.5 6.5 0 11-6.5-6.5zm0 0v0m6.5 6.5L20 19"
        />
      </svg>
      <input
        type="search"
        placeholder={placeholder ?? "Search notes"}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="flex-1 border-none bg-transparent text-sm focus:outline-none"
      />
    </form>
  );
}

