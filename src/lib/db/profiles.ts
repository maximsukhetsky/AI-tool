import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Preferences } from "@/lib/schemas/settings";
import type { Database } from "@/types/database";

// Runs through the user's RLS-scoped client: a user can only read and update their own profile.
type Client = SupabaseClient<Database>;

const EMPTY_PREFERENCES: Preferences = {
  defaultMode: null,
  defaultTargetLanguage: null,
  defaultTone: null,
};

export async function getPreferences(supabase: Client, userId: string): Promise<Preferences> {
  const { data, error } = await supabase
    .from("profiles")
    .select("default_mode, default_target_language, default_tone")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return EMPTY_PREFERENCES;
  return {
    defaultMode: data.default_mode,
    defaultTargetLanguage: data.default_target_language,
    defaultTone: data.default_tone,
  };
}

export async function updatePreferences(supabase: Client, userId: string, preferences: Preferences) {
  const { error } = await supabase
    .from("profiles")
    .update({
      default_mode: preferences.defaultMode,
      default_target_language: preferences.defaultTargetLanguage,
      default_tone: preferences.defaultTone,
    })
    .eq("id", userId);
  if (error) throw error;
}
