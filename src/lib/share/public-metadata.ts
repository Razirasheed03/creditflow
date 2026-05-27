import type { Metadata } from "next";

import { formatCurrency } from "@/data/pricing";
import { getPublicSavingsLabel } from "@/lib/audits/repository";
import type { AuditResult } from "@/types/audit";
import type { EstimatedSavings } from "@/types/database";

import { getAppOrigin } from "./app-origin";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

export type PublicShareMetadataInput = {
  shareId: string;
  result: AuditResult;
  estimatedSavings: EstimatedSavings;
  isAlreadyOptimized: boolean;
};

/** Public-only description — never includes email, company, or raw form fields. */
export function buildPublicShareDescription(
  result: AuditResult,
  savings: EstimatedSavings,
  isAlreadyOptimized: boolean
): string {
  const teamSize = result.teamSize;
  const toolCount = result.recommendations.length;
  const monthlySpend = formatCurrency(result.totalCurrentSpend);

  if (isAlreadyOptimized) {
    return `AI spend audit for a ${teamSize}-person team across ${toolCount} tools (${monthlySpend}/mo). Stack is already well optimized — view plan breakdowns and recommendations on CreditFlow.`;
  }

  const annual = Math.round(savings.annual);
  return `Reduce unnecessary AI SaaS spending. This audit found $${annual.toLocaleString("en-US")}/year in potential savings for a ${teamSize}-person team (${monthlySpend}/mo across ${toolCount} tools).`;
}

export function buildPublicShareMetadata(
  input: PublicShareMetadataInput
): Metadata {
  const origin = getAppOrigin();
  const metadataBase = new URL(origin);
  const path = `/share/${input.shareId}`;
  const headline = getPublicSavingsLabel(input.estimatedSavings);
  const title = `${headline} | CreditFlow`;
  const description = buildPublicShareDescription(
    input.result,
    input.estimatedSavings,
    input.isAlreadyOptimized
  );

  const primaryOg = new URL(`/share/${input.shareId}/opengraph-image`, metadataBase).toString();
  const fallbackOg = new URL("/share/opengraph-image", metadataBase).toString();
  const canonicalUrl = new URL(path, metadataBase).toString();

  return {
    metadataBase,
    title,
    description,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      siteName: "CreditFlow",
      title: headline,
      description,
      url: canonicalUrl,
      locale: "en_US",
      images: [
        {
          url: primaryOg,
          secureUrl: primaryOg,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          alt: headline,
          type: "image/png",
        },
        {
          url: fallbackOg,
          secureUrl: fallbackOg,
          width: OG_WIDTH,
          height: OG_HEIGHT,
          alt: "AI Spend Audit by CreditFlow",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: headline,
      description,
      images: {
        url: primaryOg,
        alt: headline,
      },
    },
  };
}

export function buildDefaultShareOgSubline(): string {
  return "Reduce unnecessary AI SaaS spending across ChatGPT, Claude, Cursor, and more.";
}

export function buildShareOgSubline(
  result: AuditResult,
  savings: EstimatedSavings,
  isAlreadyOptimized: boolean
): string {
  if (isAlreadyOptimized) {
    return `${result.teamSize}-person team · ${formatCurrency(result.totalCurrentSpend)}/mo AI spend · already optimized`;
  }
  return `${result.teamSize}-person team · ${formatCurrency(result.totalCurrentSpend)}/mo spend · ${Math.round(savings.rate_percent)}% savings opportunity`;
}
