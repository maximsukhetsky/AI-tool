import { z } from "zod";

export const emailSignInSchema = z.object({
  email: z.email().max(254),
});

export type EmailSignInInput = z.infer<typeof emailSignInSchema>;

// Only same-origin relative paths are allowed as post-login redirect targets.
export const redirectPathSchema = z
  .string()
  .startsWith("/")
  .refine((path) => !path.startsWith("//") && !path.includes("\\"));

export const LOGIN_ERRORS = {
  invalid_email: "Enter a valid email address.",
  email_failed: "Couldn't send the sign-in link. Try again in a minute.",
  oauth_failed: "Google sign-in failed. Try again.",
  callback_failed: "The sign-in link is invalid or has expired. Request a new one.",
} as const;

export type LoginError = keyof typeof LOGIN_ERRORS;

export function isLoginError(value: unknown): value is LoginError {
  return typeof value === "string" && value in LOGIN_ERRORS;
}
