"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

// Catches errors thrown while rendering a page (e.g. a failed Supabase query); the header stays usable.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-12 text-center"
    >
      <p className="font-medium">Something went wrong</p>
      <p className="max-w-md text-sm text-muted-foreground">
        This page couldn&apos;t be loaded. Check your connection and try again.
      </p>
      <Button type="button" variant="outline" onClick={reset}>
        <RotateCcw />
        Try again
      </Button>
    </div>
  );
}
