import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { CustomPromptInput } from "@/lib/schemas/settings";
import type { Database } from "@/types/database";

// All queries run through the user's RLS-scoped client, so they only ever see the user's own rows.
type Client = SupabaseClient<Database>;

export type CustomPrompt = Pick<
  Database["public"]["Tables"]["custom_prompts"]["Row"],
  "id" | "mode" | "name" | "instructions"
>;

const COLUMNS = "id, mode, name, instructions";

// Raised by the enforce_custom_prompts_limit trigger on the 11th insert.
export class CustomPromptLimitError extends Error {
  constructor() {
    super("custom_prompts_limit_reached");
    this.name = "CustomPromptLimitError";
  }
}

export async function listCustomPrompts(supabase: Client): Promise<CustomPrompt[]> {
  const { data, error } = await supabase
    .from("custom_prompts")
    .select(COLUMNS)
    .order("mode")
    .order("created_at");
  if (error) throw error;
  return data;
}

export async function countCustomPrompts(supabase: Client): Promise<number> {
  const { count, error } = await supabase
    .from("custom_prompts")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

// Returns null for a missing id or one that belongs to another user (hidden by RLS).
export async function getCustomPrompt(supabase: Client, id: string): Promise<CustomPrompt | null> {
  const { data, error } = await supabase.from("custom_prompts").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createCustomPrompt(supabase: Client, userId: string, prompt: CustomPromptInput) {
  const { error } = await supabase.from("custom_prompts").insert({ ...prompt, user_id: userId });
  if (error) {
    if (error.message.includes("custom_prompts_limit_reached")) throw new CustomPromptLimitError();
    throw error;
  }
}

// Returns false when no row was updated (missing id or another user's prompt).
export async function updateCustomPrompt(supabase: Client, id: string, prompt: CustomPromptInput) {
  const { data, error } = await supabase.from("custom_prompts").update(prompt).eq("id", id).select("id");
  if (error) throw error;
  return data.length > 0;
}

export async function deleteCustomPrompt(supabase: Client, id: string) {
  const { error } = await supabase.from("custom_prompts").delete().eq("id", id);
  if (error) throw error;
}
