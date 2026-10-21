"use client";

const formatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });

// Rendered in the viewer's time zone; the server render may differ, hence suppressHydrationWarning.
export function FormattedDate({ value }: { value: string }) {
  return (
    <time dateTime={value} suppressHydrationWarning>
      {formatter.format(new Date(value))}
    </time>
  );
}
