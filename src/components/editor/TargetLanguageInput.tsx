"use client";

import { useState } from "react";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { CheckIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MAX_TARGET_LANGUAGE_LENGTH } from "@/lib/schemas/generate";

const LANGUAGE_SUGGESTIONS = [
  "English",
  "Ukrainian",
  "Spanish",
  "German",
  "French",
  "Polish",
  "Italian",
  "Portuguese",
  "Japanese",
  "Chinese (Simplified)",
];

type TargetLanguageInputProps = {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
};

export function TargetLanguageInput({ id, value, onValueChange, disabled }: TargetLanguageInputProps) {
  const selected = value.trim().toLowerCase();
  // Filter only while the user is typing; opening by click or after a pick shows the full list.
  const [isSearching, setIsSearching] = useState(false);

  return (
    <Autocomplete.Root
      items={LANGUAGE_SUGGESTIONS}
      value={value}
      onValueChange={(nextValue, details) => {
        setIsSearching(details.reason === "input-change");
        onValueChange(nextValue);
      }}
      onOpenChange={(open, details) => {
        if (!open || details.reason !== "input-change") setIsSearching(false);
      }}
      filter={(language: string, query) =>
        !isSearching || language.toLowerCase().includes(query.trim().toLowerCase())
      }
      openOnInputClick
      disabled={disabled}
    >
      <Autocomplete.Input
        id={id}
        render={<Input />}
        maxLength={MAX_TARGET_LANGUAGE_LENGTH}
        placeholder="e.g. Spanish"
        required
      />
      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={4} className="isolate z-50">
          <Autocomplete.Popup className="max-h-[min(--spacing(72),var(--available-height))] w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-empty:hidden data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Autocomplete.List>
              {(language: string) => (
                <Autocomplete.Item
                  key={language}
                  value={language}
                  className="relative flex w-full cursor-pointer items-center rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  {language}
                  {language.toLowerCase() === selected && (
                    <CheckIcon className="pointer-events-none absolute right-2 size-4" />
                  )}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
