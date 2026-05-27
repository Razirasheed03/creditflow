# CreditFlow — Economics

CreditFlow is a **free lead-gen product** right now. No Stripe, no plans, no usage metering in the repo—just audits in Supabase, optional Brevo on lead submit, and optional LLM copy on private `/results`. Below: what it costs to run today, what you’d have to build to charge, funnel math, and a **scenario** (not a forecast) for $1M ARR.

**Live:** https://creditflow-audit.vercel.app

---

## Revenue today

**$0.** Monetization isn’t implemented. The only “capture” is a row in `public.audits` with `email` / `company_name` / `role` after someone sees results (`LeadCaptureSection` → `POST /api/audits/[shareId]/lead`).

Anything labeled **Phase 2** below still needs to be shipped—auth, billing, PDF, etc.

---

## What actually costs money

- **Vercel** — Next.js, Route Handlers, SSR `/share/[id]`, `next/og` routes. Hobby $0 → ~$20/mo Pro if you hit limits.
- **Supabase** — insert audit, update lead, read on share/OG. Free tier → ~$25/mo Pro at volume.
- **Brevo** — one transactional email per lead (`send-audit-summary.ts`). Free tier (300/day) until you scale.
- **OpenAI / Anthropic** — optional `POST /api/audit-summary` only; deterministic fallback is free.

No payment processor, CRM, or analytics in the stack.

**Where compute shows up:**

1. **Completed audit** — `runAudit()` in the browser ($0) + `POST /api/audits` + ~15–40 KB JSONB row.
2. **AI summary** (optional) — at most one `/api/audit-summary` per results session (`sessionStorage` cache); skipped if keys aren’t set.
3. **Lead** — lead API + one Brevo send.
4. **Share loop** — SSR share page + OG image route when Slack/X/LinkedIn unfurl—often **2×** serverless per click.

Audit math stays in `src/lib/audit-engine/`; OpenAI only narrates if you turn it on.

---

## Marginal cost per unit

Ballpark for planning—not metered per audit in code.

**Per persisted audit:** `POST /api/audits` ~$0.0001–0.0005, storage negligible, client engine $0. Optional AI summary ~$0.001–0.01. **Total ~$0.001 without AI, up to ~$0.02 with.**

**Per lead:** API + DB update ~$0.0002; Brevo $0 on free tier. **Total ~$0.001–0.002.**

**Per share click (view + unfurl):** SSR + OG generation ~$0.001–0.003 depending on crawlers.

**Example month (made up, not tracked in-app):** 500 audits, 75 leads, 1,500 share views → maybe **$2–15** variable infra plus **$0–45** fixed tiers. **Founder time dominates costs** until you’re doing tens of thousands of audits—not the cloud bill.

Gross margin on the free product is effectively **100%** (no customer COGS). That drops once you add support and payment fees on a paid tier.

---

## Funnel as built

No analytics SDK. Infer stages from Supabase:

```
Visit → /audit → row with share_id → email on row → [no paywall]
```

- **Completed audit** — `audits` row with `result_data` + `share_id`
- **Lead** — `email` not null
- **Share usage** — not stored in DB (UTMs or ask users)
- **Paid** — doesn’t exist

**Illustrative rates for spreadsheet math** (swap in real `COUNT(*)` after launch):

From **1,000 visits**: 25% start audit → 250; 60% complete → 150; ~40% share guess* → 60; 12–18% lead → **18–27 emails**.

\*“40% share” is a guess—there’s no share flag in schema. Leads are the only hard downstream metric today.

At free-only, the **main things to track** are leads per week and share URLs showing up in the wild—not MRR (`GTM.md`).

---

## Phase 2 monetization (not in repo)

Pick a wedge that matches what eng leads already get free:

