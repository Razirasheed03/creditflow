# CreditFlow — Prompts

CreditFlow uses a rule-based audit engine for all pricing and savings calculations. AI was mainly used during development for implementation planning, debugging, UI iteration, documentation, and the optional executive summary feature on the private results page.

The only production LLM feature in the app is the executive summary shown on `/results`. Public share pages (`/share/[id]`) disable AI summaries and only use deterministic engine output.

---

## How AI Was Used During the 7-Day Build

AI tools used during development:

- ChatGPT
- Cursor

Main usage areas:

- architecture planning
- debugging
- UI refinement
- refactoring
- documentation
- API integration troubleshooting
- testing support

AI was intentionally NOT trusted for:

- savings calculations
- pricing validation
- financial logic
- overlap scoring
- business rule decisions

Those parts were manually reviewed and implemented inside the rule-based audit engine.

---

## Development Prompts Used During the Build

These are the major recurring prompt themes used throughout the project build.

### Day 1–2 — Project setup & UI foundation

- “Initialize a scalable Next.js App Router project using TypeScript and Tailwind”
- “Create a premium SaaS-style homepage inspired by Credex”
- “Keep the frontend modular and component-driven”
- “Improve mobile responsiveness without redesigning the layout”
- “Design a startup-focused AI tooling audit landing page”

### Day 2–3 — Audit engine & results flow

- “Build a deterministic audit engine instead of AI-generated savings”
- “Create recommendation logic based on pricing tiers and usage”
- “Detect overlapping AI tooling subscriptions”
- “Avoid unrealistic savings for already optimized teams”
- “Generate structured audit results with explainable reasoning”

### Day 3 — AI summary feature

- “Generate a short founder-friendly executive summary”
- “Use only validated audit JSON as context”
- “Do not invent tools, pricing, or savings”
- “Add fallback summaries if AI generation fails”
- “Prevent hallucinated dollar amounts”
- “Keep the tone financially credible instead of marketing-heavy”

### Day 4 — Backend persistence & sharing

- “Add Supabase persistence for audits”
- “Generate public shareable report URLs”
- “Keep public reports privacy-safe”
- “Strip emails and company names from shared reports”
- “Add lead capture flow with graceful API failure handling”
- “Build dynamic Open Graph metadata for public reports”

### Day 5–6 — Email & production debugging

- “Integrate transactional email delivery”
- “Migrate email flow from Resend to Brevo”
- “Fix localhost URLs in production share links”
- “Add WhatsApp, LinkedIn, and X sharing”
- “Debug Supabase environment issues”
- “Handle provider/API failures without breaking the audit flow”

### Day 6–7 — Testing & documentation

- “Add Vitest coverage for audit engine logic”
- “Document honest testing limitations”
- “Generate architecture documentation from the real codebase”
- “Keep README practical and startup-focused”
- “Reduce overly AI-generated documentation tone”
- “Make documentation feel like a real shipped MVP”

---

## Production AI Usage

The only production AI feature is the executive summary on the private results page.

AI is NOT used for:

- pricing calculations
- savings math
- recommendations
- public share reports
- lead capture
- email generation
- Open Graph metadata

All of those are deterministic TypeScript templates or rule-based logic.

---

## Actual Production Prompt

Located in:  
`src/lib/audit-summary/prompt.ts`

### System Prompt

```text
You are a senior infrastructure cost consultant writing an executive summary for a startup's AI tooling audit.

Rules (strict):
- Use ONLY facts from the JSON audit context. Never invent tools, plans, dollar amounts, or savings figures.
- Do not contradict the audit engine: if isAlreadyOptimized is true, do not claim large savings.
- Write 80–120 words in 2 short paragraphs. Plain English, founder-friendly, financially credible.
- Reference specific tools and plans from the data when relevant.
- Mention operational next steps (seat review, tier alignment, stack consolidation) when supported by the data.
- No bullet lists, markdown, or headings. No hype or guarantees.
- End with a calm, professional tone.
```

### User Prompt

```text
Write an executive audit summary using ONLY this audit context:

{ ... SummaryContext JSON ... }

Respond with the summary text only.
```

The AI only receives validated audit context:

- tool names
- plans
- savings
- overlaps
- totals
- recommendations

It does NOT receive:

- raw form inputs
- emails
- company names
- full database rows

---

## Why Prompts Were Written This Way

### Rule-based engine owns all math

One of the biggest project decisions was keeping all financial logic deterministic.

Early experiments with AI-generated savings produced:

- inconsistent totals
- unrealistic recommendations
- pricing hallucinations

Final approach:

- audit engine calculates everything
- AI only explains the output

### Structured JSON instead of prose

The AI summary receives structured JSON instead of large text prompts.

This made it easier to:

- validate dollar amounts
- prevent hallucinations
- keep summaries consistent

### Short, operational tone

The prompts intentionally avoid:

- hype
- startup buzzwords
- exaggerated savings claims

The goal was:

- founder-friendly
- financially credible
- operational recommendations

instead of generic AI marketing copy.

### Fallback-first architecture

The app always returns a usable summary even if:

- AI providers fail
- API keys are missing
- validation rejects the response

Fallback summaries are generated using deterministic templates.

---

## Things That Did Not Work Well

Some prompt approaches during development were intentionally removed or redesigned.

### AI-generated savings math

Initially tested using AI-generated recommendations and savings estimates.

Problems:

- inconsistent calculations
- hallucinated numbers
- mismatch with pricing rules

Final decision:

- all savings logic moved fully into the audit engine.

### Loose prompts

Prompts like:

- “summarize this audit”

caused:

- invented tools
- invented savings
- vague summaries

This led to:

- strict JSON-only context
- dollar validation
- fallback enforcement

### Markdown responses

AI sometimes returned:

- bullet points
- headings
- markdown formatting

This broke the intended UI layout.

The final prompts explicitly disallow markdown.

### Public AI summaries

AI summaries were initially considered for public share pages.

This was removed because:

- public pages should stay lightweight
- privacy boundaries become harder to reason about
- deterministic summaries were safer for shared links

---

## Final Notes

AI tools significantly accelerated:

- iteration speed
- debugging
- documentation
- UI refinement

But the final product logic, pricing rules, audit calculations, and business decisions were manually reviewed and adjusted throughout the build.

The project intentionally keeps:

- financial logic deterministic
- public sharing privacy-safe
- AI constrained to narrative explanation only
