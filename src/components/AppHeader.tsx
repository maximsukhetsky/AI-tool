import Link from "next/link";
import { Suspense } from "react";

import { Logo } from "@/components/Logo";
import { UserMenu } from "@/components/UserMenu";

export function AppHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold whitespace-nowrap">
          <Logo />
          AI Writing Tool
        </Link>
        <Suspense fallback={<span className="h-4 w-32 animate-pulse rounded bg-muted" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
