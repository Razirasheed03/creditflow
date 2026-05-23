"use client";

import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PlanCard } from "@/components/homepage/primitives";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAuditSummary } from "@/lib/audit-summary/client";
import type { AuditSummaryResult } from "@/lib/audit-summary/types";
import type { AuditResult } from "@/types/audit";
import { cn } from "@/lib/utils";

type AuditAiSummaryProps = {
  audit: AuditResult;
};

export function AuditAiSummary({ audit }: AuditAiSummaryProps) {
  const [summary, setSummary] = useState<AuditSummaryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = useCallback(
    async (refresh = false) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const result = await fetchAuditSummary(audit, { refresh });
      setSummary(result);
      setLoading(false);
      setRefreshing(false);
    },
    [audit]
  );

  useEffect(() => {
    void loadSummary(false);
  }, [loadSummary]);

  return (
    <PlanCard
      className={cn(
        "relative overflow-hidden border-neutral-200/90 p-6 sm:p-8",
        "shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_40px_rgba(0,0,0,0.05)]"
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--credex-green)]/60 to-transparent"
        aria-hidden
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Executive summary
          </p>
          <h2 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
            Your AI spend at a glance
          </h2>
        </div>
        {!loading && summary ? (
          <SourceBadge summary={summary} />
        ) : null}
      </div>

      <div className="mt-6 min-h-[7.5rem]">
        {loading ? (
          <SummarySkeleton />
        ) : summary ? (
          <p
            className={cn(
              "text-base leading-[1.75] text-foreground/90 transition-opacity duration-300",
              refreshing && "opacity-60"
            )}
          >
            {summary.text}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Narrative is generated from your audit outputs only. Dollar figures
          match the rule-based engine — not independent estimates.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 rounded-lg border-neutral-200 bg-white"
          disabled={loading || refreshing}
          onClick={() => void loadSummary(true)}
        >
          {refreshing ? "Refreshing…" : "Refresh summary"}
        </Button>
      </div>
    </PlanCard>
  );
}

function SourceBadge({ summary }: { summary: AuditSummaryResult }) {
  const isAi = summary.source === "ai";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        isAi
          ? "border-[var(--credex-green)]/30 bg-[var(--credex-green)]/10 text-neutral-800"
          : "border-neutral-200 bg-neutral-50 text-muted-foreground"
      )}
    >
      {isAi ? (
        <Sparkles className="size-3.5 text-[var(--credex-green)]" aria-hidden />
      ) : null}
      {isAi
        ? `AI summary${summary.provider ? ` · ${summary.provider}` : ""}`
        : "Analyst narrative"}
    </span>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Generating summary">
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-[92%] rounded-md" />
      <Skeleton className="h-4 w-[85%] rounded-md" />
      <Skeleton className="h-4 w-[70%] rounded-md" />
    </div>
  );
}
