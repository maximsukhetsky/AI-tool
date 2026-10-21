import { Editor } from "@/components/editor/Editor";
import { getCurrentUser } from "@/lib/auth";
import { listCustomPrompts } from "@/lib/db/custom-prompts";
import { getGeneration } from "@/lib/db/generations";
import { getPreferences } from "@/lib/db/profiles";
import { generationIdSchema, toEditorDraft } from "@/lib/schemas/history";
import { applyPreferences } from "@/lib/schemas/settings";
import { createClient } from "@/lib/supabase/server";
import { getRemainingGenerations } from "@/lib/usage";

type EditorLoaderProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Loads today's quota, the user's defaults and custom instructions and, for `/?from=<id>`, the saved generation to reopen.
export async function EditorLoader({ searchParams }: EditorLoaderProps) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const fromId = generationIdSchema.safeParse((await searchParams).from);

  const [remaining, preferences, customPrompts, generation] = await Promise.all([
    getRemainingGenerations(supabase, user.id),
    getPreferences(supabase, user.id),
    listCustomPrompts(supabase),
    fromId.success ? getGeneration(supabase, fromId.data) : null,
  ]);

  return (
    <Editor
      // Remount when switching to another generation so the form state is replaced.
      key={generation?.id ?? "new"}
      initialRemaining={remaining}
      // A reopened generation wins over the saved defaults.
      initialDraft={applyPreferences(generation ? toEditorDraft(generation) : undefined, preferences)}
      customPrompts={customPrompts}
    />
  );
}
