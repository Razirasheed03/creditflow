import type { AuditResult } from "@/types/audit";

import { buildSummaryContext } from "./context";
import type { AuditSummaryResult } from "./types";
import { countWords, formatUsd, trimToWordRange } from "./utils";

export function buildFallbackSummary(audit: AuditResult): AuditSummaryResult {
  const ctx = buildSummaryContext(audit);
  const text = composeFallbackNarrative(ctx);
  const trimmed = trimToWordRange(text, 80, 120);

  return {
    text: trimmed,
    wordCount: countWords(trimmed),
    source: "fallback",
    generatedAt: new Date().toISOString(),
  };
}

function composeFallbackNarrative(
  ctx: ReturnType<typeof buildSummaryContext>
): string {
  const stackLabel = ctx.tools.map((t) => t.toolName).join(", ");
  const spend = formatUsd(ctx.totalCurrentSpendMonthly);

  if (ctx.isAlreadyOptimized) {
    return [
      `Your ${ctx.teamSize}-person team is spending about ${spend}/month across ${ctx.toolsAudited} audited tools (${stackLabel}). Our rule-based review did not find tier or seat misalignment large enough to justify switching costs right now.`,
      `Continue tracking API usage against active products, reconcile billed seats quarterly, and revisit plans when headcount or workload shifts materially. The figures above reflect your submitted invoices, not projected discounts.`,
    ].join(" ");
  }

  const savings = formatUsd(ctx.totalMonthlySavings);
  const annual = formatUsd(ctx.totalAnnualSavings);
  const rate =
    ctx.savingsRatePercent > 0 ? `${ctx.savingsRatePercent}%` : "a modest";

  const opportunitySentence = buildOpportunitySentence(ctx);
  const overlapSentence = buildOverlapSentence(ctx);
  const opsSentence =
    "Operationally, validate admin seat reports before downgrading contracts, and align engineering leads on which IDE and API vendors stay primary.";

  return [
    `Across your ${ctx.toolsAudited}-tool stack (${spend}/month, ${ctx.teamSize} people), we estimate ${savings}/month (${annual}/year, ~${rate} of audited spend) in addressable savings from better-fit tiers and seat discipline. ${opportunitySentence}`,
    `${overlapSentence}${opsSentence} Confirm numbers against billing exports before committing to changes.`,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildOpportunitySentence(
  ctx: ReturnType<typeof buildSummaryContext>
): string {
  if (ctx.topOpportunities.length === 0) {
    return "Review individual tool cards below for line-by-line guidance.";
  }

  const parts = ctx.topOpportunities.slice(0, 2).map((opp) => {
    const tool = ctx.tools.find((t) => t.toolName === opp.toolName);
    const plan = tool?.currentPlan ?? "current plan";
    return `${opp.toolName} (${plan} → ${opp.recommendedPlan}, ~${formatUsd(opp.monthlySavings)}/mo)`;
  });

  if (parts.length === 1) {
    return `The clearest opportunity is ${parts[0]}.`;
  }
  return `The largest opportunities are ${parts[0]} and ${parts[1]}.`;
}

function buildOverlapSentence(
  ctx: ReturnType<typeof buildSummaryContext>
): string {
  if (ctx.stackOverlaps.length === 0) return "";
  const first = ctx.stackOverlaps[0];
  return `We also flagged overlapping spend in ${first.label.toLowerCase()} (${first.toolNames.join(" and ")}, ${formatUsd(first.combinedSpendMonthly)}/mo combined)—consolidation may outperform any single tier change. `;
}
