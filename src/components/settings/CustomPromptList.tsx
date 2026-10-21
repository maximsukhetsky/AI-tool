"use client";

import { PencilLine, Plus } from "lucide-react";
import { useState } from "react";

import { CustomPromptForm } from "@/components/settings/CustomPromptForm";
import { DeleteCustomPromptButton } from "@/components/settings/DeleteCustomPromptButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CustomPrompt } from "@/lib/db/custom-prompts";
import { MODE_LABELS } from "@/lib/schemas/mode";
import { MAX_CUSTOM_PROMPTS } from "@/lib/schemas/settings";

type CustomPromptListProps = {
  prompts: CustomPrompt[];
};

// `editing`: the id of the prompt being edited, "new" while creating one.
export function CustomPromptList({ prompts }: CustomPromptListProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const limitReached = prompts.length >= MAX_CUSTOM_PROMPTS;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground tabular-nums">
          {prompts.length} / {MAX_CUSTOM_PROMPTS} saved
          {limitReached && " · delete one to add another"}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditing("new")}
          disabled={limitReached || editing === "new"}
        >
          <Plus />
          New instruction
        </Button>
      </div>

      {editing === "new" && <CustomPromptForm onDone={() => setEditing(null)} />}

      {prompts.length === 0 && editing !== "new" ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-10 text-center">
          <p className="font-medium">No custom instructions yet</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Save extra instructions for a mode, like “Always use British English” or “End with a question”, then
            pick one in the editor.
          </p>
        </div>
      ) : (
        prompts.length > 0 && (
          <ul className="flex flex-col gap-3">
            {prompts.map((prompt) =>
              editing === prompt.id ? (
                <li key={prompt.id}>
                  <CustomPromptForm prompt={prompt} onDone={() => setEditing(null)} />
                </li>
              ) : (
                <li key={prompt.id} className="flex items-start gap-2 rounded-lg border p-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{MODE_LABELS[prompt.mode]}</Badge>
                      <span className="font-medium break-words">{prompt.name}</span>
                    </div>
                    <p className="line-clamp-3 text-sm whitespace-pre-line break-words text-muted-foreground">
                      {prompt.instructions}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(prompt.id)}
                    aria-label={`Edit ${prompt.name}`}
                  >
                    <PencilLine />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <DeleteCustomPromptButton id={prompt.id} name={prompt.name} />
                </li>
              ),
            )}
          </ul>
        )
      )}
    </div>
  );
}
