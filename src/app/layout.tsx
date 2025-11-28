import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { PageShell } from "@/components/layout/PageShell";

// Use the variable name for CSS
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap", // optional, ensures smooth font rendering
});

export const metadata: Metadata = {
  title: "EduRelief — Sri Lanka Learning Support",
  description:
    "Collaborative notes platform for Sri Lankan students powered by Next.js, Firebase, and GitHub.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <AuthProvider>
          <PageShell>{children}</PageShell>
        </AuthProvider>
      </body>
    </html>
  );
}
