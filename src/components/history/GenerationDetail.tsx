import { ArrowLeft, PencilLine } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteGenerationButton } from "@/components/history/DeleteGenerationButton";
import { FormattedDate } from "@/components/history/FormattedDate";
import { ModeSummary } from "@/components/history/ModeSummary";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getGeneration } from "@/lib/db/generations";
import { generationIdSchema, parseGenerationOptions } from "@/lib/schemas/history";
import { createClient } from "@/lib/supabase/server";

type GenerationDetailProps = {
  params: Promise<{ id: string }>;
};

export async function GenerationDetail({ params }: GenerationDetailProps) {
  await getCurrentUser();
  const id = generationIdSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const supabase = await createClient();
  // RLS returns nothing for another user's generation, so it 404s like a missing one.
  const generation = await getGeneration(supabase, id.data);
  if (!generation) notFound();

  const tokens = generation.input_tokens + generation.output_tokens;

  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/history" />}>
          <ArrowLeft />
          History
        </Button>
        <div className="flex items-center gap-2">
          <Button size="sm" nativeButton={false} render={<Link href={`/?from=${generation.id}`} />}>
            <PencilLine />
            Open in editor
          </Button>
          <DeleteGenerationButton id={generation.id} redirectTo="/history" />
        </div>
      </div>

      <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Mode</dt>
          <dd>
            <ModeSummary mode={generation.mode} options={parseGenerationOptions(generation.options)} />
          </dd>
        </div>
        <div className="flex gap-1.5 text-muted-foreground">
          <dt className="sr-only">Created</dt>
          <dd>
            <FormattedDate value={generation.created_at} />
          </dd>
        </div>
        <div className="flex gap-1.5 text-muted-foreground">
          <dt>Tokens:</dt>
          <dd className="tabular-nums">
            {tokens.toLocaleString("en-US")} ({generation.input_tokens.toLocaleString("en-US")} in /{" "}
            {generation.output_tokens.toLocaleString("en-US")} out)
          </dd>
        </div>
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="generation-input" className="flex min-w-0 flex-col gap-2">
          <h2 id="generation-input" className="text-sm font-medium">
            Input
          </h2>
          <div className="rounded-lg border p-3 text-sm whitespace-pre-wrap break-words">{generation.input}</div>
        </section>
        <section aria-labelledby="generation-output" className="flex min-w-0 flex-col gap-2">
          <h2 id="generation-output" className="text-sm font-medium">
            Result
          </h2>
          <div className="rounded-lg border bg-muted/30 p-3 text-sm whitespace-pre-wrap break-words">
            {generation.output}
          </div>
        </section>
      </div>
    </article>
  );
}
