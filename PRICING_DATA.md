# CreditFlow — Pricing Data Reference

This document describes **only** the pricing data and logic that exist in the CreditFlow repository today. The audit engine does not call vendor APIs or scrape live price pages; it reads static values from `src/data/pricing/catalog.ts` and applies deterministic rules in `src/lib/audit-engine/`.

**Source of truth (code):**

| File | Role |
|------|------|
| `src/data/pricing/catalog.ts` | All USD list prices, tiers, aliases |
| `src/data/pricing/helpers.ts` | Cost estimation, formatting, tier helpers |
| `src/data/pricing/plan-options.ts` | Audit form plan dropdown options |
| `src/data/pricing/overlap.ts` | Stack overlap groups and thresholds |
| `src/lib/audit-engine/context.ts` | Tier scoring (`pickBestTier`) |
| `src/lib/audit-engine/rules.ts` | Recommendation rules using catalog benchmarks |
| `src/lib/audit-engine/finalize.ts` | Savings floors ($25 / 5%) |

User-entered **monthly spend** on the audit form is the primary “actual spend” input. Catalog prices are used for **benchmarks**, **recommended spend**, and **“above list pricing”** messaging—not as a substitute for invoices.

---

## How catalog prices become dollars

### Billing models (`PricingTier.billingModel`)

| Model | Catalog fields | `estimateTierMonthlyCost(tier, seats)` |
|-------|----------------|------------------------------------------|
| `flat` | `monthlyBase` | `monthlyBase` (seats ignored) |
| `per_seat` | `pricePerSeat`, optional `minSeats` | `pricePerSeat × max(seats, minSeats ?? 1)` |
| `usage` | `typicalMonthlyRange: [low, high]` | **Midpoint:** `round((low + high) / 2)` |

Implementation: `src/data/pricing/helpers.ts` → `estimateTierMonthlyCost`.

### Per-seat effective seats in the engine

- Form `seats` clamped to `[1, 10_000]` in `sanitize.ts`.
- **`rightSizedSeats`** = `min(seats, max(teamSize, 1))` in `buildEvalContext`.
- Recommendations use `rightSizedSeats` for catalog spend unless a rule overrides (e.g. API heuristics use reported `monthlySpend`).

### Savings finalization (engine, not catalog)

From `finalize.ts`:

- Claim savings only if **monthly savings ≥ $25** OR **≥ 5%** of current spend; otherwise `alreadyOptimized: true` and savings zeroed.
- `recommendedSpend` capped at `currentSpend` (never recommends spending more than reported).

### Plan validation

- Audit form plan values must match a tier `id` in `TOOL_CATALOG[toolId].tiers` (`isValidPlanTier`).
- Legacy free-text plans map through `planAliases` → `normalizePlanName` (`plan-options.ts`).

---

## Official vendor URLs and catalog alignment

**Verification date:** 2026-05-27 (spot-check via public pricing pages; not a line-by-line audit of every field).

**Status legend:**

| Status | Meaning |
|--------|---------|
| **Match** | Catalog `pricePerSeat` / `monthlyBase` matches a published list price on the official page (same order of magnitude, same tier intent). |
| **Approximate** | Catalog simplifies or lags vendor naming (e.g. one “Max” tier vs vendor’s 5x/20x split). |
| **Benchmark** | Catalog uses a **fixed midpoint** or **flat estimate**; vendor bills per token / credits / custom quote. |
| **Not listed** | Catalog tier name or price does not appear on the vendor’s public list page. |

---

## Tool catalog (as implemented)

### Cursor (`cursor`)

**Official pricing:** https://cursor.com/pricing  
**Docs (Teams):** https://cursor.com/docs/account/teams/pricing

| Tier ID (form) | Display name | Catalog $/mo | Billing | Status | Notes |
|----------------|--------------|--------------|---------|--------|-------|
| `hobby` | Hobby | $0 | flat | **Match** | Free tier on official site. |
| `pro` | Pro | $20/seat | per_seat | **Match** | Official Pro $20/mo (2026-05-27). |
| `business` | Business | $40/seat | per_seat | **Approximate** | Official **Teams** is $40/user/mo; catalog label is “Business”, not “Teams”. |
| `enterprise` | Enterprise | $60/seat | per_seat | **Not listed** | Official Enterprise is **custom**; $60 is an internal benchmark only. |

**Catalog-only:** `minSeats` business 2, enterprise 10; `bestForTeamSize` bands for `pickBestTier`.

**Alternative hint (catalog):** GitHub Copilot Individual ~$10/seat — see Copilot row.

**Engine rules touching Cursor:** `ruleIdeBusinessDowngrade` (business/teams + team ≤ 5 → pro), overlap group `ide_coding`.

---

### GitHub Copilot (`github_copilot`)

