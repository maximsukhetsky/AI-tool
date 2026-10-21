import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

import { getAnthropic, getAnthropicModel } from "@/lib/anthropic/client";
import { insertGeneration } from "@/lib/db/generations";
import { buildSystemPrompt, buildUserMessage, getModeDefinition } from "@/lib/prompts";
import {
  DAILY_GENERATION_LIMIT,
  generateRequestSchema,
  isEarlyStop,
  type ApiError,
  type GenerateEvent,
} from "@/lib/schemas/generate";
import { toGenerationOptions } from "@/lib/schemas/history";
import { createClient } from "@/lib/supabase/server";
import { consumeQuota, recordTokens, releaseQuota, type QuotaReservation } from "@/lib/usage";

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

  // Reserve a slot up front so parallel requests can't exceed the limit; released if nothing is produced.
  let reservation: QuotaReservation | null;
  try {
    reservation = await consumeQuota(user.id);
  } catch (error) {
    console.error("[api/generate] quota check failed", error);
    return errorResponse(500, toApiError(error));
  }
  if (!reservation) {
    return errorResponse(429, {
      code: "quota_exceeded",
      message: `You've used all ${DAILY_GENERATION_LIMIT} generations for today. The limit resets at 00:00 UTC.`,
    });
  }
  const quota = reservation;
  const userId = user.id;
  const startedAt = Date.now();

  const model = getAnthropicModel();
  const anthropicStream = getAnthropic().messages.stream(
    {
      model,
      max_tokens: getModeDefinition(generateRequest.mode).maxTokens,
      // Low effort keeps time-to-first-token short; these are single-shot rewrites.
      output_config: { effort: "low" },
      system: buildSystemPrompt(generateRequest),
      messages: [{ role: "user", content: buildUserMessage(generateRequest.text) }],
    },
    { signal: request.signal },
  );

  let output = "";
  const usage = { input: 0, output: 0 };

  // Saves the generation and its tokens; the quota slot stays used.
  async function persist() {
    // Anthropic reports output tokens only at the end of the stream; estimate them for a stopped one.
    const outputTokens = usage.output || Math.ceil(output.length / 4);
    try {
      await insertGeneration(supabase, {
        user_id: userId,
        mode: generateRequest.mode,
        options: toGenerationOptions(generateRequest),
        input: generateRequest.text,
        output,
        model,
        input_tokens: usage.input,
        output_tokens: outputTokens,
      });
      await recordTokens(userId, quota, usage.input + outputTokens);
    } catch (error) {
      // The user already has the result; don't turn a bookkeeping failure into an error.
      console.error("[api/generate] failed to save generation", error);
    }
  }

  async function release() {
    try {
      await releaseQuota(userId, quota);
    } catch (error) {
      console.error("[api/generate] failed to release quota", error);
    }
  }

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
          if (event.type === "message_start") {
            usage.input = event.message.usage.input_tokens;
          } else if (event.type === "message_delta") {
            usage.output = event.usage.output_tokens;
          } else if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            output += event.delta.text;
            send({ type: "delta", text: event.delta.text });
          }
        }

        const message = await anthropicStream.finalMessage();
        if (message.stop_reason === "refusal") {
          await release();
          send({
            type: "error",
            error: { code: "refused", message: "The AI declined to process this text." },
          });
        } else if (!output) {
          await release();
          send({
            type: "error",
            error: { code: "upstream_error", message: "The AI returned an empty result. Try again." },
          });
        } else {
          // Save before `done`, so history and the counter are current when the client sees it.
          await persist();
          send({
            type: "done",
            truncated: message.stop_reason === "max_tokens",
            remaining: quota.remaining,
          });
        }
      } catch (error) {
        // Client stopped: nothing to send. An early stop is refunded; a later one keeps the partial output.
        if (cancelled || request.signal.aborted || error instanceof Anthropic.APIUserAbortError) {
          await (isEarlyStop(Date.now() - startedAt, output.length) ? release() : persist());
          return;
        }
        console.error("[api/generate] stream failed", error);
        await release();
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
