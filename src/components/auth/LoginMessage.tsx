"use client";

import { useSearchParams } from "next/navigation";

import { LOGIN_ERRORS, isLoginError } from "@/lib/schemas/auth";

// Reads search params on the client so the login page stays fully static.
// Uses useSearchParams, so it must render inside a <Suspense> boundary.
export function LoginMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (isLoginError(error)) {
    return (
      <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {LOGIN_ERRORS[error]}
      </p>
    );
  }

  if (searchParams.get("sent") === "1") {
    return (
      <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm">
        Check your inbox for a sign-in link.
      </p>
    );
  }

  return null;
}
