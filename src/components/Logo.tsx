import { cn } from "@/lib/utils";

// Same mark as src/app/icon.svg, coloured with theme tokens so it follows dark mode.
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7 shrink-0", className)}>
      <rect className="fill-primary" width="32" height="32" rx="8" />
      <g className="fill-primary-foreground">
        <rect x="7" y="10" width="10" height="2.5" rx="1.25" />
        <rect x="7" y="15" width="18" height="2.5" rx="1.25" />
        <rect x="7" y="20" width="12" height="2.5" rx="1.25" />
        <path d="M23 4.5 Q23.6 8.4 27.5 9 Q23.6 9.6 23 13.5 Q22.4 9.6 18.5 9 Q22.4 8.4 23 4.5 Z" />
      </g>
    </svg>
  );
}
