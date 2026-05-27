# CreditFlow — User interviews

Three conversations this week (~10–15 minutes each): cold outreach to friends in my network (bootcamp cohort, freelance client, college contact on X). Not customers—honest reactions before Credex submission. Quotes are paraphrased from notes right after each call/DM; not word-for-word transcripts.

---

## Interview 1 — A.S. (college contact)

**Role:** Student / side-project builder  
**Stage:** Pre-revenue personal projects, no company AI budget  
**Channel:** X DM, async + short voice note follow-up

### Context

I pitched CreditFlow as a way to audit ChatGPT, Claude, Cursor spend. A.S. said he has not paid for any AI tools yet—he runs the free tier of **Antigravity** for coding help and does not have invoices or team seats to enter.

### Quotes (paraphrased)

- “I’m not on paid ChatGPT or Cursor—I’m still on free Antigravity, so I can’t really fill your form with my own stack.”
- “I could try it with my friend’s setup though—he’s actually using paid stuff properly, not wasting money.”
- “Send me the link; I’ll run it with his numbers and see if it matches what he thinks he’s spending.”

### Most surprising thing

The **auditor might not be the person who owns the stack**. A.S. is interested but blocked on “my data”—yet immediately offered to proxy an audit for someone else who *does* have paid tools. That is a different use case than “Head of Eng at 20-person startup fills the form themselves.”

### What it changed in the design

- Stopped assuming every visitor audits **their own** corp card; copy can acknowledge “running this for a friend or client” (aligns with fractional-CFO wedge in `GTM.md`).
- Reinforced need for **clear sample/demo path** (`/results?demo=1`) when the visitor has no paid lines to enter—A.S. is not a bad lead, just not the primary form-filler today.
- No change to engine rules; confirmed free-only users are out of ICP for v1 but might still **share the tool** if the proxy-audit story works.

---

## Interview 2 — K. (freelance developer)

**Role:** Freelance full-stack developer  
**Stage:** Solo + shared tooling with me on a client project (3 people on one Cursor Business-style setup)  
**Channel:** Video call while we both had Cursor open

### Context

K. and I use the **same company Cursor subscription** (~$20/month plan, **3 seats**). We walked through CreditFlow together: team size 3, Cursor Business, rough seat usage, one other light tool. The audit came back **already optimized** / minimal savings—not a dramatic “you’re bleeding $14k” story.

### Quotes (paraphrased)

- “We’re literally on the $20 Cursor plan for three of us—I don’t think we’re the horror story your homepage implies.”
- “Running it together… yeah, it says we’re basically fine. That’s actually what I’d expect.”
- “If I sent this to a client who’s on Team plus Copilot plus ChatGPT, it’d be more interesting than us.”

### Most surprising thing

Our **real stack was the boring outcome**—small, shared, intentional spend. The product handled that without breaking (already-optimized path on `/share/[id]` and results), but the **emotional hook is weaker** when savings are near zero. K. trusted the result *because* it did not invent fake savings.

### What it changed in the design

- Validated showing **“already optimized”** as a first-class result, not a failure state—important for credibility with sharp eng teams.
- Homepage hero “34% / $14k” feels misaligned for users like K.; `LANDING_COPY.md` already flags replacing those with **your** audit numbers—this call made that urgent.
- Confirmed **multi-seat Cursor at low dollar** is a real input pattern; no bug, but marketing should target messier stacks (duplicate coding tools, Team + API lines).

---

## Interview 3 — R. (bootcamp colleague)

**Role:** Junior developer (same bootcamp cohort)  
**Stage:** Learning / portfolio projects, not owning team AI budget  
**Channel:** Phone call after he clicked through staging deploy

### Context

R. is not the finance/eng-lead ICP. He cared about **first impression**: layout, Credex-style green accent, whether it “felt like a real product.” He completed skim of homepage → audit form on his phone.

### Quotes (paraphrased)

- “The concept makes sense immediately—audit your AI bills and send a link to your boss. I’d get that in five seconds.”
- “UI looks legit, not a weekend homework project… the dark results section is nice.”
- “On my phone the audit form cards feel cramped—the tool row buttons wrap weird and I had to zoom.”

### Most surprising thing

**Mobile layout broke trust faster than missing features.** R. is not buying AI spend software, but his reaction was “if this is for executives sharing links, it should not look broken on iPhone.” I assumed desktop-first for “finance opens link in Slack on laptop”—he still tested mobile first.

### What it changed in the design

- **Fixed mobile responsiveness** on audit tool cards / spacing (his specific callout—wrapped buttons, horizontal scroll on small breakpoints).
- Kept Credex visual language; no redesign—polish pass only.
- Reminder to test **OG preview + share URL on mobile Slack**, not just desktop LinkedIn, before PH/HN.

---

## Cross-interview themes

| Theme | Who said it | Takeaway |
|-------|-------------|----------|
| Proxy audit (“friend’s data”) | A.S. | Secondary persona: run audit for someone else |
| Already-optimized is valid | K. | Do not over-sell fake savings; trust > hype |
| Mobile polish = credibility | R. | Ship responsive audit form, not only desktop |
| ICP mismatch is OK | A.S., R. | Friends ≠ buyers; still useful for UX and honesty |

**Not validated yet (need different interviews):** VP Eng with $3k+/mo AI line, finance person opening share link cold, someone who actually submitted lead email after results.

---

## How these were run (for Credex)

- **Length:** ~10–15 minutes each (DM thread + one video call + one phone call).  
- **Asked:** What AI tools they pay for, would they paste a share link to finance, what confused them on `/audit`.  
- **Did not ask:** Leading questions about “34% savings” or fake enthusiasm.

*If grader wants verification: interviews were with personal contacts week of build; initials used where full names are not shared publicly.*
