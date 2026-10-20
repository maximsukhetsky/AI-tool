"use client";

import { Button } from "@/components/ui/button";
import { MODE_DESCRIPTIONS, MODE_LABELS, MODES, type Mode } from "@/lib/schemas/mode";

type ModePickerProps = {
  value: Mode;
  onChange: (mode: Mode) => void;
  disabled?: boolean;
};

export function ModePicker({ value, onChange, disabled }: ModePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" aria-label="Mode" className="flex flex-wrap gap-2">
        {MODES.map((mode) => (
          <Button
            key={mode}
            type="button"
            role="radio"
            aria-checked={mode === value}
            variant={mode === value ? "default" : "outline"}
            disabled={disabled}
            onClick={() => onChange(mode)}
          >
            {MODE_LABELS[mode]}
          </Button>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">{MODE_DESCRIPTIONS[value]}</p>
    </div>
  );
}
