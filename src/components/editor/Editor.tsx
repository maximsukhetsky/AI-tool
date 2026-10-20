"use client";

import { Sparkles, Square } from "lucide-react";
import { useState, type FormEvent } from "react";

import { InputArea } from "@/components/editor/InputArea";
import { ModeOptions } from "@/components/editor/ModeOptions";
import { ModePicker } from "@/components/editor/ModePicker";
import { OutputStream } from "@/components/editor/OutputStream";
import { Button } from "@/components/ui/button";
import { useGeneration } from "@/hooks/use-generation";
import { generateRequestSchema } from "@/lib/schemas/generate";
import type { Mode, Tone } from "@/lib/schemas/mode";

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

export function Editor() {
  const [mode, setMode] = useState<Mode>("improve");
  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [targetTone, setTargetTone] = useState<Tone | null>(null);
  const { status, output, error, truncated, lastRequest, generate, stop, regenerate } =
    useGeneration();

  const streaming = status === "streaming";
  const parsed = generateRequestSchema.safeParse(
    toRequestDraft(mode, text, targetLanguage, targetTone),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (parsed.success && !streaming) void generate(parsed.data);
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
        <div className="flex gap-2">
          {streaming ? (
            <Button type="button" variant="outline" size="lg" onClick={stop}>
              <Square />
              Stop
            </Button>
          ) : (
            <Button type="submit" size="lg" disabled={!parsed.success}>
              <Sparkles />
              Generate
            </Button>
          )}
        </div>
      </form>

      <OutputStream
        status={status}
        output={output}
        error={error}
        truncated={truncated}
        canRegenerate={lastRequest !== null}
        onRegenerate={regenerate}
      />
    </div>
  );
}
