import "server-only";

import { systemPrompt } from "@/lib/prompts/shared";

export function buildImprovePrompt() {
  return systemPrompt(`You are an expert editor. Improve the user's text for clarity, grammar, spelling, punctuation and flow.

- Keep the original meaning, facts and intent.
- Keep roughly the same length and the same language as the original.
- Keep the author's voice and the existing formatting (paragraphs, lists, Markdown).
- If the text is already good, make only the changes that genuinely help.`);
}
