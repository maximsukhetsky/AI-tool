import { Suspense } from "react";

import { EditorLoader } from "@/components/editor/EditorLoader";
import { EditorSkeleton } from "@/components/editor/EditorSkeleton";

export default function EditorPage({ searchParams }: PageProps<"/">) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Editor</h1>
      <Suspense fallback={<EditorSkeleton />}>
        <EditorLoader searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
