"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { AuditResultsView } from "@/components/results/audit-results-view";
import { LeadCaptureSection } from "@/components/results/lead-capture-section";
import { PersistAuditBanner } from "@/components/results/persist-audit-banner";
import { ShareReportActions } from "@/components/results/share-report-actions";
import { PlanCard } from "@/components/homepage/primitives";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { buildDemoAuditResult } from "@/lib/audit-demo";
import { persistAuditToServer } from "@/lib/audits/api-client";
import {
  loadAuditInput,
  loadAuditResults,
  loadShareId,
  saveAuditResults,
  saveShareId,
} from "@/lib/audit-storage";
import type { AuditResult } from "@/types/audit";

function ResultsSkeleton() {
  return (
    <div className="space-y-10">
      <Skeleton className="h-52 w-full rounded-2xl" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}

export function ResultsDashboard() {
  const [result, setResult] = useState<AuditResult | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stored = loadAuditResults();
    const queryShare = params.get("share");
    const storedShare = loadShareId();

    const init = async () => {
      if (params.get("demo") === "1") {
        setIsDemoMode(true);
        const demoResult = buildDemoAuditResult();
        saveAuditResults(demoResult);
        setResult(demoResult);
        setShareId(null);
        setHydrated(true);
        return;
      }

      if (!stored) {
        setHydrated(true);
        return;
      }

      setResult(stored);
      const resolvedShare = queryShare ?? storedShare;
      setShareId(resolvedShare);

      if (!resolvedShare && loadAuditInput()) {
        try {
          const { shareId: created } = await persistAuditToServer({
            auditData: loadAuditInput()!,
            resultData: stored,
          });
          saveShareId(created);
          setShareId(created);
        } catch (err) {
          setPersistError(
            err instanceof Error ? err.message : "Could not save audit"
          );
        }
      }

      setHydrated(true);
    };

    void init();
  }, []);

  if (!hydrated) {
    return <ResultsSkeleton />;
  }

  if (!result) {
    return (
      <PlanCard className="p-10 text-center">
        <h2 className="text-xl font-bold">No audit results yet</h2>
        <p className="mt-3 max-w-md mx-auto text-muted-foreground">
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
    <div className="space-y-10">
      {isDemoMode ? (
        <PlanCard className="border-neutral-200 bg-muted/30 p-5 sm:p-6">
          <p className="text-sm font-semibold text-foreground">Sample audit report</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This is illustrative data only — no share link or email delivery.
            Run your own audit to save results, share with your team, and receive
            a report by email.
          </p>
          <Button
            className="mt-4 h-11 rounded-xl bg-neutral-900 px-6 text-white hover:bg-neutral-800"
            asChild
          >
            <Link href="/audit">Start free audit</Link>
          </Button>
        </PlanCard>
      ) : null}

      <AuditResultsView result={result} showAiSummary />

      {!isDemoMode && !shareId ? (
        <PersistAuditBanner result={result} onPersisted={setShareId} />
      ) : null}

      {persistError && shareId && !isDemoMode ? (
        <p className="text-sm text-muted-foreground" role="status">
          Previous save attempt: {persistError}
        </p>
      ) : null}

      {!isDemoMode && shareId ? (
        <ShareReportActions
          shareId={shareId}
          annualSavings={result.totalAnnualSavings}
        />
      ) : null}

      {!isDemoMode && shareId ? <LeadCaptureSection shareId={shareId} /> : null}

      <div className="flex flex-col gap-3 border-t border-neutral-100 pt-8 sm:flex-row sm:justify-center">
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
