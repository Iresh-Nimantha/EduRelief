import { Linkedin } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="border-t border-black/5 bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-6 text-sm text-zinc-500 md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} EduRelief.</span>
        <span>Sri Lanka Learning Support Network</span>
        <span className="flex items-center gap-2">
          Made with <span className="text-red-500">❤️</span> Stay Safe |{" "}
          <a
            href="https://www.linkedin.com/in/ireshnimantha/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            <Linkedin size={28} />
          </a>
        </span>
      </div>
    </footer>
  );
}
