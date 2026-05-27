# CreditFlow — Week reflection

Seven-day Credex build. Stack: Next.js App Router, rule-based audit engine, Supabase, Brevo email, optional AI summary on `/results` only. Deployed at https://creditflow-audit.vercel.app

---

## 1. The hardest bug this week

The worst one was **audits not showing up in Supabase** after the full flow worked in the UI.

I thought the app was fine because the audit still ran locally and `/results` loaded from `localStorage`. The form even navigated to `/results?share=…` sometimes, so it felt like persistence was working. Rows in the Table Editor stayed empty.

**Hypotheses I tried:**

1. Wrong Supabase URL or anon key in the client (I was only using the service role on the server, so this was a red herring at first).
2. `POST /api/audits` never firing — checked Network tab; it did fire, often with 500.
3. Schema mismatch — table columns looked right; inserts failed before that was the main issue.
4. RLS blocking inserts — this was real. We had SELECT policy but inserts from the API path still failed until migration `002_audits_rls_insert.sql` was applied.
5. Env vars not loading — **this was the other big one.** `.env.local` on disk was literally **0 bytes** at one point, and the server had been started before keys were saved. `getSupabaseEnvDiagnostics()` and `/api/audits/health` helped confirm “configured: false”.

**What failed:** Restarting Next once without fixing the file. Assuming the new `sb_publishable_` / `sb_secret_` names matched what the code expected without reading `env.ts`. Silently continuing to `/results` when persist failed (the form used to push you there anyway).

**What worked:** Rewriting env resolution in `src/lib/supabase/env.ts` to accept legacy and new key names, fixing `.env.local` formatting, adding dev logging in `repository.ts`, surfacing persist errors on the audit form, saving `audit_input` in `localStorage` so retries had real payload, and running the RLS migration in the Supabase SQL editor. After that, `POST /api/audits` returned 201 and rows showed `audit_data`, `result_data`, `estimated_savings`, and `share_id`.

Secondary annoying bug (Day 1): `src/app/page.tsx` was **empty (0 bytes)**, which produced “default export is not a React Component.” Fast fix once I `ls -la`’d the file, but it burned an hour because the error message pointed at React, not the filesystem.

---

## 2. A decision I reversed mid-week

**Using AI to generate savings numbers.**

Early in the project I experimented with having the model suggest plan changes and dollar savings from free-text inputs. It felt fast to prototype, but the numbers drifted run to run and sometimes disagreed with the recommendation cards. For a Credex-style audit product, that kills trust fast.

I reversed course and made **`runAudit()` in `src/lib/audit-engine/` the only source of truth** for math. AI stayed in the project as:

- Cursor/ChatGPT for building UI and debugging, and
- A short **executive summary** on private results (`/api/audit-summary`) that only explains JSON we already computed.

I also reversed **Resend → Brevo** (Day 5–6). Resend worked in code but external delivery was painful without a verified domain. Brevo plus IP allowlisting got real emails through. Same user flow, different provider in `send-audit-summary.ts`.

Smaller reversal: **AI summaries on public `/share/[id]` pages.** I considered it for “polish,” then turned it off (`showAiSummary={false}`) so shared links stay deterministic and never depend on API keys or model wording.

---

## 3. What I would build in week 2

If I had another week on the same codebase:

1. **Server-side audit verification** — Re-run `runAudit(audit_data)` in `POST /api/audits` and reject if `result_data` does not match. Right now the server trusts the client JSON, which is fine for a demo but not for real users.
2. **Per-rule tests** — Vitest covers `runAudit()` on a couple of demo scenarios; I would add `rules.test.ts` for `ruleApiSpend`, Copilot business downgrade, etc., plus the `enterprise_heavy` demo scenario.
3. **API route tests** with mocked Supabase — at least happy path + 503 when env missing + honeypot behavior.
4. **OG/share QA automation** — One script or test that hits `/share/[id]/opengraph-image` with `NEXT_PUBLIC_APP_URL` set, so Slack/LinkedIn previews do not regress.
5. **Catalog price refresh** — `PRICING_DATA.md` already flags stale Gemini/Windsurf numbers; I would align `catalog.ts` with current vendor pages.
6. **“Load demo” on `/audit`** — Scenarios exist in `audit-demo-scenarios.ts` but only `/results?demo=1` is wired today.

I would **not** jump to auth, PDF export, or referrals yet. The MVP loop (audit → save → share → lead → email) is finally coherent; week 2 should harden that loop.

---

## 4. How I used AI tools

**Tools:** **Cursor** (most of the coding) and **ChatGPT** (thinking through audit rules, copy, and debugging ideas).

**Where it actually helped:**

- Scaffolding Next.js pages and shadcn components without rebuilding the homepage every day.
- Supabase/RLS troubleshooting — suggested checking policies and env loading, which matched what was broken.
- Writing the audit-summary module structure (`context.ts`, `validate.ts`, fallback).
- Vitest tests and docs (`ARCHITECTURE.md`, `TESTS.md`) as drafts I then trimmed so they did not sound like generic consulting docs.
- Brevo migration when I asked to swap Resend with minimal diff.

**What I did not trust AI with:**

- **Savings calculations and pricing logic** — all in `catalog.ts` + `rules.ts`, reviewed manually.
- **Overlap detection thresholds** — coded explicitly in `overlap.ts`.
- **What appears on public share pages** — only `result_data`; no model near lead fields or OG copy.
- **Committing env secrets** — always checked `.env.local` myself after the empty-file incident.

**One case where AI was wrong and I caught it:**

The executive summary sometimes returned **markdown bullets** or a **“Sure, here’s your summary”** preamble, and once rounded savings to a dollar total that was not in the audit JSON. The UI expects a plain paragraph. I added `isValidAiSummary()` (word count + allowed dollar amounts from `getAllowedDollarAmounts`) and `trimToWordRange`. Failed validation falls back to `buildFallbackSummary()` in `fallback.ts`, which only uses engine numbers. Without that guard, the results page would have shown confident-but-wrong prose.

---

## 5. Self-rating (1–10)

**Discipline — 7**  
I stuck to a day-by-day plan (`DEVLOG.md`) and shipped the Credex flow end to end, but time was uneven (6h on Day 4, 2h on Day 5). I also forgot to push the Day 6 devlog with the Brevo work once. Good enough for the deadline, not perfect execution.

**Code quality — 7**  
The engine and summary modules are split sensibly and we have 40 Vitest tests on core logic. Weak spots: no E2E tests, API routes untested against real Supabase, client-supplied `result_data` on persist, and `mongodb` still in `package.json` though unused. Works for MVP; not production-hardened.

**Design sense — 8**  
A lot of time went into Credex-aligned layout (light background, green accent, dark results panel) without rewriting the section order every day. Homepage → audit → results feels like one product. Still some rough edges on mobile and no formal design review.

**Problem solving — 8**  
The Supabase/env/RLS rabbit hole was genuinely hard and I got to the bottom of it with health checks and logging. Took longer than it should have because I assumed the UI “working” meant the backend was fine. OG and share URL issues (`NEXT_PUBLIC_APP_URL` for production links) were slower but solvable.

**Entrepreneurial thinking — 7**  
I prioritized the viral loop the assignment cared about: shareable report, OG preview, lead capture, email. I cut auth, PDFs, and referrals on purpose. I probably stayed on “make the demo convincing” longer than “make the pricing catalog provably accurate,” which is the next business risk if a real team used this for decisions.
