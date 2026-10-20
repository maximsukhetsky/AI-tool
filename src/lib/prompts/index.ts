import "server-only";

import { buildEmailPrompt } from "@/lib/prompts/email";
import { buildImprovePrompt } from "@/lib/prompts/improve";
import { buildLinkedinPrompt } from "@/lib/prompts/linkedin";
import { buildTechnicalPrompt } from "@/lib/prompts/technical";
import { buildTonePrompt } from "@/lib/prompts/tone";
import { buildTranslatePrompt } from "@/lib/prompts/translate";
import type { GenerateRequest } from "@/lib/schemas/generate";
import { MODE_LABELS, type Mode } from "@/lib/schemas/mode";

export { buildUserMessage } from "@/lib/prompts/shared";

type ModeRequest<M extends Mode> = Extract<GenerateRequest, { mode: M }>;

type ModeDefinition<M extends Mode> = {
  label: string;
  buildSystemPrompt: (request: ModeRequest<M>) => string;
  // Covers adaptive thinking plus the visible output.
  maxTokens: number;
};

export const modeRegistry: { [M in Mode]: ModeDefinition<M> } = {
  improve: {
    label: MODE_LABELS.improve,
    buildSystemPrompt: () => buildImprovePrompt(),
    maxTokens: 8_000,
  },
  email: {
    label: MODE_LABELS.email,
    buildSystemPrompt: () => buildEmailPrompt(),
    maxTokens: 6_000,
  },
  linkedin: {
    label: MODE_LABELS.linkedin,
    buildSystemPrompt: () => buildLinkedinPrompt(),
    maxTokens: 4_000,
  },
  technical: {
    label: MODE_LABELS.technical,
    buildSystemPrompt: () => buildTechnicalPrompt(),
    maxTokens: 10_000,
  },
  translate: {
    label: MODE_LABELS.translate,
    buildSystemPrompt: ({ options }) => buildTranslatePrompt(options.targetLanguage),
    maxTokens: 16_000,
  },
  tone: {
    label: MODE_LABELS.tone,
    buildSystemPrompt: ({ options }) => buildTonePrompt(options.targetTone),
    maxTokens: 8_000,
  },
};

export function getModeDefinition<M extends Mode>(mode: M): ModeDefinition<M> {
  return modeRegistry[mode];
}

export function buildSystemPrompt<M extends Mode>(request: ModeRequest<M>): string {
  return getModeDefinition<M>(request.mode as M).buildSystemPrompt(request);
}
