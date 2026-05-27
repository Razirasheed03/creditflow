import { ImageResponse } from "next/og";

import { getAuditByShareId, getPublicSavingsLabel } from "@/lib/audits/repository";
import { ShareOgImageContent } from "@/lib/share/og-image";
import {
  buildDefaultShareOgSubline,
  buildShareOgSubline,
} from "@/lib/share/public-metadata";

export const alt = "CreditFlow AI Spend Audit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const row = await getAuditByShareId(id);
    if (!row) {
      throw new Error("not_found");
    }
    const result = row.result_data;
    const isAlreadyOptimized =
      result.totalMonthlySavings <= 0 && result.totalAnnualSavings <= 0;

    return new ImageResponse(
      (
        <ShareOgImageContent
          headline={getPublicSavingsLabel(row.estimated_savings)}
          subline={buildShareOgSubline(
            result,
            row.estimated_savings,
            isAlreadyOptimized
          )}
        />
      ),
      { ...size }
    );
  } catch {
    return new ImageResponse(
      (
        <ShareOgImageContent
          headline="AI Spend Audit by CreditFlow"
          subline={buildDefaultShareOgSubline()}
        />
      ),
      { ...size }
    );
  }
}
