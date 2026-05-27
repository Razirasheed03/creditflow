# CreditFlow — Landing copy

Paste-ready copy aligned with the shipped product: manual `/audit` form → rule-based engine → private `/results` → public `/share/[id]` with OG previews → optional email after results. No login, no billing integrations, no PDF export.

**Production:** https://creditflow-audit.vercel.app  
**Demo:** https://youtu.be/LPFzV2b-xyA  
**Sample report:** `/results?demo=1`

---

## Site metadata

**Title:** CreditFlow — AI Spend Auditing for Startups

**Meta description:**

Enter your AI tools and monthly spend. CreditFlow runs a rule-based audit against published list prices, then gives you a shareable report link with Slack and LinkedIn previews. Free, no account required.

---

## Header

**Wordmark:** creditflow

**Nav:** How it works · Savings · Features

**See demo** → YouTube  
**Start audit** → `/audit`

---

## Homepage — Hero

**Eyebrow:** FREE AUDIT · No card required · About 5 minutes

**Headline:**

Find waste in your AI stack  
with a shareable audit finance can open

**Subhead:**

List your tools, plans, seats, and spend. CreditFlow flags wrong tiers, overlapping coding assistants, and cheaper alternatives—then gives you a public report link with a real preview when you paste it in Slack or LinkedIn. No account required.

**CTA primary:** Start Free Audit  
**CTA secondary:** See Demo

**Trust bullets:**

- No credit card required  
- Shareable report for finance  
- Built for engineering teams  

**Dark panel — eyebrow:** How it works

**Dark panel — headline:**

Stop paying for AI seats and tiers you do not need

**Dark panel — body:**

Enter what your team actually runs. The audit engine compares your stack to published pricing and overlap rules—engineering keeps the tools that matter, finance gets a link instead of another spreadsheet.

**Stat tiles (honest):**

- **9** — Tools in the catalog  
- **12** — Max line items per audit  
- **< 2 min** — Typical time to finish the form  
- **Your $** — Savings from your audit (not a site-wide average)

*Do not use “34% avg savings” or “$14k typical” unless you have real cohort data—the app does not compute those.*

---

## Homepage — Tool strip

**Line:**

Cursor, Copilot, Claude, ChatGPT, Gemini, Anthropic API, OpenAI API, Windsurf, and v0—audited in one form.

*The live homepage shows an AWS logo tile; AWS is not a supported audit tool in `SUPPORTED_TOOL_IDS`. Drop it from marketing lists.*

---

## Homepage — How it works

**Label:** How it works  
**Title:** From your inputs to a link you can send  
**Intro:** Three steps. The engine runs in your browser; results save to the cloud when configured.

**01 — Enter your stack**

Add team size and each subscription or API line: tool, plan tier, seats, monthly spend, and how the team uses it (coding, writing, research, and so on). Your draft autosaves locally.

**02 — Run the audit**

Rule-based checks for tier mismatch, seat waste, stack overlap (for example Cursor plus Copilot), and catalog-backed alternatives. Dollar estimates come from the engine and published prices—not from ChatGPT doing math.

**03 — Share or email**

On private results, copy a public `/share/[id]` link or leave a work email for a summary. Social previews show team size and savings. Your email never appears on the public report.

*Replace live copy that says “Connect your stack” or “Link invoices”—those integrations do not exist.*

---

## Homepage — Savings preview

**Label:** Audit preview  
**Title:** What a report looks like  
**Intro:** Sample cards below. Run the audit for your numbers.

**Footer line:** Illustrative data · Your results use your inputs and published pricing benchmarks

**Watch demo video** · **View sample report** → `/results?demo=1`

---

## Homepage — Features

**Label:** Platform  
**Title:** What you get in a free audit  
**Intro:** For eng-led startups—not generic expense tracking.

**AI spend breakdown**  
Per-tool spend, recommended plan, and estimated savings from what you entered.

**Plan and seat checks**  
Right-size tiers and seat counts against team size.

**Overlap and alternatives**  
Flag duplicate coding tools and cheaper options when rules match the catalog.

**Shareable public report**  
Send `/share/[id]` to finance. Copy the link or share to X, LinkedIn, or WhatsApp from the results page.

**Optional AI summary**  
Short executive narrative on private results only. Deterministic fallback if AI keys are not configured.

**Email follow-up**  
Optional work email after you have seen results—we send savings highlights and the share link via Brevo.

*Remove from the live site if still present: “squad insights,” “export to PDF,” “SOC 2-ready reporting.”*

---

## Homepage — Testimonials

The shipped quotes (Maya Chen, James Okonkwo, Priya Nair) are **design placeholders**, not real customers.

**Option A — remove section before Credex review.**

**Option B — label honestly:**

**Label:** Example feedback  
**Title:** What eng and finance teams ask for  
**Intro:** Illustrative quotes—not from paid customers.

---

## Homepage — Final CTA

