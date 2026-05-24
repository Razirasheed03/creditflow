"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Layers,
  ShieldCheck,
} from "lucide-react";

import { AuditAiSummary } from "@/components/results/audit-ai-summary";
import { RecommendationCard } from "@/components/results/recommendation-card";
import { ResultsSection } from "@/components/results/results-section";
import { DarkPanel, PlanCard, PlanRow } from "@/components/homepage/primitives";
import { formatCurrency, formatPercent } from "@/data/pricing";
import type { AuditResult } from "@/types/audit";

type AuditResultsViewProps = {
  result: AuditResult;
  /** Show AI executive summary (private results only). */
  showAiSummary?: boolean;
};

export function AuditResultsView({
  result,
  showAiSummary = true,
}: AuditResultsViewProps) {
  const actionable = result.recommendations.filter(
    (r) => !r.alreadyOptimized && !r.inputInvalid && r.monthlySavings > 0
  );
  const optimized = result.recommendations.filter(
    (r) => r.alreadyOptimized && !r.inputInvalid
  );
  const invalid = result.recommendations.filter((r) => r.inputInvalid);

  return (
    <div className="space-y-10">
      <DarkPanel className="p-8 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-credex-dark-foreground/50 uppercase">
            Audit snapshot
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-credex-dark-foreground/70">
            <ShieldCheck className="size-3" aria-hidden />
            Engine-verified figures
          </span>
        </div>
        <p className="mt-4 text-base leading-relaxed text-credex-dark-foreground/80 sm:text-lg">
          {result.summaryMessage}
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryStat
            label="Monthly spend"
            value={formatCurrency(result.totalCurrentSpend)}
          />
          <SummaryStat
            label="Monthly savings"
            value={
              result.isAlreadyOptimized
                ? "—"
                : formatCurrency(result.totalMonthlySavings)
            }
            accent
          />
          <SummaryStat
            label="Annual savings"
            value={
              result.isAlreadyOptimized
                ? "—"
                : formatCurrency(result.totalAnnualSavings)
            }
          />
          <SummaryStat
            label="Savings rate"
            value={
              result.isAlreadyOptimized
                ? "—"
                : formatPercent(result.savingsRatePercent)
            }
          />
        </div>

        {result.isAlreadyOptimized ? (
          <p className="mt-6 flex items-center gap-2 text-sm text-credex-dark-foreground/75">
            <CheckCircle2 className="size-4 shrink-0 text-credex-green" />
            You&apos;re already spending efficiently — no material changes
            recommended.
          </p>
        ) : (
          <p className="mt-6 text-sm text-credex-dark-foreground/65">
            {result.optimizableToolCount} of {result.toolsAudited} tools have
            actionable optimizations below.
          </p>
        )}
      </DarkPanel>

      {showAiSummary ? <AuditAiSummary audit={result} /> : null}

      {result.inputWarnings.length > 0 || result.invalidToolCount > 0 ? (
        <PlanCard className="border-amber-200/80 bg-amber-50/40 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-950">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            Input notes
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-950/85">
            {result.inputWarnings.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </PlanCard>
      ) : null}

      <PlanCard className="p-6 sm:p-8">
        <h2 className="text-lg font-bold">Financial overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Amounts from audited tool line items
        </p>
        <div className="mt-5 divide-y divide-neutral-100 rounded-xl border border-neutral-100 bg-muted/20 px-4">
          <PlanRow
            label="Current monthly spend"
            value={formatCurrency(result.totalCurrentSpend)}
          />
          <PlanRow
            label="Recommended monthly spend"
            value={formatCurrency(result.totalRecommendedSpend)}
            highlight
          />
          <PlanRow
            label="Net monthly reduction"
            value={
              result.isAlreadyOptimized
                ? "—"
                : formatCurrency(result.totalMonthlySavings)
            }
            highlight={!result.isAlreadyOptimized}
          />
          <PlanRow label="Team size" value={String(result.teamSize)} />
          <PlanRow
            label="Actionable tools"
            value={`${result.optimizableToolCount} of ${result.toolsAudited}`}
          />
        </div>
      </PlanCard>

      {result.stackOverlaps.length > 0 ? (
        <PlanCard className="p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-credex-green" aria-hidden />
            <h2 className="text-lg font-bold">Stack overlap</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Redundant categories — consolidation may outperform single-tier
            changes.
          </p>
          <ul className="mt-5 space-y-4">
            {result.stackOverlaps.map((overlap) => (
              <li
                key={overlap.groupId}
                className="rounded-xl border border-neutral-100 bg-muted/30 p-4"
              >
                <p className="font-medium">{overlap.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {overlap.toolNames.join(" · ")} ·{" "}
                  {formatCurrency(overlap.combinedSpend)}/mo combined
                </p>
                <p className="mt-2 text-sm leading-relaxed">{overlap.message}</p>
              </li>
            ))}
          </ul>
        </PlanCard>
      ) : null}

      {actionable.length > 0 ? (
        <ResultsSection
          title="Recommended changes"
          description="Prioritized by estimated monthly impact"
        >
          <div className="space-y-5">
            {actionable.map((rec, index) => (
              <RecommendationCard
                key={`${rec.toolId}-action-${index}`}
                recommendation={rec}
              />
            ))}
          </div>
        </ResultsSection>
      ) : null}

      {invalid.length > 0 ? (
        <ResultsSection
          title="Needs review"
          description="Invalid or incomplete inputs — no savings estimated"
        >
          <div className="space-y-5">
            {invalid.map((rec, index) => (
              <RecommendationCard
                key={`${rec.toolId}-invalid-${index}`}
                recommendation={rec}
              />
            ))}
          </div>
        </ResultsSection>
      ) : null}

      {optimized.length > 0 ? (
        <ResultsSection
          title="Already efficient"
          description="No meaningful savings from tier changes on these lines"
        >
          <div className="space-y-5">
            {optimized.map((rec, index) => (
              <RecommendationCard
                key={`${rec.toolId}-opt-${index}`}
                recommendation={rec}
              />
            ))}
          </div>
        </ResultsSection>
      ) : null}

      <p className="rounded-xl border border-neutral-100 bg-muted/30 px-5 py-4 text-center text-xs leading-relaxed text-muted-foreground">
        {result.trustNote}
      </p>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-sm text-credex-dark-foreground/60">{label}</p>
      <p
        className={
          accent
            ? "mt-1 text-2xl font-bold tabular-nums tracking-tight text-credex-green sm:text-3xl"
            : "mt-1 text-2xl font-bold tabular-nums tracking-tight sm:text-3xl"
        }
      >
        {value}
      </p>
    </div>
  );
}
