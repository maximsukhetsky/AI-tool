import { z } from "zod";

import type { GenerateRequest } from "@/lib/schemas/generate";
import { modeSchema, toneSchema, type Mode, type Tone } from "@/lib/schemas/mode";

export const generationIdSchema = z.uuid();

export const historyPageSchema = z.coerce.number().int().min(1).catch(1);

// Mode-specific options stored in generations.options (jsonb).
const generationOptionsSchema = z
  .object({
    targetLanguage: z.string().optional(),
    targetTone: toneSchema.optional(),
  })
  .catch({});

export type GenerationOptions = z.infer<typeof generationOptionsSchema>;

export function parseGenerationOptions(value: unknown): GenerationOptions {
  return generationOptionsSchema.parse(value);
}

export function toGenerationOptions(request: GenerateRequest): GenerationOptions {
  return "options" in request ? request.options : {};
}

// Editor state restored from a saved generation ("Open in editor").
export type EditorDraft = {
  mode: Mode;
  text: string;
  targetLanguage: string;
  targetTone: Tone | null;
};

export function toEditorDraft(generation: { mode: string; input: string; options: unknown }): EditorDraft {
  const options = parseGenerationOptions(generation.options);
  return {
    mode: modeSchema.catch("improve").parse(generation.mode),
    text: generation.input,
    targetLanguage: options.targetLanguage ?? "",
    targetTone: options.targetTone ?? null,
  };
}
