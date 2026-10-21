import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

let client: ReturnType<typeof createClient<Database>> | undefined;

// Service-role client: bypasses RLS. Only for server-side bookkeeping (lib/usage.ts),
// always scoped to the authenticated user's id, never to user-controlled filters.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY. See .env.example.");
  }
  client ??= createClient<Database>(getSupabaseEnv().url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
