import { NextResponse, type NextRequest } from "next/server";

import { redirectPathSchema } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/server";

// Handles both magic-link and OAuth redirects (PKCE code exchange).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = redirectPathSchema.safeParse(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next.success ? next.data : "/"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}
