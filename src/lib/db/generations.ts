import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

// All queries run through the user's RLS-scoped client, so they only ever see the user's own rows.
type Client = SupabaseClient<Database>;

export type Generation = Database["public"]["Tables"]["generations"]["Row"];
export type NewGeneration = Database["public"]["Tables"]["generations"]["Insert"];

export const HISTORY_PAGE_SIZE = 10;
const PREVIEW_LENGTH = 140;

export type GenerationSummary = Pick<Generation, "id" | "mode" | "created_at"> & {
  preview: string;
};

export async function insertGeneration(supabase: Client, generation: NewGeneration) {
  const { error } = await supabase.from("generations").insert(generation);
  if (error) throw error;
}

// Newest first; `page` is 1-based.
export async function listGenerations(supabase: Client, page: number) {
  const from = (page - 1) * HISTORY_PAGE_SIZE;
  const { data, count, error } = await supabase
    .from("generations")
    .select("id, mode, created_at, input", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + HISTORY_PAGE_SIZE - 1);
  if (error) throw error;

  const items: GenerationSummary[] = data.map(({ input, ...rest }) => ({
    ...rest,
    preview: input.length > PREVIEW_LENGTH ? `${input.slice(0, PREVIEW_LENGTH).trimEnd()}…` : input,
  }));
  const total = count ?? 0;
  return { items, total, pageCount: Math.max(Math.ceil(total / HISTORY_PAGE_SIZE), 1) };
}

export async function getGeneration(supabase: Client, id: string): Promise<Generation | null> {
  const { data, error } = await supabase.from("generations").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteGeneration(supabase: Client, id: string) {
  const { error } = await supabase.from("generations").delete().eq("id", id);
  if (error) throw error;
}
