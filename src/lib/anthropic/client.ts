import "server-only";

import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL = "claude-sonnet-5-5";

let client: Anthropic | undefined;

// Created lazily so a missing key fails the request, not the build.
export function getAnthropic() {
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export function getAnthropicModel() {
  return process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
}
