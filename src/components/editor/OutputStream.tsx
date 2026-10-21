"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { GenerationStatus } from "@/hooks/use-generation";
import type { ChangeLevel } from "@/lib/text-similarity";

type OutputStreamProps = {
  status: GenerationStatus;
  output: string;
  error: string | null;
  truncated: boolean;
  stopCounted: boolean;
  // Set for in-place rewrites (improve, tone) once the generation is done.
  changeLevel: ChangeLevel | null;
  canRegenerate: boolean;
  onRegenerate: () => void;
};

export function OutputStream({
  status,
  output,
  error,
  truncated,
  stopCounted,
  changeLevel,
  canRegenerate,
  onRegenerate,
}: OutputStreamProps) {
  const [copied, setCopied] = useState(false);
  const streaming = status === "streaming";

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      // Clipboard access denied; the text stays selectable.
    }
  }

  return (
    <section aria-label="Result" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">Result</h2>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copy}
            disabled={!output || streaming}
          >
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={!canRegenerate || streaming}
          >
            <RotateCcw />
            Regenerate
          </Button>
        </div>
      </div>

      <div
        aria-live="polite"
        aria-busy={streaming}
        className="min-h-48 rounded-lg border bg-muted/30 p-3 text-sm whitespace-pre-wrap break-words"
      >
        {output ||
          (streaming ? (
            <span className="text-muted-foreground">Writing…</span>
          ) : (
            <span className="text-muted-foreground">The result will appear here.</span>
          ))}
        {streaming && output && (
          <span aria-hidden className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-foreground/60 align-text-bottom" />
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {status === "stopped" && (
        <p className="text-sm text-muted-foreground">
          {stopCounted
            ? "Stopped. The partial result was saved to history and counts toward today's limit."
            : "Stopped early. This generation doesn't count toward your limit."}
        </p>
      )}
      {changeLevel === "none" && (
        <p className="text-sm text-muted-foreground">No changes needed. Your text already reads well.</p>
      )}
      {changeLevel === "minor" && (
        <p className="text-sm text-muted-foreground">Only minor changes. Your text was already in good shape.</p>
      )}
      {status === "done" && truncated && (
        <p className="text-sm text-muted-foreground">
          The result hit the length limit and may be cut off.
        </p>
      )}
    </section>
  );
}
