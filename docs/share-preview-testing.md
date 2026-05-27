# Share link preview testing

Public reports live at `/share/[id]`. Metadata and OG images are generated from **result data only** (savings, spend, team size, tool count) — never email, company name, or raw form fields.

## Prerequisites

1. Set `NEXT_PUBLIC_APP_URL` to your public origin (production: `https://creditflow-audit.vercel.app`). Crawlers need absolute URLs.
2. Deploy or expose the app with HTTPS (most validators require a reachable URL).
3. Create a share link by completing an audit and opening `/share/{shareId}`.

## What to verify

| Field | Source |
| --- | --- |
| Title | e.g. `Saved $4,200/year on AI tooling \| CreditFlow` |
| Description | Team size, monthly spend, tool count, savings (no PII) |
| OG image | `/share/{id}/opengraph-image` (dynamic) with fallback `/share/opengraph-image` |
| Twitter card | `summary_large_image` |

## Tools

### Twitter / X — Card Validator

1. Open [Twitter Card Validator](https://cards-dev.twitter.com/validator) (or X’s equivalent in the developer portal).
2. Paste: `https://<your-domain>/share/<shareId>`
3. Confirm **summary_large_image**, title, description, and image render.
4. Re-validate after metadata changes (cache can lag).

### LinkedIn Post Inspector

1. Open [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).
2. Enter the same share URL and click **Inspect**.
3. Confirm title, description, and image match the audit (not the homepage).

### Discord

1. Paste the share URL in a channel or DM (preview embed should appear).
2. Check title, description, and thumbnail. Discord caches aggressively; append `?v=2` when re-testing.

### Slack

1. Paste the URL in a channel (unfurl preview).
2. Confirm large image preview and copy. Use “Remove attachment” and re-paste to refresh cache.

### WhatsApp

1. Send the link to yourself or a test chat.
2. Preview should show title + image. WhatsApp caches heavily; use a fresh share id or query param for re-tests.

## Local development

- `localhost` URLs are **not** usable by external validators.
- Use a tunnel (e.g. ngrok, Cloudflare Tunnel) pointing at `npm run dev`, set `NEXT_PUBLIC_APP_URL` to the tunnel URL, restart the dev server, then validate.

## Quick curl checks (HTML metadata)

Replace `<shareId>` with a real id from your Supabase `audits` table.

```bash
curl -sS "https://creditflow-audit.vercel.app/share/<shareId>" | grep -E 'og:|twitter:'
```

```bash
curl -sS -o /dev/null -w "%{http_code} %{content_type}\n" \
  "https://creditflow-audit.vercel.app/share/<shareId>/opengraph-image"
```

Expect `200` and `image/png` for the OG image route.

Verify canonical and absolute OG URLs:

```bash
curl -sS "https://creditflow-audit.vercel.app/share/<shareId>" | grep -E 'canonical|og:image|twitter:image'
```

Copied share links in production use `NEXT_PUBLIC_APP_URL` (not `window.location.origin` on preview domains).

## Privacy checklist

- [ ] Page HTML does not contain lead email or company name.
- [ ] `og:description` / `twitter:description` contain only aggregate audit stats.
- [ ] OG image text shows savings/spend labels only (no contact fields).
