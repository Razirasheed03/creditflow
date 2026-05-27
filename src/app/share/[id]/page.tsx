import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { AuditResultsView } from "@/components/results/audit-results-view";
import { LeadCaptureSection } from "@/components/results/lead-capture-section";
import { ShareReportActions } from "@/components/results/share-report-actions";
import { Button } from "@/components/ui/button";
import {
  AuditRepositoryError,
  getAuditByShareId,
} from "@/lib/audits/repository";
import { buildPublicShareMetadata } from "@/lib/share/public-metadata";
import type { AuditResult } from "@/types/audit";
import type { EstimatedSavings } from "@/types/database";

type PageProps = {
  params: Promise<{ id: string }>;
};

type PublicAuditPayload = {
  shareId: string;
  result: AuditResult;
  estimatedSavings: EstimatedSavings;
  isAlreadyOptimized: boolean;
};

async function loadPublicAudit(shareId: string): Promise<PublicAuditPayload> {
  const row = await getAuditByShareId(shareId);
  if (!row) {
    throw new AuditRepositoryError("Audit not found", "not_found");
  }
  const result = row.result_data;
  const isAlreadyOptimized =
    result.totalMonthlySavings <= 0 && result.totalAnnualSavings <= 0;

  return {
    shareId: row.share_id,
    result,
    estimatedSavings: row.estimated_savings,
    isAlreadyOptimized,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const audit = await loadPublicAudit(id);
    return buildPublicShareMetadata({
      shareId: audit.shareId,
      result: audit.result,
      estimatedSavings: audit.estimatedSavings,
      isAlreadyOptimized: audit.isAlreadyOptimized,
    });
  } catch {
    return {
      title: "Shared audit not found | CreditFlow",
      description:
        "This share link is invalid or has expired. Run a new AI spend audit on CreditFlow.",
      robots: { index: false, follow: false },
    };
  }
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params;

  let audit: PublicAuditPayload;
  try {
    audit = await loadPublicAudit(id);
  } catch (error) {
    if (error instanceof AuditRepositoryError && error.code === "not_found") {
      notFound();
    }
    throw error;
  }

  const { result, isAlreadyOptimized } = audit;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              Shared audit report
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {isAlreadyOptimized
                ? "AI spend audit — already optimized"
                : "AI spend audit — savings opportunities"}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">
              Public view of an engine-verified audit. Contact details and
              private notes are never shown on shared reports.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                className="h-11 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
                asChild
              >
                <Link href="/">Run your own audit</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-background">
          <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6 sm:py-16">
            <AuditResultsView result={result} showAiSummary={false} />
            <ShareReportActions shareId={audit.shareId} />
            <LeadCaptureSection shareId={audit.shareId} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
