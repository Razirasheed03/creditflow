import type { AuditResult } from "@/types/audit";

import { buildSummaryContext } from "./context";
import { buildFallbackSummary } from "./fallback";
import { buildSummaryUserPrompt, getSummarySystemPrompt } from "./prompt";
import { resolveSummaryProvider } from "./providers";
import type { AuditSummaryResult } from "./types";
import { countWords, trimToWordRange } from "./utils";
import { isValidAiSummary } from "./validate";

export async function generateAuditSummary(
  audit: AuditResult
): Promise<AuditSummaryResult> {
  const context = buildSummaryContext(audit);
  const provider = resolveSummaryProvider();

  if (!provider) {
    return buildFallbackSummary(audit);
  }

  try {
    const systemPrompt = getSummarySystemPrompt();
    const userPrompt = buildSummaryUserPrompt(context);
    const raw = await provider.complete(systemPrompt, userPrompt);

    if (!isValidAiSummary(raw, context)) {
      return buildFallbackSummary(audit);
    }

    const text = trimToWordRange(raw, 80, 120);

    return {
      text,
      wordCount: countWords(text),
      source: "ai",
      provider: provider.id,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return buildFallbackSummary(audit);
  }
}
