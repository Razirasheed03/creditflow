import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuditResultsView } from "@/components/results/audit-results-view";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PlanCard } from "@/components/homepage/primitives";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/data/pricing";
import {
  getAuditByShareId,
  getPublicSavingsLabel,
} from "@/lib/audits/repository";
import { isValidShareId } from "@/lib/security/sanitize";

export const dynamic = "force-dynamic";

type SharePageProps = {
  params: Promise<{ id: string }>;
};

function appOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isValidShareId(id)) {
    return { title: "Report not found — CreditFlow" };
  }

  const row = await getAuditByShareId(id);
  if (!row) {
    return { title: "Report not found — CreditFlow" };
  }

  const title = getPublicSavingsLabel(row.estimated_savings);
  const description = row.result_data.isAlreadyOptimized
    ? `AI spend audit for a ${row.result_data.teamSize}-person team — ${formatCurrency(row.result_data.totalCurrentSpend)}/mo across ${row.result_data.toolsAudited} tools. Reviewed by CreditFlow.`
    : `Potential ${formatCurrency(row.estimated_savings.annual)}/year in AI tooling savings. ${row.result_data.toolsAudited} tools audited · ${formatCurrency(row.result_data.totalCurrentSpend)}/mo current spend.`;

  const url = `${appOrigin()}/share/${id}`;

  return {
    title: `${title} — CreditFlow`,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "CreditFlow",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;

  if (!isValidShareId(id)) {
    notFound();
  }

  const row = await getAuditByShareId(id);
  if (!row) {
    notFound();
  }

  const result = row.result_data;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Shared report
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            AI spend audit
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Public summary for a {result.teamSize}-person team ·{" "}
            {result.toolsAudited} tools ·{" "}
            {formatCurrency(result.totalCurrentSpend)}/mo reported spend
          </p>
        </div>

        <AuditResultsView result={result} showAiSummary={false} />

        <PlanCard className="mt-10 p-8 text-center sm:p-10">
          <h2 className="text-xl font-bold tracking-tight">
            Run your own audit
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Free AI spend analysis for Cursor, ChatGPT, Claude, Copilot, and
            more — no account required.
          </p>
          <Button
            className="mt-6 h-12 rounded-xl bg-neutral-900 px-8 text-base font-semibold text-white"
            asChild
          >
            <Link href="/audit">Start free audit</Link>
          </Button>
        </PlanCard>
      </main>
      <SiteFooter />
    </div>
  );
}
