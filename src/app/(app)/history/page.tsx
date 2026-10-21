import { Suspense } from "react";

import { HistoryList } from "@/components/history/HistoryList";
import { HistoryListSkeleton } from "@/components/history/HistoryListSkeleton";

export default function HistoryPage({ searchParams }: PageProps<"/history">) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">History</h1>
      <Suspense fallback={<HistoryListSkeleton />}>
        <HistoryList searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
