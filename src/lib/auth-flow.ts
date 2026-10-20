import "server-only";

// Marks a sign-in that went through an OAuth provider, so /callback can tell
// a failed Google sign-in apart from an invalid or expired magic link.
export const OAUTH_FLOW_COOKIE = "auth_flow_oauth";

export const OAUTH_FLOW_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/callback",
  maxAge: 60 * 10,
} as const;
