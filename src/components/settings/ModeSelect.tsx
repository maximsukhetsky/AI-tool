"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODE_LABELS, MODES, modeSchema, type Mode } from "@/lib/schemas/mode";

const MODE_ITEMS = MODES.map((mode) => ({ value: mode, label: MODE_LABELS[mode] }));

type ModeSelectProps = {
  id: string;
  value: Mode;
  onChange: (mode: Mode) => void;
  disabled?: boolean;
};

export function ModeSelect({ id, value, onChange, disabled }: ModeSelectProps) {
  return (
    <Select
      items={MODE_ITEMS}
      value={value}
      onValueChange={(nextValue) => {
        const parsed = modeSchema.safeParse(nextValue);
        if (parsed.success) onChange(parsed.data);
      }}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {MODE_ITEMS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
