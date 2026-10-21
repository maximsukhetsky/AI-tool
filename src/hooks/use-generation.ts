"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  errorResponseSchema,
  generateEventSchema,
  isEarlyStop,
  type ApiError,
  type GenerateEvent,
  type GenerateRequest,
} from "@/lib/schemas/generate";

export type GenerationStatus = "idle" | "streaming" | "done" | "stopped" | "error";

const FALLBACK_ERROR = "Something went wrong. Try again.";

// Yields parsed SSE events from a /api/generate response body.
async function* readEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<GenerateEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) return;
    buffer += decoder.decode(value, { stream: true });

    let boundary: number;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const chunk = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      for (const line of chunk.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const parsed = generateEventSchema.safeParse(JSON.parse(line.slice(6)));
        if (parsed.success) yield parsed.data;
      }
    }
  }
}

async function readError(response: Response): Promise<ApiError | null> {
  const parsed = errorResponseSchema.safeParse(await response.json().catch(() => null));
  return parsed.success ? parsed.data.error : null;
}

// `initialRemaining`: generations left today, as rendered by the server.
export function useGeneration(initialRemaining: number) {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [lastRequest, setLastRequest] = useState<GenerateRequest | null>(null);
  const [remaining, setRemaining] = useState(initialRemaining);
  // Whether the last stopped generation counted against the quota (it does unless stopped early).
  const [stopCounted, setStopCounted] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (request: GenerateRequest) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLastRequest(request);
    setOutput("");
    setError(null);
    setTruncated(false);
    setStopCounted(false);
    setStatus("streaming");

    // Mirrors the server's isEarlyStop decision for a stopped generation.
    const startedAt = Date.now();
    let receivedLength = 0;
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const apiError = await readError(response);
        if (apiError?.code === "quota_exceeded") setRemaining(0);
        setError(apiError?.message ?? FALLBACK_ERROR);
        setStatus("error");
        return;
      }

      for await (const event of readEvents(response.body)) {
        if (event.type === "delta") {
          receivedLength += event.text.length;
          setOutput((previous) => previous + event.text);
        } else if (event.type === "done") {
          setTruncated(event.truncated);
          setRemaining(event.remaining);
          setStatus("done");
          return;
        } else {
          setError(event.error.message);
          setStatus("error");
          return;
        }
      }

      // The stream ended without a terminal event (connection dropped).
      setError("The connection was interrupted. Try again.");
      setStatus("error");
    } catch (caught) {
      if (controller.signal.aborted) {
        const counted = !isEarlyStop(Date.now() - startedAt, receivedLength);
        if (counted) setRemaining((previous) => Math.max(previous - 1, 0));
        // Only the latest generation updates state; an older one was superseded.
        if (controllerRef.current === controller) {
          setStopCounted(counted);
          setStatus("stopped");
        }
        return;
      }
      console.error(caught);
      setError(FALLBACK_ERROR);
      setStatus("error");
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const regenerate = useCallback(() => {
    if (lastRequest) void generate(lastRequest);
  }, [generate, lastRequest]);

  // Cancel an in-flight request when the editor unmounts.
  useEffect(() => () => controllerRef.current?.abort(), []);

  return {
    status,
    output,
    error,
    truncated,
    stopCounted,
    lastRequest,
    remaining,
    generate,
    stop,
    regenerate,
  };
}
