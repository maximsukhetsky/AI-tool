import { z } from "zod";

import { MAX_TARGET_LANGUAGE_LENGTH } from "@/lib/schemas/generate";
import type { EditorDraft } from "@/lib/schemas/history";
import { modeSchema, toneSchema } from "@/lib/schemas/mode";

// Must match the CHECK constraints and the limit trigger on public.custom_prompts.
export const MAX_CUSTOM_PROMPTS = 10;
export const MAX_PROMPT_NAME_LENGTH = 80;
export const MAX_PROMPT_INSTRUCTIONS_LENGTH = 2000;

export const preferencesSchema = z.object({
  defaultMode: modeSchema.nullable(),
  // An empty field clears the default.
  defaultTargetLanguage: z
    .string()
    .trim()
    .max(MAX_TARGET_LANGUAGE_LENGTH, `Language must be at most ${MAX_TARGET_LANGUAGE_LENGTH} characters.`)
    .transform((value) => value || null),
  defaultTone: toneSchema.nullable(),
});

export type PreferencesInput = z.input<typeof preferencesSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;

export const customPromptIdSchema = z.uuid();

export const customPromptSchema = z.object({
  mode: modeSchema,
  name: z
    .string()
    .trim()
    .min(1, "Enter a name.")
    .max(MAX_PROMPT_NAME_LENGTH, `Name must be at most ${MAX_PROMPT_NAME_LENGTH} characters.`),
  instructions: z
    .string()
    .trim()
    .min(1, "Enter the instructions.")
    .max(
      MAX_PROMPT_INSTRUCTIONS_LENGTH,
      `Instructions must be at most ${MAX_PROMPT_INSTRUCTIONS_LENGTH.toLocaleString("en-US")} characters.`,
    ),
});

export type CustomPromptInput = z.infer<typeof customPromptSchema>;

// Fills the editor fields the draft leaves empty from the user's saved defaults.
export function applyPreferences(draft: EditorDraft | undefined, preferences: Preferences): EditorDraft {
  return {
    mode: draft?.mode ?? preferences.defaultMode ?? "improve",
    text: draft?.text ?? "",
    targetLanguage: draft?.targetLanguage || (preferences.defaultTargetLanguage ?? ""),
    targetTone: draft?.targetTone ?? preferences.defaultTone,
  };
}
