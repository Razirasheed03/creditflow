import { describe, expect, it } from "vitest";

import { generateShareId } from "@/lib/audits/share-id";
import { isValidShareId } from "@/lib/security/sanitize";

describe("generateShareId", () => {
  it("produces 12-character alphanumeric ids by default", () => {
    const id = generateShareId();
    expect(id).toHaveLength(12);
    expect(id).toMatch(/^[a-zA-Z0-9]+$/);
    expect(isValidShareId(id)).toBe(true);
  });

  it("respects custom length", () => {
    const id = generateShareId(16);
    expect(id).toHaveLength(16);
  });

  it("generates unique ids across many calls", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateShareId()));
    expect(ids.size).toBe(50);
  });
});
