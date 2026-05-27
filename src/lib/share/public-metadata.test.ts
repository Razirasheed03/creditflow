import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { runAudit } from "@/lib/audit-engine";
import { getDemoScenario } from "@/lib/audit-demo-scenarios";
import { buildEstimatedSavings } from "@/lib/audits/savings";
import {
  buildPublicShareDescription,
  buildPublicShareMetadata,
} from "@/lib/share/public-metadata";

describe("public share metadata", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://creditflow-audit.vercel.app";
  });

  afterEach(() => {
    if (originalAppUrl === undefined) {
      delete process.env.NEXT_PUBLIC_APP_URL;
    } else {
      process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
    }
  });

  it("never includes lead or email fields in public description", () => {
    const result = runAudit(getDemoScenario("overspending_startup"));
    const savings = buildEstimatedSavings(result);
    const description = buildPublicShareDescription(
      result,
      savings,
      result.isAlreadyOptimized
    );

    expect(description.toLowerCase()).not.toContain("email");
    expect(description.toLowerCase()).not.toContain("company");
    expect(description).toContain("12-person");
  });

  it("builds OG metadata with share-specific opengraph image path", () => {
    const result = runAudit(getDemoScenario("overspending_startup"));
    const savings = buildEstimatedSavings(result);
    const metadata = buildPublicShareMetadata({
      shareId: "testShare1234",
      result,
      estimatedSavings: savings,
      isAlreadyOptimized: result.isAlreadyOptimized,
    });

    expect(metadata.openGraph?.url).toContain("/share/testShare1234");
    const images = metadata.openGraph?.images;
    const imageList = Array.isArray(images) ? images : images ? [images] : [];
    const urls = imageList.map((img) =>
      typeof img === "string" ? img : img.url
    );

    expect(
      urls.some((u) => String(u).includes("/share/testShare1234/opengraph-image"))
    ).toBe(true);
    expect(metadata.twitter?.card).toBe("summary_large_image");
  });
});