**Label:** Get started  
**Title:** Ready to audit your AI spend?  
**Body:** Free audit. No login. Recommendations, a savings estimate, and a link you can forward to finance.  
**CTAs:** Start Free Audit · See Demo

---

## Footer

**Blurb:** AI spend audits for startups and engineering teams—free, fast, shareable.

**Copyright:** © [year] CreditFlow. All rights reserved.  
**Tagline:** Built for teams who ship fast and spend smarter.

**Legal links:** Privacy and Terms are `#` placeholders today—add real URLs before scaling email capture.

---

## Audit page (`/audit`)

**Label:** Free audit  
**Title:** Audit your AI stack  
**Intro:** Add tools, plans, seats, and monthly spend. We check overprovisioned tiers, overlap, and alternatives using published pricing—no account required.

**Team context**  
Used to right-size seat counts and team vs. individual plans.  
**Field label:** Total team size

**AI tools**  
Add every subscription or API line item you want analyzed.  
**Add tool** · **Run audit** (submit loading: Analyzing spend…)

**Helper when disabled:** Complete all required fields with valid plans and spend above $0 to run the audit.

---

## Results page (`/results`)

**Label:** Results  
**Title:** Your audit results  
**Intro:** Recommendations are based on your inputs and published pricing benchmarks—not manufactured savings.

**Share audit**  
Send this public report to your team. Rich previews appear on X, LinkedIn, Slack, Discord, and WhatsApp—contact details are never included.

**Share text (app-generated when savings > 0):**  
Saved $[annual]/year on AI tooling with CreditFlow [url]

**Get your complete optimization report**  
We will email your savings summary, top recommendations, and shareable report link. No spam—unsubscribe anytime.

**Fields:** Work email · Company (optional) · Role (optional)  
**Button:** Email my full report  
**Success:** You're on the list. We've emailed your audit summary with savings highlights and a link to your shareable report.

---

## Public share page (`/share/[id]`)

**Label:** Shared audit report

**Title (savings):** AI spend audit — savings opportunities  
**Title (already optimized):** AI spend audit — already optimized

**Intro:** Public view of an engine-verified audit. Contact details and private notes are never shown on shared reports.

**CTA:** Run your own audit

**Social description (auto-generated patterns):**

- Savings: Reduce unnecessary AI SaaS spending. This audit found $[annual]/year in potential savings for a [N]-person team ($[monthly]/mo across [T] tools).  
- Optimized: AI spend audit for a [N]-person team across [T] tools ($[monthly]/mo). Stack is already well optimized—view plan breakdowns and recommendations on CreditFlow.

**Not shown on public share:** AI executive summary.

---

## Credex-safe claims

Use in landing and launch posts:

- Free audit, no login  
- Nine tools in the pricing catalog  
- Rule-based savings math; optional AI narrative on private `/results` only  
- Persisted audit with shareable `/share/[id]`  
- No lead data on public pages or OG metadata  
- Dynamic Open Graph and Twitter large-image cards  
- Email capture after results; Brevo transactional send  
- Honeypot on audit and lead APIs  

Do **not** claim: PDF export, user accounts, referrals, embeds, automatic billing connect, squad-level analytics, guaranteed savings percentages.

---

## Live site copy to fix

- “Connect your AI stack” / link invoices → manual form only  
- Hero “34%” and “$14k” → user-specific savings or remove  
- “Export reports” → shareable web link + email  
- “Team usage by squad” → not built  
- “SOC 2-ready” → not built  
- Fictional testimonials → remove or label  
- AWS in logo strip → not in audit catalog  

---

## Taglines (pick one)

- Free AI stack audit with a shareable savings report.  
- Rule-based ChatGPT, Claude, and Cursor spend audit—share link included.  
- Send finance a link with a real preview card, not another spreadsheet.  
- Enter your tools manually; get deterministic savings math and a public share URL with OG.

---

## Assumptions made

1. Credex expects landing/marketing copy documentation alongside share, OG, and lead flows; no assignment PDF was in the repo—scope taken from `ARCHITECTURE.md` and shipped routes.  
2. **Recommended copy** in this file is the honest target; `src/components/homepage/*` may still show aspirational lines listed under “Live site copy to fix.”  
3. Audience matches `GTM.md`: head of engineering or technical co-founder, early-stage startup.  
4. Copy is English, USD, US-style number formatting.  
5. Testimonials on the live site are placeholders unless you add signed approvals.

---

## Missing information (manual input)

| Item | Why |
|------|-----|
| Real customer quotes | Replace placeholder testimonials |
| Privacy policy and Terms URLs | Footer links are `#` today |
| Keep or drop hero percentage stats | Brand vs. honesty tradeoff |
| Final brand casing (creditflow vs CreditFlow) | Consistency across site and email |
| Credex PDF marketing rubric | Confirm required sections if graded |
| Brevo sender identity for email footers | CAN-SPAM / GDPR wording on lead form |
| Site-wide financial disclaimer | Email template says confirm with invoices—mirror on web? |
| Product Hunt / launch one-liner (≤60 chars) | Optional |
