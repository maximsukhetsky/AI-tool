export function EditorSkeleton() {
  return (
    <div aria-hidden className="grid animate-pulse gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <div className="h-8 w-full max-w-md rounded-md bg-muted" />
        <div className="h-48 rounded-lg bg-muted" />
        <div className="h-9 w-32 rounded-md bg-muted" />
      </div>
      <div className="h-56 rounded-lg bg-muted" />
    </div>
  );
}
