import { z } from "zod";

import type { Database } from "@/types/database";

type DbEnums = Database["public"]["Enums"];

// Must stay in sync with the `writing_mode` and `tone` Postgres enums; `satisfies` catches drift.
export const MODES = [
  "improve",
  "email",
  "linkedin",
  "technical",
  "translate",
  "tone",
] as const satisfies readonly DbEnums["writing_mode"][];

export const TONES = [
  "formal",
  "casual",
  "friendly",
  "confident",
  "empathetic",
] as const satisfies readonly DbEnums["tone"][];

// Modes that rewrite the text in place; the editor says so when they barely changed it.
export const MINOR_CHANGE_NOTICE_MODES = ["improve", "tone"] as const satisfies readonly Mode[];

export const modeSchema = z.enum(MODES);
export const toneSchema = z.enum(TONES);

export type Mode = z.infer<typeof modeSchema>;
export type Tone = z.infer<typeof toneSchema>;

export const MODE_LABELS: Record<Mode, string> = {
  improve: "Improve",
  email: "Email",
  linkedin: "LinkedIn",
  technical: "Technical",
  translate: "Translate",
  tone: "Change tone",
};

export const MODE_DESCRIPTIONS: Record<Mode, string> = {
  improve: "Fix clarity, grammar and flow without changing the meaning.",
  email: "Turn notes or a draft into a ready-to-send email.",
  linkedin: "Write a LinkedIn post with a strong hook.",
  technical: "Rewrite with technical precision: docs, PR descriptions, specs.",
  translate: "Translate while keeping tone and formatting.",
  tone: "Change the tone without changing the content.",
};

export const TONE_LABELS: Record<Tone, string> = {
  formal: "Formal",
  casual: "Casual",
  friendly: "Friendly",
  confident: "Confident",
  empathetic: "Empathetic",
};
