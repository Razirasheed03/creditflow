"use client";

import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { PlanCard } from "@/components/homepage/primitives";
import { Button } from "@/components/ui/button";
import { getShareUrl } from "@/lib/audit-storage";

type ShareReportActionsProps = {
  shareId: string;
};

export function ShareReportActions({ shareId }: ShareReportActionsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getShareUrl(shareId);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }, [shareUrl]);

  return (
    <PlanCard className="p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <Link2 className="size-5 text-credex-green" aria-hidden />
        <h2 className="text-lg font-bold">Share this audit</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Send a public link to your team — contact details are never included on
        shared reports.
      </p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 rounded-xl border border-neutral-200 bg-muted/30 px-4 py-3 text-sm text-muted-foreground truncate">
          {shareUrl}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-neutral-200 bg-white"
            onClick={() => void copyLink()}
          >
            {copied ? (
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
            className="h-11 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800"
            asChild
          >
            <Link href={`/share/${shareId}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" aria-hidden />
              Open report
            </Link>
          </Button>
        </div>
      </div>

      {copied ? (
        <p
          className="mt-3 text-sm font-medium text-credex-green"
          role="status"
          aria-live="polite"
        >
          Share link copied to clipboard.
        </p>
      ) : null}
    </PlanCard>
  );
}
