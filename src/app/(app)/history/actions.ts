"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { deleteGeneration } from "@/lib/db/generations";
import { generationIdSchema } from "@/lib/schemas/history";
import { createClient } from "@/lib/supabase/server";

export type DeleteGenerationResult = { ok: true } | { ok: false; error: string };

export async function deleteGenerationAction(id: string): Promise<DeleteGenerationResult> {
  const parsed = generationIdSchema.safeParse(id);
  if (!parsed.success) {
    return { ok: false, error: "This generation doesn't exist." };
  }

  await getCurrentUser();
  const supabase = await createClient();
  try {
    // RLS limits the delete to the current user's rows.
    await deleteGeneration(supabase, parsed.data);
  } catch (error) {
    console.error("[history] delete failed", error);
    return { ok: false, error: "Couldn't delete the generation. Try again." };
  }

  revalidatePath("/history");
  return { ok: true };
}
