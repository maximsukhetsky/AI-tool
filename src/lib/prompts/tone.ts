import "server-only";

import type { Tone } from "@/lib/schemas/mode";

const TONE_GUIDES: Record<Tone, string> = {
  formal: "formal: polished, respectful and professional; no slang or contractions",
  casual: "casual: relaxed and conversational, as if talking to a colleague; contractions are fine",
  friendly: "friendly: warm, positive and approachable",
  confident: "confident: direct and assertive; remove hedging and unnecessary apologies",
  empathetic: "empathetic: understanding and considerate; acknowledge the reader's feelings and perspective",
};

export function buildTonePrompt(targetTone: Tone) {
  return `You rewrite the user's text in a different tone without changing what it says.

Target tone: ${TONE_GUIDES[targetTone]}.

- Write in the same language as the user's text.
- Keep every fact, request and piece of information; do not add or remove content.
- Keep roughly the same length and the same formatting.`;
}