**Official pricing:** https://github.com/features/copilot/plans  
**Docs:** https://docs.github.com/en/copilot/get-started/plans

| Tier ID | Display name | Catalog $/mo | Billing | Status | Notes |
|---------|--------------|--------------|---------|--------|-------|
| `individual` | Individual | $10/seat | per_seat | **Match** | Copilot Pro $10/user/mo (2026-05-27). |
| `business` | Business | $19/seat | per_seat | **Match** | Copilot Business $19/user/mo. |
| `enterprise` | Enterprise | $39/seat | per_seat | **Match** | Copilot Enterprise $39/user/mo. |

**Engine rules:** `ruleCopilotBusiness` (business + team ≤ 4 → individual), overlap `ide_coding`.

---

### Claude (`claude`)

**Subscriptions:** https://claude.com/pricing  
**Max plan:** https://claude.com/pricing/max  
**Help (plans):** https://support.claude.com/en/articles/11049762-choose-a-claude-plan  
**API (token):** https://platform.claude.com/docs/en/about-claude/pricing

| Tier ID | Display name | Catalog $/mo | Billing | Status | Notes |
|---------|--------------|--------------|---------|--------|-------|
| `free` | Free | $0 | flat | **Match** | |
| `pro` | Pro | $20/seat | per_seat | **Match** | $20/mo web (2026-05-27). |
| `team` | Team | $30/seat | per_seat | **Approximate** | Team pricing is org/seat; verify seat minimums on Anthropic Team docs. |
| `max` | Max | $100/seat | per_seat | **Approximate** | Vendor has **Max 5x $100** and **Max 20x $200**; catalog uses single $100 tier. |
| `enterprise` | Enterprise | $50/seat | per_seat | **Not listed** | Enterprise is sales-led; $50 is benchmark only. |
| `api_direct` | API Direct | midpoint of $100–$8,000 → **$4,050** | usage | **Benchmark** | Real cost is per-token; see API docs. |

**Engine rules:** `ruleChatAssistantTeamForCoding`, `ruleClaudeMaxOverkill`, overlap `chat_assistants`.

---

### ChatGPT (`chatgpt`)

**Official pricing:** https://openai.com/chatgpt/pricing/

| Tier ID | Display name | Catalog $/mo | Billing | Status | Notes |
|---------|--------------|--------------|---------|--------|-------|
| `plus` | Plus | $20/seat | per_seat | **Approximate** | OpenAI consumer plans renamed (Go/Plus/Pro/Business); Plus tier exists in product line. |
| `team` | Team | $30/seat | per_seat | **Approximate** | Aligns with historical Team-style per-seat positioning; confirm current “Business” ChatGPT & Codex seat pricing on official page. |
| `enterprise` | Enterprise | $60/seat | per_seat | **Not listed** | Enterprise is custom on official page. |
| `api_direct` | API Direct | midpoint $150–$10,000 → **$5,075** | usage | **Benchmark** | Distinct from ChatGPT subscription; API is https://openai.com/api/pricing/ (per token). |

**Plan aliases:** `free` not in tiers array but in aliases for chatgpt; no `free` tier row in catalog.

**Engine rules:** `ruleChatAssistantTeamForCoding`, overlap `chat_assistants`.

---

### Anthropic API (`anthropic_api`)

**Official pricing:** https://platform.claude.com/docs/en/about-claude/pricing  
**Overview:** https://claude.com/platform/api/

| Tier ID | Display name | Catalog range $/mo | Midpoint used | Status | Notes |
|---------|--------------|----------------------|---------------|--------|-------|
| `pay_as_you_go` | Pay-as-you-go | $50 – $800 | **$425** | **Benchmark** | Billed per MTok, not flat monthly. |
| `tier_2` | Usage Tier 2 | $500 – $2,500 | **$1,500** | **Benchmark** | Abstract “usage tier”; not a named public SKU. |
| `scale` | Scale / Committed | $2,000 – $15,000 | **$8,500** | **Benchmark** | Committed spend / enterprise contracts. |

**Plan aliases:** `payg` → `pay_as_you_go`, `tier1`–`tier4`, `scale`.

**Engine rules:** `ruleApiSpend` (thresholds $250, $1,500, scale downgrade heuristics), `ruleDualApiHint`, overlap `llm_apis`.

---

### OpenAI API (`openai_api`)

**Official pricing:** https://openai.com/api/pricing/  
**Platform billing:** https://platform.openai.com/

| Tier ID | Display name | Catalog range $/mo | Midpoint used | Status | Notes |
|---------|--------------|----------------------|---------------|--------|-------|
| `pay_as_you_go` | Pay-as-you-go | $50 – $1,000 | **$525** | **Benchmark** | Per-token. |
| `tier_2` | Usage Tier 2 | $400 – $3,000 | **$1,700** | **Benchmark** | |
| `scale` | Scale / Committed | $2,500 – $20,000 | **$11,250** | **Benchmark** | |

