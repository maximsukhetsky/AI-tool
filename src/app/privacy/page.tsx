import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const CONTACT_EMAIL = "suheckiymax@gmail.com";

// Public page (see PUBLIC_PATHS in lib/supabase/proxy.ts); linked from the Google OAuth consent screen.
export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
      <header className="flex flex-col gap-3">
        <Logo className="size-10" />
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: October 21, 2026</p>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">What we collect</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Your account details from Google sign-in: email address, name and profile picture.</li>
          <li>The text you submit, the generated results, the selected mode and options, and token counts.</li>
          <li>Daily usage counters, used to enforce generation limits.</li>
          <li>Your settings and saved custom instructions.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">How we use it</h2>
        <p className="text-sm">
          Your data is used only to provide the service: to sign you in, generate text, show your history and settings,
          and enforce usage limits. We don&apos;t sell your data or use it for advertising.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Service providers</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Supabase stores your account and app data.</li>
          <li>Anthropic processes the text you submit to generate results.</li>
          <li>Vercel hosts the app and collects anonymous, cookie-free page view statistics.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Cookies</h2>
        <p className="text-sm">We use only the cookies needed to keep you signed in.</p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-medium">Deleting your data</h2>
        <p className="text-sm">
          You can delete any generation from your history at any time. To delete your account and all associated data,
          email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <div>
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
          <ArrowLeft />
          Back to the app
        </Button>
      </div>
    </main>
  );
}
