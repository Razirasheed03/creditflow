"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/audit/form-field";
import { PlanCard } from "@/components/homepage/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLeadCapture } from "@/lib/audits/api-client";
import { hasSubmittedLead, markLeadSubmitted } from "@/lib/audit-storage";

const leadFormSchema = z.object({
  email: z.string().email("Enter a valid work email"),
  companyName: z.string().max(120).optional(),
  role: z.string().max(80).optional(),
  website: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

type LeadCaptureSectionProps = {
  shareId: string;
};

export function LeadCaptureSection({ shareId }: LeadCaptureSectionProps) {
  const [submitted, setSubmitted] = useState(() => hasSubmittedLead(shareId));
  const [emailSent, setEmailSent] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { email: "", companyName: "", role: "", website: "" },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (values.website?.trim()) return;

    setError(null);
    try {
      const result = await submitLeadCapture({
        shareId,
        email: values.email,
        companyName: values.companyName,
        role: values.role,
      });
      markLeadSubmitted(shareId);
      setSubmitted(true);
      setEmailSent(result.emailSent ?? false);
    } catch {
      setError(
        "We couldn't save your details right now. Please try again in a moment."
      );
    }
  });

  if (submitted) {
    return (
      <PlanCard className="border-[var(--credex-green)]/25 bg-[var(--credex-green)]/5 p-6 sm:p-8">
        <p className="text-lg font-bold tracking-tight">
          You&apos;re on the list
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {emailSent
            ? "We've emailed your audit summary with savings highlights and a link to your shareable report."
            : "Your details are saved. Share your report link above with finance or engineering leads."}
        </p>
      </PlanCard>
    );
  }

  return (
    <PlanCard className="relative overflow-hidden border-neutral-200/90 p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--credex-green)]/50 to-transparent"
        aria-hidden
      />
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--credex-green)]/10">
          <Mail className="size-5 text-[var(--credex-green)]" aria-hidden />
        </span>
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Get your complete optimization report
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We&apos;ll email your savings summary, top recommendations, and
            shareable report link. No spam — unsubscribe anytime.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden
          {...form.register("website")}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Work email"
            className="sm:col-span-2"
            error={form.formState.errors.email?.message}
          >
            <Input
              type="email"
              placeholder="you@company.com"
              className="h-11 bg-white"
              {...form.register("email")}
            />
          </FormField>
          <FormField
            label="Company (optional)"
            error={form.formState.errors.companyName?.message}
          >
            <Input
              placeholder="Acme Inc."
              className="h-11 bg-white"
              {...form.register("companyName")}
            />
          </FormField>
          <FormField label="Role (optional)" error={form.formState.errors.role?.message}>
            <Input
              placeholder="Head of Engineering"
              className="h-11 bg-white"
              {...form.register("role")}
            />
          </FormField>
        </div>

        {error ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="h-12 rounded-xl bg-neutral-900 px-8 text-base font-semibold text-white hover:bg-neutral-800"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Sending report…
            </>
          ) : (
            "Email my full report"
          )}
        </Button>
      </form>
    </PlanCard>
  );
}
