"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { emailSignInSchema, type LoginError } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/server";

async function getOrigin() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

function loginRedirect(error: LoginError): never {
  redirect(`/login?error=${error}`);
}

export async function signInWithEmail(formData: FormData) {
  const parsed = emailSignInSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    loginRedirect("invalid_email");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${await getOrigin()}/callback` },
  });

  if (error) {
    loginRedirect("email_failed");
  }

  redirect("/login?sent=1");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await getOrigin()}/callback` },
  });

  if (error || !data.url) {
    loginRedirect("oauth_failed");
  }

  redirect(data.url);
}
