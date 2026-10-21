import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Not found",
};

// Rendered for unknown URLs. Signed-out visitors are redirected to /login by the proxy before reaching it.
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
        <Logo className="size-10" />
        <h1 className="text-lg font-medium">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
          <ArrowLeft />
          Back to the editor
        </Button>
      </div>
    </main>
  );
}
