"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import {
  countCustomPrompts,
  createCustomPrompt,
  CustomPromptLimitError,
  deleteCustomPrompt,
  updateCustomPrompt,
} from "@/lib/db/custom-prompts";
import { updatePreferences } from "@/lib/db/profiles";
import {
  customPromptIdSchema,
  customPromptSchema,
  MAX_CUSTOM_PROMPTS,
  preferencesSchema,
  type CustomPromptInput,
  type PreferencesInput,
} from "@/lib/schemas/settings";
import { createClient } from "@/lib/supabase/server";

export type SettingsActionResult = { ok: true } | { ok: false; error: string };

const LIMIT_MESSAGE = `You can save up to ${MAX_CUSTOM_PROMPTS} custom instructions. Delete one to add another.`;
const MISSING_MESSAGE = "This instruction doesn't exist anymore.";

// The editor reads both preferences and custom prompts.
function revalidate() {
  revalidatePath("/settings");
  revalidatePath("/");
}

export async function updatePreferencesAction(input: PreferencesInput): Promise<SettingsActionResult> {
  const parsed = preferencesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid preferences." };
  }

  const user = await getCurrentUser();
  const supabase = await createClient();
  try {
    await updatePreferences(supabase, user.id, parsed.data);
  } catch (error) {
    console.error("[settings] update preferences failed", error);
    return { ok: false, error: "Couldn't save your preferences. Try again." };
  }

  revalidate();
  return { ok: true };
}

export async function createCustomPromptAction(input: CustomPromptInput): Promise<SettingsActionResult> {
  const parsed = customPromptSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid instruction." };
  }

  const user = await getCurrentUser();
  const supabase = await createClient();
  try {
    // Friendly early check; the database trigger is the source of truth for the limit.
    if ((await countCustomPrompts(supabase)) >= MAX_CUSTOM_PROMPTS) {
      return { ok: false, error: LIMIT_MESSAGE };
    }
    await createCustomPrompt(supabase, user.id, parsed.data);
  } catch (error) {
    if (error instanceof CustomPromptLimitError) return { ok: false, error: LIMIT_MESSAGE };
    console.error("[settings] create custom prompt failed", error);
    return { ok: false, error: "Couldn't save the instruction. Try again." };
  }

  revalidate();
  return { ok: true };
}

export async function updateCustomPromptAction(
  id: string,
  input: CustomPromptInput,
): Promise<SettingsActionResult> {
  const parsedId = customPromptIdSchema.safeParse(id);
  if (!parsedId.success) return { ok: false, error: MISSING_MESSAGE };
  const parsed = customPromptSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid instruction." };
  }

  await getCurrentUser();
  const supabase = await createClient();
  try {
    // RLS limits the update to the current user's rows.
    if (!(await updateCustomPrompt(supabase, parsedId.data, parsed.data))) {
      return { ok: false, error: MISSING_MESSAGE };
    }
  } catch (error) {
    console.error("[settings] update custom prompt failed", error);
    return { ok: false, error: "Couldn't save the instruction. Try again." };
  }

  revalidate();
  return { ok: true };
}

export async function deleteCustomPromptAction(id: string): Promise<SettingsActionResult> {
  const parsed = customPromptIdSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: MISSING_MESSAGE };

  await getCurrentUser();
  const supabase = await createClient();
  try {
    // RLS limits the delete to the current user's rows.
    await deleteCustomPrompt(supabase, parsed.data);
  } catch (error) {
    console.error("[settings] delete custom prompt failed", error);
    return { ok: false, error: "Couldn't delete the instruction. Try again." };
  }

  revalidate();
  return { ok: true };
}
