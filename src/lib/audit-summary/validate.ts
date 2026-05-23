import { getAllowedDollarAmounts } from "./context";
import type { SummaryContext } from "./types";
import {
  amountsMatchAllowed,
  countWords,
  extractDollarAmounts,
} from "./utils";

const MIN_WORDS = 60;
const MAX_WORDS = 140;

export function isValidAiSummary(
  text: string,
  context: SummaryContext
): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  const words = countWords(trimmed);
  if (words < MIN_WORDS || words > MAX_WORDS) return false;

  const mentioned = extractDollarAmounts(trimmed);
  const allowed = getAllowedDollarAmounts(context);
  if (!amountsMatchAllowed(mentioned, allowed)) return false;

  return true;
}
