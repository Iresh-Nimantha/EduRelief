import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { AppFooter } from "./AppFooter";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <AppHeader />
      <main className="flex-1 bg-gradient-to-b from-white to-zinc-100">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}

