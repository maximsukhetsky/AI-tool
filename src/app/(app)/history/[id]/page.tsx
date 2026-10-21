import type { Metadata } from "next";
import { Suspense } from "react";

import { GenerationDetail } from "@/components/history/GenerationDetail";

// Static on purpose: a per-generation title would cost an extra database query.
export const metadata: Metadata = {
  title: "Generation",
};

export default function GenerationPage({ params }: PageProps<"/history/[id]">) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="sr-only">Generation</h1>
      <Suspense fallback={<div aria-hidden className="h-64 animate-pulse rounded-lg bg-muted" />}>
        <GenerationDetail params={params} />
      </Suspense>
    </section>
  );
}
