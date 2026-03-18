"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

export function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-warm-300 bg-white">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-bold text-primary-600"
        >
          <span aria-hidden="true" className="text-accent-500">
            ◆
          </span>
          ourstory
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/fundraisers"
            className="rounded-lg px-3 py-2 text-sm font-medium text-warm-600 hover:bg-warm-100 hover:text-warm-900"
          >
            Browse
          </Link>
          {status === "authenticated" && session?.user ? (
            <>
              <Link
                href="/fundraiser/new"
                className="rounded-lg px-3 py-2 text-sm font-medium text-warm-600 hover:bg-warm-100 hover:text-warm-900"
              >
                Create
              </Link>
              <div className="ml-2 h-5 w-px bg-warm-300" />
              <Link
                href={`/profile/${(session.user as { username?: string }).username}`}
                className="ml-2 flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-warm-700 hover:bg-warm-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white ring-2 ring-accent-400">
                  {getInitials(session.user.name || "")}
                </span>
                {session.user.name}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <div className="ml-2 h-5 w-px bg-warm-300" />
              <Link href="/login" className="ml-2">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-warm-700 hover:bg-warm-100 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "border-t border-warm-300 bg-white md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="space-y-1 px-4 py-3">
          <Link
            href="/fundraisers"
            className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-warm-700 hover:bg-warm-100"
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse fundraisers
          </Link>
          {status === "authenticated" && session?.user ? (
            <>
              <Link
                href="/fundraiser/new"
                className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-warm-700 hover:bg-warm-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create a fundraiser
              </Link>
              <Link
                href={`/profile/${(session.user as { username?: string }).username}`}
                className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-warm-700 hover:bg-warm-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white ring-2 ring-accent-400">
                  {getInitials(session.user.name || "")}
                </span>
                My profile
              </Link>
              <button
                className="flex min-h-[44px] w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-warm-700 hover:bg-warm-100"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-warm-700 hover:bg-warm-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="flex min-h-[44px] items-center rounded-lg px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
