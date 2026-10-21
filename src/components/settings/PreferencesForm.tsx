"use client";

import { Check } from "lucide-react";
import { useState, useTransition, type FormEvent } from "react";

import { updatePreferencesAction } from "@/app/(app)/settings/actions";
import { TargetLanguageInput } from "@/components/editor/TargetLanguageInput";
import { ModeSelect } from "@/components/settings/ModeSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TONE_LABELS, TONES, toneSchema, type Mode, type Tone } from "@/lib/schemas/mode";
import type { Preferences } from "@/lib/schemas/settings";

const TONE_ITEMS = [
  { value: null, label: "No default" },
  ...TONES.map((tone) => ({ value: tone, label: TONE_LABELS[tone] })),
];

type PreferencesFormProps = {
  initialPreferences: Preferences;
};

export function PreferencesForm({ initialPreferences }: PreferencesFormProps) {
  const [mode, setMode] = useState<Mode>(initialPreferences.defaultMode ?? "improve");
  const [targetLanguage, setTargetLanguage] = useState(initialPreferences.defaultTargetLanguage ?? "");
  const [tone, setTone] = useState<Tone | null>(initialPreferences.defaultTone);
  const [status, setStatus] = useState<{ type: "saved" } | { type: "error"; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    startTransition(async () => {
      const result = await updatePreferencesAction({
        defaultMode: mode,
        defaultTargetLanguage: targetLanguage,
        defaultTone: tone,
      });
      setStatus(result.ok ? { type: "saved" } : { type: "error", message: result.error });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="default-mode">Mode</Label>
          <ModeSelect id="default-mode" value={mode} onChange={setMode} disabled={pending} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="default-language">Translate to</Label>
          <TargetLanguageInput
            id="default-language"
            value={targetLanguage}
            onValueChange={setTargetLanguage}
            disabled={pending}
            required={false}
            placeholder="No default"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="default-tone">Tone</Label>
          <Select
            items={TONE_ITEMS}
            value={tone}
            onValueChange={(value) => {
              const parsed = toneSchema.nullable().safeParse(value);
              if (parsed.success) setTone(parsed.data);
            }}
            disabled={pending}
          >
            <SelectTrigger id="default-tone" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONE_ITEMS.map((item) => (
                <SelectItem key={item.value ?? "none"} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save defaults"}
        </Button>
        {status?.type === "saved" && (
          <p role="status" className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Check className="size-4" />
            Saved. The editor will use these next time you open it.
          </p>
        )}
        {status?.type === "error" && (
          <p role="alert" className="text-sm text-destructive">
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}
