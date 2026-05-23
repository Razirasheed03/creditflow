"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { FormField } from "@/components/audit/form-field";
import { ToolEntryCard } from "@/components/audit/tool-entry-card";
import { PlanCard } from "@/components/homepage/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { runAudit } from "@/lib/audit-engine";
import {
  auditFormSchema,
  defaultAuditFormValues,
  defaultToolEntry,
  migrateAuditFormValues,
  type AuditFormSchema,
} from "@/lib/audit-schema";
import {
  loadAuditDraft,
  saveAuditDraft,
  saveAuditResults,
} from "@/lib/audit-storage";

export function AuditForm() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<AuditFormSchema>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: defaultAuditFormValues(),
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tools",
  });

  useEffect(() => {
    const draft = loadAuditDraft();
    if (draft) {
      const migrated = migrateAuditFormValues(draft);
      if (migrated) {
        form.reset(migrated);
      }
    }
    setHydrated(true);
  }, [form]);

  const persistDraft = useCallback(
    (values: AuditFormSchema) => {
      if (!hydrated) return;
      saveAuditDraft(values);
    },
    [hydrated]
  );

  useEffect(() => {
    if (!hydrated) return;
    const subscription = form.watch((values) => {
      persistDraft(values as AuditFormSchema);
    });
    return () => subscription.unsubscribe();
  }, [form, hydrated, persistDraft]);

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = runAudit(values);
      if (result.invalidToolCount > 0) {
        setSubmitError(
          "Some tools could not be validated. Fix plan selections and try again."
        );
        return;
      }
      saveAuditResults(result);
      router.push("/results");
    } catch {
      setSubmitError(
        "Something went wrong while running the audit. Check your inputs and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  });

  const { isValid, isDirty } = form.formState;
  const canSubmit = isValid && (isDirty || hydrated);

  if (!hydrated) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading form">
        <div className="h-32 rounded-2xl bg-muted" />
        <div className="h-64 rounded-2xl bg-muted" />
        <div className="h-64 rounded-2xl bg-muted" />
      </div>
    );
  }

  const toolErrors = form.formState.errors.tools;

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      <PlanCard className="p-6 sm:p-8">
        <h2 className="text-xl font-bold tracking-tight">Team context</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Used to right-size seat counts and team vs. individual plans.
        </p>
        <div className="mt-6 max-w-xs">
          <FormField
            label="Total team size"
            error={form.formState.errors.teamSize?.message}
          >
            <Input
              type="number"
              min={1}
              step={1}
              className="h-11 bg-white"
              {...form.register("teamSize", { valueAsNumber: true })}
            />
          </FormField>
        </div>
      </PlanCard>

      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">AI tools</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add every subscription or API line item you want analyzed.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            onClick={() => append(defaultToolEntry())}
          >
            <Plus className="size-4" aria-hidden />
            Add tool
          </Button>
        </div>

        {form.formState.errors.tools?.message ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {form.formState.errors.tools.message}
          </p>
        ) : null}

        {fields.map((field, index) => (
          <ToolEntryCard
            key={field.id}
            index={index}
            control={form.control}
            register={form.register}
            setValue={form.setValue}
            errors={
              Array.isArray(toolErrors) ? toolErrors[index] : undefined
            }
            canRemove={fields.length > 1}
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      {submitError ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}

      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className="h-14 rounded-xl bg-neutral-900 px-10 text-lg font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden />
              Analyzing spend…
            </>
          ) : (
            "Run audit"
          )}
        </Button>
      </div>
      {!canSubmit && !isSubmitting ? (
        <p className="text-right text-xs text-muted-foreground">
          Complete all required fields with valid plans and spend above $0 to run
          the audit.
        </p>
      ) : null}
    </form>
  );
}
