"use client";

import { TargetLanguageInput } from "@/components/editor/TargetLanguageInput";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TONE_LABELS, TONES, toneSchema, type Mode, type Tone } from "@/lib/schemas/mode";

const TONE_ITEMS = TONES.map((tone) => ({ value: tone, label: TONE_LABELS[tone] }));

type ModeOptionsProps = {
  mode: Mode;
  targetLanguage: string;
  onTargetLanguageChange: (value: string) => void;
  targetTone: Tone | null;
  onTargetToneChange: (value: Tone) => void;
  disabled?: boolean;
};

export function ModeOptions({
  mode,
  targetLanguage,
  onTargetLanguageChange,
  targetTone,
  onTargetToneChange,
  disabled,
}: ModeOptionsProps) {
  if (mode === "translate") {
    return (
      <div className="flex max-w-xs flex-col gap-2">
        <Label htmlFor="target-language">Target language</Label>
        <TargetLanguageInput
          id="target-language"
          value={targetLanguage}
          onValueChange={onTargetLanguageChange}
          disabled={disabled}
        />
      </div>
    );
  }

  if (mode === "tone") {
    return (
      <div className="flex max-w-xs flex-col gap-2">
        <Label htmlFor="target-tone">Target tone</Label>
        <Select
          items={TONE_ITEMS}
          value={targetTone}
          onValueChange={(value) => {
            const parsed = toneSchema.safeParse(value);
            if (parsed.success) onTargetToneChange(parsed.data);
          }}
          disabled={disabled}
        >
          <SelectTrigger id="target-tone" className="w-full">
            <SelectValue placeholder="Choose a tone" />
          </SelectTrigger>
          <SelectContent>
            {TONE_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return null;
}
