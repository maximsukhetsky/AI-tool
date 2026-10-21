import { cn } from "@/lib/utils";

type QuotaIndicatorProps = {
  remaining: number;
  limit: number;
};

export function QuotaIndicator({ remaining, limit }: QuotaIndicatorProps) {
  if (remaining <= 0) {
    return (
      <p role="status" className="text-sm text-destructive">
        You&apos;ve used all {limit} generations for today. The limit resets at 00:00 UTC.
      </p>
    );
  }

  return (
    <p role="status" className={cn("text-sm text-muted-foreground", remaining <= 3 && "text-amber-600 dark:text-amber-500")}>
      <span className="tabular-nums">{remaining}</span> of {limit} generations left today
    </p>
  );
}
