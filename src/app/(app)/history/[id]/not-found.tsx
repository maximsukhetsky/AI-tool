import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

// Shown when GenerationDetail calls notFound(): an invalid id, or a generation that was deleted or isn't the user's.
export default function GenerationNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-4 py-12 text-center">
      <p className="font-medium">Generation not found</p>
      <p className="max-w-md text-sm text-muted-foreground">
        It may have been deleted, or the link is wrong.
      </p>
      <Button variant="outline" nativeButton={false} render={<Link href="/history" />}>
        <ArrowLeft />
        Back to history
      </Button>
    </div>
  );
}