- **Pro workspace ($79–129/mo)** — auth, history, re-runs, Stripe. Best default for math below.
- **Consultant seat ($149–249/mo)** — multi-client reports; people already use the free tool this way manually.
- **Annual monitor ($990–1,990/yr)** — scheduled re-audit, price alerts—needs cron + catalog maintenance.
- **Success fee (% of savings)** — weak fit; no invoice ingest, trust risk.
- **Vendor lead sell** — don’t; fights the engine-trust story.

**Phase 2 pricing in the rest of this doc is hypothetical** — $99/mo Pro, same ICP as `GTM.md` (8–35 FTE, eng owner). No price testing yet.

---

## Unit economics (after you ship Stripe)

Not current code—a model for post-paywall.

- **ARPU:** $99/mo (or $990/yr with two months free)
- **Gross margin:** ~85% after infra, email, occasional AI, Stripe, light support
- **Churn:** ~5%/mo → ~20 month average life
- **LTV (gross):** ~**$1,683** ($99 × 20 × 0.85)

### CAC assumptions

- **Founder-led (PH, HN, X, Slack):** **$0 cash** — 10–15 hrs/week; opportunity cost stays out of cash CAC
- **Share-loop / content:** **$0–20** if OG links actually drive audits
- **Paid search / LinkedIn later:** **$200–500** — only after paywall + privacy policy; not in Credex MVP

**Target:** CAC **< $400** → LTV:CAC about **4:1** at $99/mo. Payback ~**5 months** (~$84/mo gross profit on a $99 seat).

### Funnel to paid (illustrative)

**1,000 visits/mo** after a launch bump (replace with real traffic):

1,000 visits → 15% complete → 150 → 15% lead → 23 → 20% trial → ~5 → 50% convert → **~2.3 new logos/mo**

**2.3 × $99 ≈ $228 MRR/mo added** (~$2.7k ARR run-rate per month at that traffic).

To move faster: more traffic (**share loop working matters more than ads** early) or better conversion (PDF, SSO, saved stack)—all build work.

---

## Path to $1M ARR (scenario, not a forecast)

$1M ARR ≈ **$83.3k MRR** → about **841 logos at $99/mo** (ignoring annual prepay).

No billing today. This timeline assumes you ship Pro post-Credex and keep **steady organic growth** from `GTM.md`.

| Month | New logos/mo (assumed) | Paying logos | MRR @ $99 |
|-------|------------------------|--------------|-----------|
| 6 | 8 | ~45 | ~$4.5k |
| 12 | 15 | ~120 | ~$12k |
| 18 | 25 | ~280 | ~$28k |
| 24 | 35 | ~520 | ~$52k |
| 30 | 45 | ~750 | ~$74k |
| **36** | **50** | **~850** | **~$84k** |

Roughly **three years** to cross $1M ARR—not a 12-month hockey stick unless traffic or ARPU jumps hard.

**Things that shorten the curve:** $199 Team tier (fewer logos, harder sell), consultant tier at $249/mo, annual prepay for cash, **share loop actually pulling audits**, keeping `catalog.ts` aligned with vendors (`PRICING_DATA.md`).

**Things that break it:** pitching homepage “34% savings” as cohort truth, enterprise before SSO, success fees without invoice proof, paid ads before privacy policy + support inbox.

**Quick sensitivity:** 8% churn vs 5% → need ~30% more gross adds; $79 ARPU vs $99 → ~26% more logos for same ARR; 10 leads/mo from 1k visits → fix conversion before ads; 2× visits from OG → same $0 CAC, double the top of funnel.

---

## Bottom line

**Today:** near-zero variable COGS per audit, **zero ARR**, leads in Supabase are the only monetizable asset.

**Near term:** you’re optimizing **cost per lead** (founder time + email), not LTV—until billing exists.

**$1M ARR:** plausible at **~840 logos × $99/mo** with ~3 years of steady organic growth and a real paid tier—not from the free MVP alone. Share + OG + lead is the cheap acquisition engine; auth, PDF, and Stripe are what turn it into revenue.
