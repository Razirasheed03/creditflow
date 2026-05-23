export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function trimToWordRange(
  text: string,
  minWords: number,
  maxWords: number
): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return words.join(" ");
  }
  return words.slice(0, maxWords).join(" ").replace(/[,;]\s*$/, ".");
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function extractDollarAmounts(text: string): number[] {
  const matches = text.match(/\$[\d,]+(?:\.\d{1,2})?/g) ?? [];
  return matches.map((m) =>
    Number.parseInt(m.replace(/[$,]/g, ""), 10)
  ).filter((n) => Number.isFinite(n) && n > 0);
}

export function amountsMatchAllowed(
  mentioned: number[],
  allowed: number[],
  tolerance = 1
): boolean {
  if (mentioned.length === 0) return true;
  return mentioned.every((value) =>
    allowed.some((allowedValue) => Math.abs(value - allowedValue) <= tolerance)
  );
}
