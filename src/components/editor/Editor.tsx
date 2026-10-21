"use client";

import { Sparkles, Square } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { InputArea } from "@/components/editor/InputArea";
import { ModeOptions } from "@/components/editor/ModeOptions";
import { ModePicker } from "@/components/editor/ModePicker";
import { OutputStream } from "@/components/editor/OutputStream";
import { QuotaIndicator } from "@/components/editor/QuotaIndicator";
import { Button } from "@/components/ui/button";
import { useGeneration } from "@/hooks/use-generation";
import { DAILY_GENERATION_LIMIT, generateRequestSchema } from "@/lib/schemas/generate";
import type { EditorDraft } from "@/lib/schemas/history";
import { MINOR_CHANGE_NOTICE_MODES, type Mode, type Tone } from "@/lib/schemas/mode";
import { getChangeLevel } from "@/lib/text-similarity";

// Unvalidated draft of the request; generateRequestSchema decides whether it can be sent.
function toRequestDraft(
  mode: Mode,
  text: string,
  targetLanguage: string,
  targetTone: Tone | null,
): unknown {
  switch (mode) {
    case "translate":
      return { mode, text, options: { targetLanguage } };
    case "tone":
      return { mode, text, options: { targetTone } };
    default:
      return { mode, text };
  }
}

type EditorProps = {
  initialRemaining: number;
  // Prefilled state, e.g. when reopening a generation from history.
  initialDraft?: EditorDraft;
};

export function Editor({ initialRemaining, initialDraft }: EditorProps) {
  const [mode, setMode] = useState<Mode>(initialDraft?.mode ?? "improve");
  const [text, setText] = useState(initialDraft?.text ?? "");
  const [targetLanguage, setTargetLanguage] = useState(initialDraft?.targetLanguage ?? "");
  const [targetTone, setTargetTone] = useState<Tone | null>(initialDraft?.targetTone ?? null);
  const {
    status,
    output,
    error,
    truncated,
    stopCounted,
    lastRequest,
    remaining,
    generate,
    stop,
    regenerate,
  } = useGeneration(initialRemaining);

  const streaming = status === "streaming";
  // Computed once per finished generation, not on every keystroke.
  const changeLevel = useMemo(() => {
    if (status !== "done" || truncated || !lastRequest) return null;
    if (!(MINOR_CHANGE_NOTICE_MODES as readonly Mode[]).includes(lastRequest.mode)) return null;
    return getChangeLevel(lastRequest.text, output);
  }, [status, truncated, lastRequest, output]);
  const quotaExhausted = remaining <= 0;
  const parsed = generateRequestSchema.safeParse(
    toRequestDraft(mode, text, targetLanguage, targetTone),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (parsed.success && !streaming && !quotaExhausted) void generate(parsed.data);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <ModePicker value={mode} onChange={setMode} disabled={streaming} />
        <ModeOptions
          mode={mode}
          targetLanguage={targetLanguage}
          onTargetLanguageChange={setTargetLanguage}
          targetTone={targetTone}
          onTargetToneChange={setTargetTone}
          disabled={streaming}
        />
        <InputArea value={text} onChange={setText} disabled={streaming} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Distinct keys: reusing one <button> would turn Stop into a submit button mid-click and resubmit the form. */}
          {streaming ? (
            <Button key="stop" type="button" variant="outline" size="lg" onClick={stop}>
              <Square />
              Stop
            </Button>
          ) : (
            <Button key="generate" type="submit" size="lg" disabled={!parsed.success || quotaExhausted}>
              <Sparkles />
              Generate
            </Button>
          )}
          <QuotaIndicator remaining={remaining} limit={DAILY_GENERATION_LIMIT} />
        </div>
      </form>

      <OutputStream
        status={status}
        output={output}
        error={error}
        truncated={truncated}
        stopCounted={stopCounted}
        changeLevel={changeLevel}
        canRegenerate={lastRequest !== null && !quotaExhausted}
        onRegenerate={regenerate}
      />
    </div>
  );
}
