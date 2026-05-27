"use client";

import { Check, Copy, ExternalLink, Link2, Share2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PlanCard } from "@/components/homepage/primitives";
import { Button } from "@/components/ui/button";
import { getPublicShareUrl } from "@/lib/share/share-url";

type ShareReportActionsProps = {
  shareId: string;
};

type ShareFeedback = "copied" | "shared" | null;

export function ShareReportActions({ shareId }: ShareReportActionsProps) {
  const [feedback, setFeedback] = useState<ShareFeedback>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const shareUrl = getPublicShareUrl(shareId);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
  }, []);

  const clearFeedbackSoon = useCallback(() => {
    window.setTimeout(() => setFeedback(null), 2500);
  }, []);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setFeedback("copied");
      clearFeedbackSoon();
    } catch {
      setFeedback(null);
    }
  }, [shareUrl, clearFeedbackSoon]);

  const shareNative = useCallback(async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: "CreditFlow AI Spend Audit",
        text: "Engine-verified AI spend audit — savings, recommendations, and plan breakdowns.",
        url: shareUrl,
      });
      setFeedback("shared");
      clearFeedbackSoon();
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
      await copyLink();
    }
  }, [shareUrl, clearFeedbackSoon, copyLink]);

  return (
    <PlanCard className="p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <Link2 className="size-5 text-credex-green" aria-hidden />
        <h2 className="text-lg font-bold">Share audit</h2>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Send this public report to your team. Rich previews appear on Twitter/X,
        LinkedIn, Slack, Discord, and WhatsApp — contact details are never
        included.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-muted/30 px-4 py-3 text-xs text-muted-foreground break-all sm:text-sm sm:truncate"
          aria-label="Public share URL"
        >
          {shareUrl}
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          {canNativeShare ? (
            <Button
              type="button"
              className="h-11 w-full rounded-xl bg-[var(--credex-green)] text-white hover:bg-[var(--credex-green)]/90 sm:w-auto"
              onClick={() => void shareNative()}
              aria-label="Share audit using device share sheet"
            >
              <Share2 className="size-4" aria-hidden />
              Share
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-xl border-neutral-200 bg-white sm:w-auto"
            onClick={() => void copyLink()}
            aria-label={feedback === "copied" ? "Share link copied" : "Copy share link"}
          >
            {feedback === "copied" ? (
              <>
                <Check className="size-4 text-credex-green" aria-hidden />
                Copied
              </>
            ) : (
              <>
                <Copy className="size-4" aria-hidden />
                Copy link
              </>
            )}
          </Button>
          <Button
            className="h-11 w-full rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 sm:w-auto"
            asChild
          >
            <Link
              href={`/share/${shareId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open public report in a new tab"
            >
              <ExternalLink className="size-4" aria-hidden />
              Open report
            </Link>
          </Button>
        </div>
      </div>

      {feedback ? (
        <p
          className="mt-3 text-sm font-medium text-credex-green"
          role="status"
          aria-live="polite"
        >
          {feedback === "shared"
            ? "Share sheet opened — send to your team or social apps."
            : "Share link copied to clipboard."}
        </p>
      ) : null}
    </PlanCard>
  );
}
