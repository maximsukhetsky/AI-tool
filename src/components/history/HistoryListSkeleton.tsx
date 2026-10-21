export function HistoryListSkeleton() {
  return (
    <ul aria-hidden className="animate-pulse divide-y rounded-lg border">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index} className="flex flex-col gap-2 p-3">
          <span className="h-5 w-40 rounded bg-muted" />
          <span className="h-4 w-full rounded bg-muted" />
        </li>
      ))}
    </ul>
  );
}
