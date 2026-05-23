import { createAnthropicProvider } from "./anthropic";
import { createOpenAiProvider } from "./openai";
import type { CompletionProvider } from "./types";

export type { CompletionProvider } from "./types";

export function resolveSummaryProvider(): CompletionProvider | null {
  const preferred = process.env.CREDITFLOW_AI_PROVIDER?.toLowerCase();

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (preferred === "anthropic" && anthropicKey) {
    return createAnthropicProvider(anthropicKey);
  }
  if (preferred === "openai" && openaiKey) {
    return createOpenAiProvider(openaiKey);
  }

  if (openaiKey) return createOpenAiProvider(openaiKey);
  if (anthropicKey) return createAnthropicProvider(anthropicKey);

  return null;
}
