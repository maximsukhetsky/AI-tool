import { z } from "zod";

import { toneSchema } from "@/lib/schemas/mode";

export const MAX_INPUT_LENGTH = 10_000;
export const MAX_TARGET_LANGUAGE_LENGTH = 64;
// Generations per user per UTC day.
export const DAILY_GENERATION_LIMIT = 20;

// A generation stopped within the grace period or before this much output is
// neither saved nor counted (e.g. the user picked the wrong mode).
export const STOP_GRACE_PERIOD_MS = 3_000;
export const STOP_GRACE_MAX_CHARS = 100;

// Shared by the server (decides) and the client (mirrors the decision, since an
// aborted request can't receive the server's answer).
export function isEarlyStop(elapsedMs: number, outputLength: number) {
  return elapsedMs < STOP_GRACE_PERIOD_MS || outputLength < STOP_GRACE_MAX_CHARS;
}

const textSchema = z
  .string()
  .trim()
  .min(1, "Enter some text first.")
  .max(MAX_INPUT_LENGTH, `Text must be at most ${MAX_INPUT_LENGTH.toLocaleString("en-US")} characters.`);

const targetLanguageSchema = z
  .string()
  .trim()
  .min(1, "Choose a target language.")
  .max(MAX_TARGET_LANGUAGE_LENGTH);

// Shared by every mode. `customPromptId`: one of the user's saved instructions for this mode.
const baseFields = {
  text: textSchema,
  customPromptId: z.uuid().optional(),
};

// One branch per mode so mode-specific options are required exactly where they apply.
export const generateRequestSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("improve"), ...baseFields }),
  z.object({ mode: z.literal("email"), ...baseFields }),
  z.object({ mode: z.literal("linkedin"), ...baseFields }),
  z.object({ mode: z.literal("technical"), ...baseFields }),
  z.object({
    mode: z.literal("translate"),
    ...baseFields,
    options: z.object({ targetLanguage: targetLanguageSchema }),
  }),
  z.object({
    mode: z.literal("tone"),
    ...baseFields,
    options: z.object({ targetTone: toneSchema }),
  }),
]);

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const ERROR_CODES = [
  "unauthorized",
  "invalid_json",
  "validation_error",
  "invalid_custom_prompt",
  "quota_exceeded",
  "refused",
  "rate_limited",
  "upstream_error",
  "internal_error",
] as const;

export const apiErrorSchema = z.object({
  code: z.enum(ERROR_CODES),
  message: z.string(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export const errorResponseSchema = z.object({ error: apiErrorSchema });

// SSE payloads sent by /api/generate, one JSON object per `data:` line.
export const generateEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("delta"), text: z.string() }),
  // `remaining`: generations left today after this one.
  z.object({ type: z.literal("done"), truncated: z.boolean(), remaining: z.number().int().min(0) }),
  z.object({ type: z.literal("error"), error: apiErrorSchema }),
]);

export type GenerateEvent = z.infer<typeof generateEventSchema>;
