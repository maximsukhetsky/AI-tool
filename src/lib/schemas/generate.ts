import { z } from "zod";

import { toneSchema } from "@/lib/schemas/mode";

export const MAX_INPUT_LENGTH = 10_000;
export const MAX_TARGET_LANGUAGE_LENGTH = 64;

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

// One branch per mode so mode-specific options are required exactly where they apply.
export const generateRequestSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("improve"), text: textSchema }),
  z.object({ mode: z.literal("email"), text: textSchema }),
  z.object({ mode: z.literal("linkedin"), text: textSchema }),
  z.object({ mode: z.literal("technical"), text: textSchema }),
  z.object({
    mode: z.literal("translate"),
    text: textSchema,
    options: z.object({ targetLanguage: targetLanguageSchema }),
  }),
  z.object({
    mode: z.literal("tone"),
    text: textSchema,
    options: z.object({ targetTone: toneSchema }),
  }),
]);

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

export const ERROR_CODES = [
  "unauthorized",
  "invalid_json",
  "validation_error",
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
  z.object({ type: z.literal("done"), truncated: z.boolean() }),
  z.object({ type: z.literal("error"), error: apiErrorSchema }),
]);

export type GenerateEvent = z.infer<typeof generateEventSchema>;
