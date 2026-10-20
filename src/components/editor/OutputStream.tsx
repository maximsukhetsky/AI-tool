"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { GenerationStatus } from "@/hooks/use-generation";

type OutputStreamProps = {
  status: GenerationStatus;
  output: string;
  error: string | null;
  truncated: boolean;
  canRegenerate: boolean;
  onRegenerate: () => void;
};

export function OutputStream({
  status,
  output,
  error,
  truncated,
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
        <p className="text-sm text-muted-foreground">Generation stopped.</p>
      )}
      {status === "done" && truncated && (
        <p className="text-sm text-muted-foreground">
          The result hit the length limit and may be cut off.
        </p>
      )}
    </section>
  );
}
