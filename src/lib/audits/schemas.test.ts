import { describe, expect, it } from "vitest";

import { runAudit } from "@/lib/audit-engine";
import { getDemoScenario } from "@/lib/audit-demo-scenarios";
import {
  createAuditSchema,
  leadCaptureSchema,
} from "@/lib/audits/schemas";

describe("API zod schemas", () => {
  describe("createAuditSchema", () => {
    it("accepts valid audit + result payloads", () => {
      const form = getDemoScenario("overspending_startup");
      const result = runAudit(form);

      const parsed = createAuditSchema.safeParse({
        auditData: form,
        resultData: result,
      });

      expect(parsed.success).toBe(true);
    });

    it("rejects honeypot website field content as valid parse but API handles separately", () => {
      const form = getDemoScenario("optimized_solo");
      const result = runAudit(form);

      const parsed = createAuditSchema.safeParse({
        auditData: form,
        resultData: result,
        website: "https://spam.example",
      });

      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.website).toBe("https://spam.example");
      }
    });

    it("rejects malformed audit data", () => {
      const parsed = createAuditSchema.safeParse({
        auditData: { teamSize: 0, tools: [] },
        resultData: {},
      });

      expect(parsed.success).toBe(false);
    });
  });

  describe("leadCaptureSchema", () => {
    it("requires valid email and shareId", () => {
      const parsed = leadCaptureSchema.safeParse({
        shareId: "abc12345xy",
        email: "lead@company.com",
        companyName: "Acme",
        role: "CTO",
      });

      expect(parsed.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const parsed = leadCaptureSchema.safeParse({
        shareId: "abc12345xy",
        email: "not-email",
      });

      expect(parsed.success).toBe(false);
    });
  });
});
