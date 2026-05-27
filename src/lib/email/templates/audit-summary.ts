import { formatCurrency } from "@/data/pricing";
import { getAppOrigin } from "@/lib/share/app-origin";
import { getSharePath } from "@/lib/share/share-url";
import type { AuditRow } from "@/types/database";

export function buildAuditSummaryEmail(row: AuditRow): {
  subject: string;
  html: string;
  text: string;
} {
  const result = row.result_data;
  const savings = row.estimated_savings;
  const origin = getAppOrigin();
  const shareUrl = `${origin}${getSharePath(row.share_id)}`;
  const auditUrl = `${origin}/audit`;

  const annualLabel = result.isAlreadyOptimized
    ? "Your stack looks well-optimized"
    : `~${formatCurrency(savings.annual)}/year in potential savings`;

  const subject = result.isAlreadyOptimized
    ? "Your CreditFlow AI spend audit"
    : `Your audit: ${formatCurrency(savings.annual)}/yr in AI savings`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f7f8f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#171717;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e5e5e5;overflow:hidden;">
          <tr>
            <td style="padding:32px 32px 24px;background:#111827;color:#f9fafb;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.6;">CreditFlow</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;line-height:1.3;">Your AI spend audit is ready</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#404040;">
                ${annualLabel}. You audited <strong>${result.toolsAudited} tools</strong> with
                <strong>${formatCurrency(result.totalCurrentSpend)}/mo</strong> in reported spend.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;background:#f7f8f9;border-radius:12px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#737373;">Monthly savings</p>
                    <p style="margin:0;font-size:20px;font-weight:700;color:#16a34a;">
                      ${result.isAlreadyOptimized ? "—" : formatCurrency(savings.monthly)}
                    </p>
                  </td>
                  <td style="padding:16px 20px;border-left:1px solid #e5e5e5;">
                    <p style="margin:0 0 4px;font-size:12px;color:#737373;">Annual savings</p>
                    <p style="margin:0;font-size:20px;font-weight:700;color:#16a34a;">
                      ${result.isAlreadyOptimized ? "—" : formatCurrency(savings.annual)}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#525252;">
                ${result.summaryMessage}
              </p>
              <a href="${shareUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 24px;border-radius:10px;">
                View shareable report
              </a>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#737373;">
                Want help implementing changes? Reply to this email or
                <a href="${auditUrl}" style="color:#16a34a;">run another audit</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f0f0f0;font-size:11px;color:#a3a3a3;line-height:1.5;">
              Estimates use your submitted inputs and published pricing benchmarks — confirm with invoices before changing contracts.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

  const text = [
    "Your CreditFlow AI spend audit",
    "",
    annualLabel,
    `Tools audited: ${result.toolsAudited}`,
    `Current spend: ${formatCurrency(result.totalCurrentSpend)}/mo`,
    result.isAlreadyOptimized
      ? "No material savings identified."
      : `Estimated savings: ${formatCurrency(savings.monthly)}/mo (${formatCurrency(savings.annual)}/yr)`,
    "",
    result.summaryMessage,
    "",
    `View report: ${shareUrl}`,
    `Run another audit: ${auditUrl}`,
  ].join("\n");

  return { subject, html, text };
}