**Engine rules:** same API pipeline as Anthropic API.

---

### Gemini (`gemini`)

**Subscriptions:** https://one.google.com/about/google-ai-plans/ (regional)  
**I/O 2026 update:** https://blog.google/products-and-platforms/products/google-one/google-ai-subscriptions/

| Tier ID | Display name | Catalog $/mo | Billing | Status | Notes |
|---------|--------------|--------------|---------|--------|-------|
| `pro` | Pro | $20/seat | per_seat | **Approximate** | Google AI Pro ~$20/mo (US positioning, 2026). |
| `ultra` | Ultra | $35/seat | per_seat | **Not listed** | Google launched **$100** and **$200** Ultra tiers (May 2026); catalog $35 is outdated vs public list. |
| `api` | API | midpoint $50 – $5,000 → **$2,525** | usage | **Benchmark** | Gemini API: https://ai.google.dev/gemini-api/docs/pricing |

**Plan aliases:** `advanced` → `pro`, `business` → `pro`, `enterprise` → `ultra`, `free` aliased but no free tier row.

**Engine rules:** overlap `chat_assistants` only (no Gemini-specific downgrade rule).

---

### Windsurf (`windsurf`)

**Official pricing:** https://windsurf.com/pricing  
**Docs:** https://docs.windsurf.com/windsurf/accounts/usage

| Tier ID | Display name | Catalog $/mo | Billing | Status | Notes |
|---------|--------------|--------------|---------|--------|-------|
| `pro` | Pro | $15/seat | per_seat | **Not listed** | Official Pro **$20/mo** (2026-05-27). |
| `teams` | Teams | $30/seat | per_seat | **Not listed** | Official Teams **$40/user/mo**. |
| `enterprise` | Enterprise | $45/seat | per_seat | **Not listed** | Official Enterprise is **custom**. |

**Engine rules:** `ruleIdeBusinessDowngrade`, overlap `ide_coding`.

---

### v0 (`v0`)

**Official pricing:** https://v0.app/pricing  
**Docs:** https://v0.app/docs/pricing

| Tier ID | Display name | Catalog $/mo | Billing | Status | Notes |
|---------|--------------|--------------|---------|--------|-------|
| `premium` | Premium | $20/seat | per_seat | **Approximate** | Premium **sunset** for new users; legacy $20/mo with credits. |
| `team` | Team | $30/seat | per_seat | **Match** | Official Team **$30/user/mo** (2026-05-27). |
| `enterprise` | Enterprise | $50/seat | per_seat | **Not listed** | Official **Business $100/user/mo**, Enterprise custom; no $50 public tier. |

**Engine rules:** `ruleIdeBusinessDowngrade` (team + small team → premium), overlap `ide_coding`.

---

## Stack overlap detection (not vendor pricing)

From `src/data/pricing/overlap.ts` — uses **user-reported** `monthlySpend` only.

| Group ID | Tools | Min combined spend | Purpose |
|----------|-------|-------------------|---------|
| `ide_coding` | cursor, github_copilot, windsurf, v0 | $80/mo | Flag duplicate IDE copilots |
| `chat_assistants` | chatgpt, claude, gemini | $100/mo | Flag parallel chat workspaces |
| `llm_apis` | openai_api, anthropic_api | $500/mo | Flag dual production API stacks |

Overlap messages are appended to per-tool reasoning in `audit-engine/index.ts`; they do not change `pricePerSeat` values.

---

## Audit engine thresholds (pricing-adjacent)

These constants are **not** in `catalog.ts`; they drive recommendations against user spend and catalog benchmarks.

| Rule | Trigger (summary) | Effect on recommended spend |
|------|-------------------|----------------------------|
| `ruleEnterpriseOverprovision` | Enterprise/scale tier, team &lt; 25 | `pickBestTier` excluding enterprise/scale |
| `ruleSmallTeamOnTeamPlan` | Team tier, team ≤ 6, seats ≤ 4 | Downgrade to individual tier |
| `ruleSeatOverprovision` | seats &gt; teamSize + 1, non-API | Re-score tier with `rightSizedSeats` |
| `ruleSpendAboveCatalog` | Non-API, spend &gt; 125% of catalog benchmark | Downgrade narrative + invoice check action |
| `ruleIdeBusinessDowngrade` | cursor/windsurf/v0 on business/teams, team ≤ 5 | Force pro/premium tier catalog cost |
| `ruleCopilotBusiness` | copilot business, team ≤ 4 | Individual tier |
| `ruleChatAssistantTeamForCoding` | chatgpt/claude team + coding use, team ≤ 5 | pro/plus tier |
| `ruleClaudeMaxOverkill` | claude max, small team | pro tier |
| `ruleApiSpend` | API category | Heuristics at $0, &lt;$250, scale+small team, &gt;$1500, seat utilization 0.92× |
| `ruleDualApiHint` | Both APIs, combined ≥ $800 | Narrative only |
| `ruleCreditOpportunity` | Enterprise tier, team &lt; 20 | Type `credit`, no new catalog price |
| `ruleAlreadyEfficient` | On recommended tier, spend ≤ 115% benchmark | `optimized` |

