import type { AuditFormValues, AuditResult } from "@/types/audit";

export type EstimatedSavings = {
  monthly: number;
  annual: number;
  rate_percent: number;
};

export type AuditRow = {
  id: string;
  share_id: string;
  audit_data: AuditFormValues;
  result_data: AuditResult;
  estimated_savings: EstimatedSavings;
  email: string | null;
  company_name: string | null;
  role: string | null;
  created_at: string;
};

export type AuditInsert = {
  share_id: string;
  audit_data: AuditFormValues;
  result_data: AuditResult;
  estimated_savings: EstimatedSavings;
};

export type AuditLeadUpdate = {
  email: string;
  company_name?: string | null;
  role?: string | null;
};
