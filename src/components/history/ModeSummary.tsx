import { Badge } from "@/components/ui/badge";
import type { GenerationOptions } from "@/lib/schemas/history";
import { MODE_LABELS, TONE_LABELS, type Mode } from "@/lib/schemas/mode";

type ModeSummaryProps = {
  mode: Mode;
  options?: GenerationOptions;
};

// Mode badge plus its parameter (target language or tone) when there is one.
export function ModeSummary({ mode, options }: ModeSummaryProps) {
  const detail = options?.targetLanguage ?? (options?.targetTone && TONE_LABELS[options.targetTone]);

  return (
    <span className="flex items-center gap-2">
      <Badge variant="secondary">{MODE_LABELS[mode]}</Badge>
      {detail && <span className="text-sm text-muted-foreground">→ {detail}</span>}
    </span>
  );
}
