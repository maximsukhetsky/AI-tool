"use client";

import { useState, useTransition, type FormEvent } from "react";

import { createCustomPromptAction, updateCustomPromptAction } from "@/app/(app)/settings/actions";
import { ModeSelect } from "@/components/settings/ModeSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CustomPrompt } from "@/lib/db/custom-prompts";
import type { Mode } from "@/lib/schemas/mode";
import {
  customPromptSchema,
  MAX_PROMPT_INSTRUCTIONS_LENGTH,
  MAX_PROMPT_NAME_LENGTH,
} from "@/lib/schemas/settings";
import { cn } from "@/lib/utils";

type CustomPromptFormProps = {
  // Omit to create a new instruction.
  prompt?: CustomPrompt;
  onDone: () => void;
};

export function CustomPromptForm({ prompt, onDone }: CustomPromptFormProps) {
  const [mode, setMode] = useState<Mode>(prompt?.mode ?? "improve");
  const [name, setName] = useState(prompt?.name ?? "");
  const [instructions, setInstructions] = useState(prompt?.instructions ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const idPrefix = prompt ? `prompt-${prompt.id}` : "prompt-new";
  const parsed = customPromptSchema.safeParse({ mode, name, instructions });
  const tooLong = instructions.length > MAX_PROMPT_INSTRUCTIONS_LENGTH;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the fields.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = prompt
        ? await updateCustomPromptAction(prompt.id, parsed.data)
        : await createCustomPromptAction(parsed.data);
      if (result.ok) onDone();
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-mode`}>Mode</Label>
          <ModeSelect id={`${idPrefix}-mode`} value={mode} onChange={setMode} disabled={pending} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-name`}>Name</Label>
          <Input
            id={`${idPrefix}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={MAX_PROMPT_NAME_LENGTH}
            placeholder="e.g. British English"
            disabled={pending}
            required
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-instructions`}>Instructions</Label>
        <Textarea
          id={`${idPrefix}-instructions`}
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          placeholder="e.g. Always use British English spelling. End with a question to the reader."
          aria-invalid={tooLong}
          aria-describedby={`${idPrefix}-instructions-count`}
          disabled={pending}
          className="min-h-28 resize-y"
          required
        />
        <p
          id={`${idPrefix}-instructions-count`}
          className={cn("self-end text-xs tabular-nums text-muted-foreground", tooLong && "text-destructive")}
        >
          {instructions.length.toLocaleString("en-US")} / {MAX_PROMPT_INSTRUCTIONS_LENGTH.toLocaleString("en-US")}
        </p>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending || !parsed.success}>
          {pending ? "Saving…" : prompt ? "Save changes" : "Add instruction"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
