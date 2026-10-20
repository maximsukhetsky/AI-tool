import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { getAnthropic, getAnthropicModel } from "@/lib/anthropic/client";
import { buildSystemPrompt, buildUserMessage, getModeDefinition } from "@/lib/prompts";
import {
  generateRequestSchema,
  type ApiError,
  type GenerateEvent,
} from "@/lib/schemas/generate";
import { createClient } from "@/lib/supabase/server";

function errorResponse(status: number, error: ApiError) {
  return NextResponse.json({ error }, { status });
}

function toApiError(error: unknown): ApiError {
  if (error instanceof Anthropic.RateLimitError) {
    return { code: "rate_limited", message: "The AI service is busy. Try again in a moment." };
  }
  if (error instanceof Anthropic.APIError) {
    return { code: "upstream_error", message: "The AI service failed to respond. Try again." };
  }
  return { code: "internal_error", message: "Something went wrong. Try again." };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return errorResponse(401, { code: "unauthorized", message: "Authentication required" });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, { code: "invalid_json", message: "Request body must be valid JSON." });
  }

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, {
      code: "validation_error",
      message: parsed.error.issues[0]?.message ?? "Invalid request.",
    });
  }
  const generateRequest = parsed.data;

  // Session 3: check the daily quota (lib/usage.ts) here and return 429 before calling Anthropic.

  const anthropicStream = getAnthropic().messages.stream(
    {
      model: getAnthropicModel(),
      max_tokens: getModeDefinition(generateRequest.mode).maxTokens,
      // Low effort keeps time-to-first-token short; these are single-shot rewrites.
      output_config: { effort: "low" },
      system: buildSystemPrompt(generateRequest),
      messages: [{ role: "user", content: buildUserMessage(generateRequest.text) }],
    },
    { signal: request.signal },
  );

  const encoder = new TextEncoder();
  let cancelled = false;

  const sseBody = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: GenerateEvent) => {
        if (cancelled) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      try {
        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            send({ type: "delta", text: event.delta.text });
          }
        }

        const message = await anthropicStream.finalMessage();
        if (message.stop_reason === "refusal") {
          send({
            type: "error",
            error: { code: "refused", message: "The AI declined to process this text." },
          });
        } else {
          send({ type: "done", truncated: message.stop_reason === "max_tokens" });
        }
        // Session 3: save the generation and increment usage here (message.usage has token counts).
      } catch (error) {
        // Client disconnected: nothing to send and nothing to save.
        if (cancelled || request.signal.aborted || error instanceof Anthropic.APIUserAbortError) {
          return;
        }
        console.error("[api/generate] stream failed", error);
        send({ type: "error", error: toApiError(error) });
      } finally {
        if (!cancelled) controller.close();
      }
    },
    cancel() {
      cancelled = true;
      anthropicStream.abort();
    },
  });

  return new Response(sseBody, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
