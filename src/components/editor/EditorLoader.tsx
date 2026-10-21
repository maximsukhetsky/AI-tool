import { Editor } from "@/components/editor/Editor";
import { getCurrentUser } from "@/lib/auth";
import { getGeneration } from "@/lib/db/generations";
import { generationIdSchema, toEditorDraft } from "@/lib/schemas/history";
import { createClient } from "@/lib/supabase/server";
import { getRemainingGenerations } from "@/lib/usage";

type EditorLoaderProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Loads today's quota and, for `/?from=<id>`, the saved generation to reopen.
export async function EditorLoader({ searchParams }: EditorLoaderProps) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const fromId = generationIdSchema.safeParse((await searchParams).from);

  const [remaining, generation] = await Promise.all([
    getRemainingGenerations(supabase, user.id),
    fromId.success ? getGeneration(supabase, fromId.data) : null,
  ]);

  return (
    <Editor
      // Remount when switching to another generation so the form state is replaced.
      key={generation?.id ?? "new"}
      initialRemaining={remaining}
      initialDraft={generation ? toEditorDraft(generation) : undefined}
    />
  );
}
