"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/notes", label: "Notes" },
  { href: "/upload", label: "Upload" },
  { href: "/my-uploads", label: "My Uploads" },
];

export function AppHeader() {
  const pathname = usePathname();
  const { user, userRole, login, logout, loading } = useAuth();
  const isAdmin = userRole === "admin";
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const getButtonClasses = (isLogout: boolean) =>
    cn(
      "rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-colors", // Reduced py & font size
      isLogout
        ? "bg-red-600 hover:bg-red-500"
        : "bg-emerald-600 hover:bg-emerald-500"
    );

  const DrawerList = (
    <Box sx={{ width: 280 }} role="presentation" onClick={toggleDrawer(false)}>
      <div className="p-6 border-b flex items-center space-x-3">
        <Image
          src="/images/icon.png"
          alt="EduRelief"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <div>
          <h2 className="font-semibold tracking-tight text-zinc-900">
            EduRelief
          </h2>
          <p className="text-sm text-zinc-500">Study made simple</p>
        </div>
      </div>

      <List className="p-0">
        {navLinks.map((link) => {
          const selected = pathname === link.href;
          return (
            <ListItem key={link.href} disablePadding>
              <ListItemButton
                href={link.href}
                component={Link}
                onClick={toggleDrawer(false)}
                className={cn(
                  "w-full rounded-lg transition-colors",
                  selected ? "bg-emerald-100" : "hover:bg-zinc-100"
                )}
                sx={{
                  "&:hover": {
                    backgroundColor: selected ? "#D1FAE5" : "#F3F3F3", // Light hover/selected bg
                  },
                }}
              >
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    className: cn(
                      "text-base font-medium",
                      selected ? "text-emerald-700" : "text-zinc-700"
                    ),
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {isAdmin && (
        <>
          <Divider />
          <List className="p-0">
            <ListItem disablePadding>
              <ListItemButton
                href="/dashboard"
                component={Link}
                onClick={toggleDrawer(false)}
                className={cn(
                  "w-full",
                  pathname === "/dashboard" && "bg-emerald-600"
                )}
                sx={{
                  "&:hover": {
                    backgroundColor:
                      pathname === "/dashboard" ? "#10B981" : "#F0FDF4",
                  },
                }}
              >
                <ListItemText
                  primary="Dashboard"
                  primaryTypographyProps={{
                    className: cn(
                      "text-base font-medium",
                      pathname === "/dashboard"
                        ? "text-white"
                        : "text-emerald-700"
                    ),
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}

      <Divider />
      <div className="p-6 space-y-3">
        {user && (
          <Link
            href="/profile"
            onClick={toggleDrawer(false)}
            className="block w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            {user.displayName ?? "Profile"}
          </Link>
        )}

        {/* Logout/Login button */}
        <button
          onClick={() => {
            user ? logout() : login();
            setOpen(false);
          }}
          disabled={loading}
          className="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : user ? "Log out" : "Log in"}
        </button>
      </div>
    </Box>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand with Icon */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/images/icon.png"
            alt="EduRelief"
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl object-contain"
            priority
          />
          <div className="hidden sm:block">
            <h1 className="font-semibold tracking-tight text-zinc-900">
              EduRelief
            </h1>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-4 text-sm font-medium text-zinc-600 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-4 py-2 transition",
                pathname === link.href
                  ? "bg-zinc-200 text-white"
                  : "hover:bg-zinc-100"
              )}
            >
              {link.label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/dashboard"
              className={cn(
                "rounded-full px-4 py-2 transition",
                pathname === "/dashboard"
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-emerald-50 text-emerald-600"
              )}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden items-center gap-3 md:flex">
          {user && (
            <Link
              href="/profile"
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              {user.displayName ?? "Profile"}
            </Link>
          )}

          <button
            onClick={() => (user ? logout() : login())}
            disabled={loading}
            className={getButtonClasses(!!user)}
          >
            {loading ? "..." : user ? "Log out" : "Log in"}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden rounded-lg p-2 hover:bg-zinc-100"
          onClick={toggleDrawer(true)}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
          >
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* MUI Mobile Drawer */}
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </header>
  );
}
