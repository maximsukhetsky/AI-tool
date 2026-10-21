"use client";

import Link from "next/link";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomPrompt } from "@/lib/db/custom-prompts";
import { MODE_LABELS, type Mode } from "@/lib/schemas/mode";

type CustomPromptPickerProps = {
  mode: Mode;
  // All of the user's prompts; only the current mode's are offered.
  prompts: CustomPrompt[];
  value: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
};

export function CustomPromptPicker({ mode, prompts, value, onChange, disabled }: CustomPromptPickerProps) {
  const modePrompts = prompts.filter((prompt) => prompt.mode === mode);

  if (modePrompts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No custom instructions for {MODE_LABELS[mode]}.{" "}
        <Link href="/settings" className="underline underline-offset-4 hover:text-foreground">
          Add one in Settings
        </Link>
      </p>
    );
  }

  const items = [
    { value: null, label: "None" },
    ...modePrompts.map((prompt) => ({ value: prompt.id, label: prompt.name })),
  ];

  return (
    <div className="flex max-w-xs flex-col gap-2">
      <Label htmlFor="custom-prompt">Custom instruction</Label>
      <Select
        items={items}
        value={value}
        onValueChange={(nextValue) => onChange(typeof nextValue === "string" ? nextValue : null)}
        disabled={disabled}
      >
        <SelectTrigger id="custom-prompt" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value ?? "none"} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
