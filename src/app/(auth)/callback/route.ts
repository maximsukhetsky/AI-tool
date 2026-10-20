import { NextResponse, type NextRequest } from "next/server";

import { OAUTH_FLOW_COOKIE, OAUTH_FLOW_COOKIE_OPTIONS } from "@/lib/auth-flow";
import { redirectPathSchema, type LoginError } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/server";

// Handles both magic-link and OAuth redirects (PKCE code exchange).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = redirectPathSchema.safeParse(searchParams.get("next"));
  const isOAuthFlow = request.cookies.has(OAUTH_FLOW_COOKIE);

  let response: NextResponse | undefined;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      response = NextResponse.redirect(`${origin}${next.success ? next.data : "/"}`);
    }
  }

  if (!response) {
    // Supabase reports provider failures (e.g. a rejected Google client secret) as ?error=… here.
    const loginError: LoginError = isOAuthFlow ? "oauth_failed" : "callback_failed";
    response = NextResponse.redirect(`${origin}/login?error=${loginError}`);
  }

  if (isOAuthFlow) {
    response.cookies.delete({ name: OAUTH_FLOW_COOKIE, path: OAUTH_FLOW_COOKIE_OPTIONS.path });
  }
  return response;
}
