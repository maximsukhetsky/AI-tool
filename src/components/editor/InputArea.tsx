"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAX_INPUT_LENGTH } from "@/lib/schemas/generate";
import { cn } from "@/lib/utils";

type InputAreaProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function InputArea({ value, onChange, disabled }: InputAreaProps) {
  const tooLong = value.length > MAX_INPUT_LENGTH;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="input-text">Your text</Label>
      <Textarea
        id="input-text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder="Paste or type the text you want to work on…"
        aria-invalid={tooLong}
        aria-describedby="input-text-count"
        className="min-h-48 resize-y"
      />
      <p
        id="input-text-count"
        className={cn(
          "self-end text-xs tabular-nums text-muted-foreground",
          tooLong && "text-destructive",
        )}
      >
        {value.length.toLocaleString("en-US")} / {MAX_INPUT_LENGTH.toLocaleString("en-US")}
        {tooLong && " · too long"}
      </p>
    </div>
  );
}
