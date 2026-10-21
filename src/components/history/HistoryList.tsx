import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { DeleteGenerationButton } from "@/components/history/DeleteGenerationButton";
import { FormattedDate } from "@/components/history/FormattedDate";
import { ModeSummary } from "@/components/history/ModeSummary";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { listGenerations } from "@/lib/db/generations";
import { historyPageSchema } from "@/lib/schemas/history";
import { createClient } from "@/lib/supabase/server";

type HistoryListProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function HistoryList({ searchParams }: HistoryListProps) {
  await getCurrentUser();
  const page = historyPageSchema.parse((await searchParams).page);
  const supabase = await createClient();
  const { items, total, pageCount } = await listGenerations(supabase, page);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-12 text-center">
        <p className="font-medium">No generations yet</p>
        <p className="text-sm text-muted-foreground">Everything you generate in the editor is saved here.</p>
        <Button nativeButton={false} render={<Link href="/" />}>
          Go to the editor
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">This page is empty.</p>
        <Button variant="outline" nativeButton={false} render={<Link href="/history" />}>
          Back to the first page
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-y rounded-lg border">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 p-3 sm:items-center">
            <Link
              href={`/history/${item.id}`}
              className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <ModeSummary mode={item.mode} />
                <span className="text-xs text-muted-foreground">
                  <FormattedDate value={item.created_at} />
                </span>
              </span>
              <span className="line-clamp-2 text-sm break-words">{item.preview}</span>
            </Link>
            <DeleteGenerationButton id={item.id} />
          </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-2">
          {page > 1 ? (
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/history?page=${page - 1}`} />}>
              <ChevronLeft />
              Newer
            </Button>
          ) : (
            <span />
          )}
          <span className="text-sm text-muted-foreground tabular-nums">
            Page {page} of {pageCount}
          </span>
          {page < pageCount ? (
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/history?page=${page + 1}`} />}>
              Older
              <ChevronRight />
            </Button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
