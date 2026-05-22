"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { BrandIcon } from "@/components/homepage/brand-icon";
import type { BrandId } from "@/components/homepage/brand-icon";
import {
  DarkPanel,
  PlanCard,
  PlanRow,
} from "@/components/homepage/primitives";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/data/pricing";
import { buildDemoAuditResult } from "@/lib/audit-demo";
import { loadAuditResults, saveAuditResults } from "@/lib/audit-storage";
import type { AuditResult, RecommendationType } from "@/types/audit";

const TOOL_BRAND_MAP: Partial<Record<string, BrandId>> = {
  cursor: "cursor",
  github_copilot: "copilot",
  claude: "claude",
  chatgpt: "openai",
  anthropic_api: "anthropic",
  openai_api: "openai",
  gemini: "gemini",
};

const TYPE_LABELS: Record<RecommendationType, string> = {
  downgrade: "Plan optimization",
  alternative: "Alternative",
  credit: "Credit opportunity",
  optimized: "Already optimized",
};

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
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
        <p className="mt-3 text-muted-foreground">
          Run an audit to see savings recommendations for your AI stack.
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

  return (
    <div className="space-y-8">
      <DarkPanel className="p-8 sm:p-10">
        <p className="text-xs font-semibold tracking-[0.14em] text-credex-dark-foreground/50 uppercase">
          Audit summary
        </p>
        <p className="mt-4 text-lg leading-relaxed text-credex-dark-foreground/80">
          {result.summaryMessage}
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-credex-dark-foreground/60">
              Potential monthly savings
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight">
              {result.isAlreadyOptimized
                ? "—"
                : formatCurrency(result.totalMonthlySavings)}
            </p>
          </div>
          <div>
            <p className="text-sm text-credex-dark-foreground/60">
              Potential annual savings
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-credex-green">
              {result.isAlreadyOptimized
                ? "—"
                : formatCurrency(result.totalAnnualSavings)}
            </p>
          </div>
        </div>
        {result.isAlreadyOptimized ? (
          <p className="mt-6 flex items-center gap-2 text-sm text-credex-dark-foreground/70">
            <CheckCircle2 className="size-4 shrink-0 text-credex-green" />
            You&apos;re already spending efficiently.
          </p>
        ) : null}
      </DarkPanel>

      <PlanCard className="p-6 sm:p-8">
        <h2 className="text-lg font-bold">Spend overview</h2>
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
            label="Team size"
            value={String(result.teamSize)}
          />
        </div>
      </PlanCard>

      <div className="space-y-5">
        <h2 className="text-xl font-bold tracking-tight">
          Per-tool recommendations
        </h2>
        {result.recommendations.map((rec, index) => {
          const brand = TOOL_BRAND_MAP[rec.toolId];
          return (
            <PlanCard
              key={`${rec.toolId}-${index}-${rec.currentPlan}`}
              className="p-6 sm:p-8"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  {brand ? (
                    <BrandIcon brand={brand} size="lg" />
                  ) : null}
                  <div>
                    <h3 className="text-lg font-bold">{rec.toolName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {rec.seats} seat{rec.seats === 1 ? "" : "s"} ·{" "}
                      {rec.primaryUseCase.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="w-fit border-primary/30 bg-accent text-accent-foreground"
                >
                  {TYPE_LABELS[rec.recommendationType]}
                </Badge>
              </div>

              <div className="mt-6 divide-y divide-neutral-100">
                <PlanRow label="Current plan" value={rec.currentPlan} />
                <PlanRow
                  label="Current spend"
                  value={`${formatCurrency(rec.currentSpend)}/mo`}
                />
                <PlanRow
                  label="Recommended plan"
                  value={rec.recommendedPlan}
                />
                <PlanRow
                  label="Optimized spend"
                  value={`${formatCurrency(rec.recommendedSpend)}/mo`}
                  highlight
                />
                <PlanRow
                  label="Monthly savings"
                  value={
                    rec.monthlySavings > 0
                      ? `${formatCurrency(rec.monthlySavings)}/mo`
                      : "—"
                  }
                  highlight={rec.monthlySavings > 0}
                />
              </div>

              <p className="mt-6 rounded-xl bg-muted/60 p-4 text-sm leading-relaxed text-foreground">
                {rec.reasoning}
              </p>
            </PlanCard>
          );
        })}
      </div>

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
