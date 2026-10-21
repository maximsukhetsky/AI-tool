"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteGenerationAction } from "@/app/(app)/history/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type DeleteGenerationButtonProps = {
  id: string;
  // Where to go after deleting; omit to stay on the current page (it is revalidated).
  redirectTo?: string;
};

export function DeleteGenerationButton({ id, redirectTo }: DeleteGenerationButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteGenerationAction(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (pending) return;
        setOpen(nextOpen);
        setError(null);
      }}
    >
      <AlertDialogTrigger render={<Button type="button" variant="ghost" size="sm" aria-label="Delete generation" />}>
        <Trash2 />
        <span className="hidden sm:inline">Delete</span>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this generation?</AlertDialogTitle>
          <AlertDialogDescription>
            The input and result will be removed from your history permanently.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={pending}>
            {pending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
