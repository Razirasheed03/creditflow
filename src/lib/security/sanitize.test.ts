import { describe, expect, it } from "vitest";

import {
  isValidShareId,
  sanitizeEmail,
  sanitizeText,
} from "@/lib/security/sanitize";

describe("security sanitize", () => {
  describe("sanitizeEmail", () => {
    it("normalizes valid emails", () => {
      expect(sanitizeEmail("  User@Example.COM ")).toBe("user@example.com");
    });

    it("returns null for invalid emails", () => {
      expect(sanitizeEmail("not-an-email")).toBeNull();
      expect(sanitizeEmail("")).toBeNull();
    });
  });

  describe("sanitizeText", () => {
    it("trims and strips control characters", () => {
      expect(sanitizeText("  hello\u0000world  ", 50)).toBe("helloworld");
    });

    it("enforces max length", () => {
      expect(sanitizeText("abcdefghij", 5)).toBe("abcde");
    });
  });

  describe("isValidShareId", () => {
    it("accepts alphanumeric share ids within length bounds", () => {
      expect(isValidShareId("aBc12345_")).toBe(true);
    });

    it("rejects short or invalid characters", () => {
      expect(isValidShareId("short")).toBe(false);
      expect(isValidShareId("has spaces!!")).toBe(false);
    });
  });
});