API tier downgrades sometimes set `recommendedSpend` to **fractions of reported spend** (0.78, 0.82, 0.92) rather than `estimateTierMonthlyCost` alone.

---

## Tier selection scoring (`pickBestTier`)

Used when rules need a “right-sized” catalog tier. Scoring (`context.ts`):

- +3 if `teamSize` within `bestForTeamSize`
- +2 if `useCase` in `bestForUseCases`
- +2 per-seat if seats within `minSeats` and ≤ `teamSize + 2`
- −3 if seats &gt; `teamSize + 3`
- −4 enterprise tier if `teamSize` &lt; 15
- −2 team tier if `teamSize` ≤ 3

Highest score wins; ties favor first after sort.

---

## Form surface vs catalog

`getPlanOptionsForTool(toolId)` exposes exactly `TOOL_CATALOG[toolId].tiers` as dropdown values (`plan-options.ts`). Supported tool IDs: `SUPPORTED_TOOL_IDS` in `src/types/audit.ts` (nine tools).

Default plan when adding a tool: first match among `pro` → `plus` → `individual` → first `individual` class tier.

---

## Demo scenarios (pricing inputs only)

`src/lib/audit-demo-scenarios.ts` defines three form presets (`overspending_startup`, `optimized_solo_founder`, `enterprise_heavy_stack`). Only `overspending_startup` is wired to `/results?demo=1` via `buildDemoAuditForm()`. Demo runs `runAudit()` with the same catalog—no separate price table.

---

## Updating prices (maintainer workflow)

1. Edit `src/data/pricing/catalog.ts` (and aliases if tier IDs change).
2. Confirm `getPlanOptionsForTool` still lists valid tiers.
3. Re-run representative audits; engine rules key off tier **ids** (`business`, `team`, `max`, etc.).
4. Update this document’s **Verification date** and **Status** column for changed rows.
5. Do not expect automatic sync with vendor sites—there is no CI check against live pricing.

---

## Assumptions made

1. All catalog amounts are **USD**, **monthly**, unless noted as usage midpoints.
2. **Per-seat** catalog prices are interpreted as **per billed seat per month**, not annual (annual discounts on vendor sites are ignored).
3. **Usage** tiers represent **typical monthly burn** for audit benchmarking, not contractual commit minimums.
4. User **monthly spend** on the form is honest and inclusive of tax/add-ons unless otherwise noted in recommendations.
5. Official URLs above were reachable and representative on **2026-05-27**; vendors may change plans without updating this repo.
6. “Match” does not imply legal or billing equivalence—only that the catalog number is in the same ballpark as a public list price for a similar tier.

---

## Missing information (requires manual input)

| Item | Why it matters |
|------|----------------|
| **Authoritative verification log** | No automated scrape or signed-off spreadsheet in repo; align catalog to a dated internal pricing review. |
| **Cursor Enterprise $60** | No public list price—replace with “custom” behavior or remove fixed seat rate. |
| **Gemini Ultra $35** | Conflicts with Google’s $100/$200 Ultra tiers (May 2026)—catalog likely needs update. |
| **Windsurf Pro/Teams** | Catalog $15/$30 vs official $20/$40—update or document intentional discount assumption. |
| **v0 Enterprise $50** | Official team SKUs are Team $30, Business $100, Enterprise custom. |
| **ChatGPT `free` tier** | Aliased in catalog but not in `tiers` array—form cannot select Free for ChatGPT. |
| **Claude Team / ChatGPT Team list prices** | Need direct Anthropic/OpenAI team pricing URLs and seat minimums for “Match” status. |
| **Anthropic/OpenAI “tier_2” / “scale”** | Abstract ids—map to real SKUs (committed use, prepaid blocks) if audits must cite contracts. |
| **Tax, annual prepay, regional pricing** | Engine and catalog are US-monthly simplified. |
| **Credit-based products (Cursor Pro+, Windsurf Max, v0 credits)** | Catalog uses flat per-seat; real products are quota/credit-based—benchmarks understate variability. |

---

## Related files

- `ARCHITECTURE.md` — where pricing fits in audit and persistence flow
- `src/data/pricing/catalog.ts` — edit prices here
- `src/lib/audit-engine/rules.ts` — business logic consuming benchmarks
