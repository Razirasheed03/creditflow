"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

import { RecommendationCard } from "@/components/results/recommendation-card";
import {
  DarkPanel,
  PlanCard,
  PlanRow,
} from "@/components/homepage/primitives";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercent } from "@/data/pricing";
import { buildDemoAuditResult } from "@/lib/audit-demo";
import { loadAuditResults, saveAuditResults } from "@/lib/audit-storage";
import type { AuditResult } from "@/types/audit";

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}

export function ResultsDashboard() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stored = loadAuditResults();

    if (stored) {
      setResult(stored);
    } else if (params.get("demo") === "1") {
      const demo = buildDemoAuditResult();
      saveAuditResults(demo);
      setResult(demo);
    }

    setHydrated(true);
  }, []);

  if (!hydrated) {
    return <ResultsSkeleton />;
  }

  if (!result) {
    return (
      <PlanCard className="p-10 text-center">
        <h2 className="text-xl font-bold">No audit results yet</h2>
        <p className="mt-3 max-w-md mx-auto text-muted-foreground">
          Run an audit to see savings recommendations for your AI stack. Results
          are saved locally in your browser.
        </p>
        <Button
          className="mt-8 h-12 rounded-xl bg-neutral-900 px-8 text-base font-semibold text-white"
          asChild
        >
          <Link href="/audit">Start audit</Link>
        </Button>
      </PlanCard>
    );
  }

  const actionable = result.recommendations.filter(
    (r) => !r.alreadyOptimized && !r.inputInvalid && r.monthlySavings > 0
  );
  const optimized = result.recommendations.filter(
    (r) => r.alreadyOptimized && !r.inputInvalid
  );
  const invalid = result.recommendations.filter((r) => r.inputInvalid);

  return (
    <div className="space-y-8">
      <DarkPanel className="p-8 sm:p-10">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold tracking-[0.14em] text-credex-dark-foreground/50 uppercase">
            Audit summary
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-credex-dark-foreground/70">
            <ShieldCheck className="size-3" aria-hidden />
            Rule-based analysis
          </span>
        </div>
        <p className="mt-4 text-lg leading-relaxed text-credex-dark-foreground/85">
          {result.summaryMessage}
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
          <SummaryStat
            label="Tools audited"
            value={String(result.toolsAudited)}
          />
        </div>

        {result.isAlreadyOptimized ? (
          <p className="mt-6 flex items-center gap-2 text-sm text-credex-dark-foreground/75">
            <CheckCircle2 className="size-4 shrink-0 text-credex-green" />
            You&apos;re already spending efficiently — no material changes
            recommended.
          </p>
        ) : null}
      </DarkPanel>

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

      {result.stackOverlaps.length > 0 ? (
        <PlanCard className="p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-credex-green" aria-hidden />
            <h2 className="text-lg font-bold">Stack overlap detected</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            These categories may be redundant — consolidation often saves more
            than any single tier change.
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

      <PlanCard className="p-6 sm:p-8">
        <h2 className="text-lg font-bold">Financial overview</h2>
        <div className="mt-4 divide-y divide-neutral-100">
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

      {actionable.length > 0 ? (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Recommended changes
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Prioritized by estimated monthly impact
            </p>
          </div>
          {actionable.map((rec, index) => (
            <RecommendationCard
              key={`${rec.toolId}-action-${index}`}
              recommendation={rec}
            />
          ))}
        </section>
      ) : null}

      {invalid.length > 0 ? (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Needs review
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Invalid or incomplete inputs — no savings estimated for these lines
            </p>
          </div>
          {invalid.map((rec, index) => (
            <RecommendationCard
              key={`${rec.toolId}-invalid-${index}`}
              recommendation={rec}
            />
          ))}
        </section>
      ) : null}

      {optimized.length > 0 ? (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Already efficient
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No meaningful savings from tier changes on these lines
            </p>
          </div>
          {optimized.map((rec, index) => (
            <RecommendationCard
              key={`${rec.toolId}-opt-${index}`}
              recommendation={rec}
            />
          ))}
        </section>
      ) : null}

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        {result.trustNote}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button
          className="h-12 rounded-xl bg-neutral-900 px-8 text-base font-semibold text-white"
          asChild
        >
          <Link href="/audit">
            Edit audit
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-xl border-neutral-200 bg-white px-8 text-base"
          asChild
        >
          <Link href="/">Back to home</Link>
        </Button>
      </div>
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
    <div>
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
