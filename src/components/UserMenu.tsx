import { signOut } from "@/app/(app)/actions";
import { SubmitButton } from "@/components/auth/SubmitButton";
import { getCurrentUser } from "@/lib/auth";

// Reads the session, so it must render inside a <Suspense> boundary.
export async function UserMenu() {
  // Second line of defence after proxy.ts: redirects if there is no session.
  const user = await getCurrentUser();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="hidden truncate text-sm text-muted-foreground sm:block">{user.email}</span>
      <form action={signOut}>
        <SubmitButton variant="ghost" size="sm" pendingLabel="Signing out…">
          Sign out
        </SubmitButton>
      </form>
    </div>
  );
}
