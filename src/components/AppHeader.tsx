import Link from "next/link";
import { Suspense } from "react";

import { UserMenu } from "@/components/UserMenu";

export function AppHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold">
          AI Writing Tool
        </Link>
        <Suspense fallback={<span className="h-4 w-32 animate-pulse rounded bg-muted" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
