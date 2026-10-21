"use client";

import { useLinkStatus } from "next/link";

import { cn } from "@/lib/utils";

// Rendered inside a <Link>: a thin bar under the label while its navigation is pending.
export function NavLinkPendingIndicator() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-x-2.5 bottom-0.5 h-0.5 rounded-full bg-foreground/40 opacity-0 transition-opacity",
        pending && "animate-pulse opacity-100",
      )}
    />
  );
}
