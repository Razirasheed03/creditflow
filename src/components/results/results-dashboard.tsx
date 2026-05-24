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
import { buildDemoAuditForm, buildDemoAuditResult } from "@/lib/audit-demo";
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
  const [hydrated, setHydrated] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stored = loadAuditResults();
    const queryShare = params.get("share");
    const storedShare = loadShareId();

    const init = async () => {
      if (!stored && params.get("demo") === "1") {
        const demoResult = buildDemoAuditResult();
        saveAuditResults(demoResult);
        try {
          const { shareId: created } = await persistAuditToServer({
            auditData: buildDemoAuditForm(),
            resultData: demoResult,
          });
          saveShareId(created);
          setShareId(created);
        } catch (err) {
          setShareId(null);
          setPersistError(
            err instanceof Error ? err.message : "Demo audit could not be saved"
          );
        }
        setResult(demoResult);
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
      <AuditResultsView result={result} showAiSummary />

      {!shareId ? (
        <PersistAuditBanner result={result} onPersisted={setShareId} />
      ) : null}

      {persistError && shareId ? (
        <p className="text-sm text-muted-foreground" role="status">
          Previous save attempt: {persistError}
        </p>
      ) : null}

      {shareId ? <ShareReportActions shareId={shareId} /> : null}

      {shareId ? <LeadCaptureSection shareId={shareId} /> : null}

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
