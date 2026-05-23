"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";

import { FormField } from "@/components/audit/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDefaultPlanTierId,
  getPlanOptionsForTool,
  SUPPORTED_TOOLS_LIST,
} from "@/data/pricing";
import type { AuditFormSchema } from "@/lib/audit-schema";
import { PRIMARY_USE_CASES } from "@/types/audit";
import type { SupportedToolId } from "@/types/audit";

type ToolEntryErrors = NonNullable<
  FieldErrors<AuditFormSchema>["tools"]
>[number];

const USE_CASE_LABELS: Record<(typeof PRIMARY_USE_CASES)[number], string> = {
  coding: "Coding",
  writing: "Writing",
  research: "Research",
  data_analysis: "Data Analysis",
  mixed: "Mixed",
};

type ToolEntryCardProps = {
  index: number;
  control: Control<AuditFormSchema>;
  register: UseFormRegister<AuditFormSchema>;
  setValue: UseFormSetValue<AuditFormSchema>;
  errors?: ToolEntryErrors;
  onRemove: () => void;
  canRemove: boolean;
};

export function ToolEntryCard({
  index,
  control,
  register,
  setValue,
  errors,
  onRemove,
  canRemove,
}: ToolEntryCardProps) {
  const toolErrors = errors;
  const toolId = useWatch({
    control,
    name: `tools.${index}.toolId`,
  }) as SupportedToolId;

  const planTierId = useWatch({
    control,
    name: `tools.${index}.planTierId`,
  });

  const planOptions = useMemo(
    () => getPlanOptionsForTool(toolId ?? "cursor"),
    [toolId]
  );

  useEffect(() => {
    if (!toolId) return;
    const valid = planOptions.some((o) => o.value === planTierId);
    if (!valid) {
      setValue(`tools.${index}.planTierId`, getDefaultPlanTierId(toolId), {
        shouldValidate: true,
      });
    }
  }, [toolId, planOptions, planTierId, index, setValue]);

  return (
    <div className="rounded-2xl border border-neutral-200/90 bg-card p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-lg font-bold tracking-tight">
          Tool {index + 1}
        </h3>
        {canRemove ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="size-4" aria-hidden />
            Remove
          </Button>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Tool" error={toolErrors?.toolId?.message}>
          <Controller
            control={control}
            name={`tools.${index}.toolId`}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue(
                    `tools.${index}.planTierId`,
                    getDefaultPlanTierId(value as SupportedToolId),
                    { shouldValidate: true }
                  );
                }}
              >
                <SelectTrigger className="h-11 w-full bg-white">
                  <SelectValue placeholder="Select tool" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_TOOLS_LIST.map((tool) => (
                    <SelectItem key={tool.id} value={tool.id}>
                      {tool.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label="Current plan"
          error={toolErrors?.planTierId?.message}
        >
          <Controller
            control={control}
            name={`tools.${index}.planTierId`}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-11 w-full bg-white">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {planOptions.map((plan) => (
                    <SelectItem key={plan.value} value={plan.value}>
                      {plan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label="Monthly spend (USD)"
          error={toolErrors?.monthlySpend?.message}
          hint="From your latest invoice or billing dashboard"
        >
          <Input
            type="number"
            min={1}
            step={1}
            className="h-11 bg-white"
            placeholder="2400"
            {...register(`tools.${index}.monthlySpend`, {
              valueAsNumber: true,
            })}
          />
        </FormField>

        <FormField label="Seats" error={toolErrors?.seats?.message}>
          <Input
            type="number"
            min={1}
            step={1}
            className="h-11 bg-white"
            placeholder="12"
            {...register(`tools.${index}.seats`, {
              valueAsNumber: true,
            })}
          />
        </FormField>

        <FormField
          label="Primary use case"
          className="sm:col-span-2"
          error={toolErrors?.primaryUseCase?.message}
        >
          <Controller
            control={control}
            name={`tools.${index}.primaryUseCase`}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-11 w-full bg-white">
                  <SelectValue placeholder="Select use case" />
                </SelectTrigger>
                <SelectContent>
                  {PRIMARY_USE_CASES.map((useCase) => (
                    <SelectItem key={useCase} value={useCase}>
                      {USE_CASE_LABELS[useCase]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>
    </div>
  );
}
