import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
};

// Verified user for the current request (deduped per render). Redirects to /login if signed out.
// Uses the locally verified JWT claims (no Auth round-trip); data access is still enforced by RLS.
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  return { id: claims.sub, email: claims.email ?? null };
});
