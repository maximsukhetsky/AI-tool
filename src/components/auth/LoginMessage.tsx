import { LOGIN_ERRORS, isLoginError } from "@/lib/schemas/auth";

type LoginMessageProps = {
  searchParams: PageProps<"/login">["searchParams"];
};

// Reads searchParams, so it must render inside a <Suspense> boundary.
export async function LoginMessage({ searchParams }: LoginMessageProps) {
  const { error, sent } = await searchParams;

  if (isLoginError(error)) {
    return (
      <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {LOGIN_ERRORS[error]}
      </p>
    );
  }

  if (sent === "1") {
    return (
      <p role="status" className="rounded-lg bg-muted px-3 py-2 text-sm">
        Check your inbox for a sign-in link.
      </p>
    );
  }

  return null;
}
