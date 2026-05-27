# CreditFlow — Tests

Vitest suite for **business logic** (audit engine, pricing, schemas, summary validation, share metadata). No component tests, no E2E, no live Supabase/Brevo calls.

```bash
npm test          # run once
npm run test:watch
```

Config: `vitest.config.ts` (Node env, `@/*` alias). **40 tests** in **9 files** as of last run.

---

## What’s covered

| File | Tests | What it checks |
|------|-------|----------------|
| `src/lib/audit-engine/run-audit.test.ts` | 7 | `runAudit()` on demo scenarios — savings, overlaps, invalid plan → no fake savings, spend caps |
| `src/data/pricing/helpers.test.ts` | 8 | `estimateTierMonthlyCost`, plan aliases, tier helpers |
| `src/data/pricing/overlap.test.ts` | 4 | Stack overlap thresholds |
| `src/lib/audits/schemas.test.ts` | 5 | `createAuditSchema`, `leadCaptureSchema` |
| `src/lib/audits/savings.test.ts` | 1 | `buildEstimatedSavings` shape |
| `src/lib/audits/share-id.test.ts` | 3 | `generateShareId` format/uniqueness |
| `src/lib/audit-summary/validate.test.ts` | 4 | Fallback text + rejecting bad dollar amounts |
| `src/lib/security/sanitize.test.ts` | 6 | Email, text, share ID validation |
| `src/lib/share/public-metadata.test.ts` | 2 | Public description doesn’t mention lead fields; OG image URL |

`run-audit.test.ts` exercises the engine end-to-end (sanitize, rules pipeline, finalize, overlaps) but **not** each rule in isolation. `enterprise_heavy` demo scenario isn’t in tests yet.

---

## What’s not covered (manual or TODO)

- Next.js pages, audit form UI, `localStorage` drafts
- API routes (`/api/audits`, lead, audit-summary) against real Supabase
- Brevo send path
- OG image routes (`ImageResponse`)
- Live OpenAI/Anthropic calls (`generateAuditSummary` / providers)
- Honeypot `website` field on POST
- CI job — no GitHub Action in repo; run `npm test` locally before submit

Reason: 7-day scope prioritized the audit engine and summary guards over full-stack integration tests.

---

## Manual checklist

After `npm run dev` + `.env.local` (see `README.md`):

**Audit**

1. `/audit` — multi-tool form, plan dropdowns, submit → `/results?share=…`
2. Cards, totals, trust note look right
3. Invalid plan blocked on submit

**Persist & share**

4. Row in Supabase after audit (if env configured)
5. `/share/{shareId}` in incognito — results visible, no email/company
6. Copy link / open public report

**Lead & email**

7. Lead form updates `email` on audit row
8. Brevo email sends when keys set; UI still OK when skipped

**Social / AI**

9. `NEXT_PUBLIC_APP_URL` set on deploy; `/share/{id}/opengraph-image` returns PNG
10. Paste share URL in Slack or LinkedIn — preview looks sane
11. `/results` shows AI summary or “Analyst narrative” fallback; `/share` has no AI block
12. `GET /api/audits/health` → `ok: true` when Supabase configured

**Demo**

13. `/results?demo=1` — sample data, no share/email

---

## If you add more tests

Co-locate `*.test.ts` next to the module. Good next targets: `rules.test.ts` (one case per rule), mocked `POST /api/audits`. Run `npm test` before pushing.

More detail on system design: `ARCHITECTURE.md`. Pricing constants used in helpers tests: `PRICING_DATA.md`.
