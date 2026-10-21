import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { DAILY_GENERATION_LIMIT } from "@/lib/schemas/generate";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export type QuotaReservation = {
  // UTC day the generation was counted against; refunds and tokens go to the same day.
  period: string;
  remaining: number;
};

// PostgrestError is a plain object and logs as `{}`; wrap it so the cause is visible.
function usageError(operation: string, error: { message: string; code?: string }) {
  return new Error(`[usage] ${operation} failed: ${error.message}${error.code ? ` (${error.code})` : ""}`, {
    cause: error,
  });
}

function currentPeriod() {
  return new Date().toISOString().slice(0, 10);
}

// Read through the user's RLS-scoped client.
export async function getRemainingGenerations(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { data, error } = await supabase
    .from("usage")
    .select("request_count")
    .eq("user_id", userId)
    .eq("period", currentPeriod())
    .maybeSingle();
  if (error) throw usageError("read usage", error);
  return Math.max(DAILY_GENERATION_LIMIT - (data?.request_count ?? 0), 0);
}

// Atomically reserves one generation before calling Anthropic. Returns null when the limit is reached.
export async function consumeQuota(userId: string): Promise<QuotaReservation | null> {
  const { data, error } = await createAdminClient().rpc("consume_quota", {
    p_user_id: userId,
    p_limit: DAILY_GENERATION_LIMIT,
  });
  if (error) throw usageError("consume_quota", error);
  const row = data[0];
  if (!row) return null;
  return { period: row.period, remaining: DAILY_GENERATION_LIMIT - row.request_count };
}

// Gives the reservation back when the generation produced no output.
export async function releaseQuota(userId: string, reservation: QuotaReservation) {
  const { error } = await createAdminClient().rpc("release_quota", {
    p_user_id: userId,
    p_period: reservation.period,
  });
  if (error) throw usageError("release_quota", error);
}

export async function recordTokens(userId: string, reservation: QuotaReservation, tokens: number) {
  const { error } = await createAdminClient().rpc("add_usage_tokens", {
    p_user_id: userId,
    p_period: reservation.period,
    p_tokens: tokens,
  });
  if (error) throw usageError("add_usage_tokens", error);
}
