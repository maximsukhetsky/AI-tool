import Link from "next/link";
import { Suspense } from "react";

import { AppNav } from "@/components/AppNav";
import { Logo } from "@/components/Logo";
import { NavLinks } from "@/components/NavLinks";
import { UserMenu } from "@/components/UserMenu";

export function AppHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold whitespace-nowrap">
            <Logo />
            <span className="sr-only sm:not-sr-only">Writing AI Tool</span>
          </Link>
          <Suspense fallback={<NavLinks />}>
            <AppNav />
          </Suspense>
        </div>
        <Suspense fallback={<span className="h-4 w-32 animate-pulse rounded bg-muted" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
