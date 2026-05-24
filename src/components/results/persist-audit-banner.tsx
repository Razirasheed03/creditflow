"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

import { PlanCard } from "@/components/homepage/primitives";
import { Button } from "@/components/ui/button";
import { persistAuditToServer } from "@/lib/audits/api-client";
import { loadAuditInput, saveShareId } from "@/lib/audit-storage";
import type { AuditResult } from "@/types/audit";

type PersistAuditBannerProps = {
  result: AuditResult;
  onPersisted: (shareId: string) => void;
};

export function PersistAuditBanner({ result, onPersisted }: PersistAuditBannerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retry = async () => {
    const auditData = loadAuditInput();
    if (!auditData) {
      setError(
        "Original audit form data is missing. Run a new audit from the audit page."
      );
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { shareId } = await persistAuditToServer({
        auditData,
        resultData: result,
      });
      saveShareId(shareId);
      onPersisted(shareId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save audit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PlanCard className="border-amber-200/80 bg-amber-50/40 p-5 sm:p-6">
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-950">
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        Audit not saved to cloud
      </p>
      <p className="mt-2 text-sm text-amber-950/85">
        Your results are visible locally, but no share link was created. Check
        `.env.local` (Supabase URL + secret key), restart the dev server, then
        retry.
      </p>
      {error ? (
        <p className="mt-3 text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="button"
        variant="outline"
        className="mt-4 h-10 rounded-xl border-amber-300 bg-white"
        disabled={loading}
        onClick={() => void retry()}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          "Retry cloud save"
        )}
      </Button>
    </PlanCard>
  );
}
