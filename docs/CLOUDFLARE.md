# Cloudflare setup

Operations guide for kenhelms.dev on Cloudflare Pages.

## Pages project

| Setting | Value |
|---------|-------|
| Repository | `devkhelms/kenhelms-site` |
| Production branch | `main` |
| Build command | `hugo --minify` |
| Build output | `public` |
| Custom domain | `kenhelms.dev` |

Optional env var:

| Name | Value |
|------|-------|
| `HUGO_VERSION` | `0.164.0` (match local Hugo if builds differ) |

## Environment variables (Production)

All contact-form secrets must be set for **Production**. Changes apply on the **next deploy** — retry deployment after editing.

| Name | Type | Purpose |
|------|------|---------|
| `RESEND_API_KEY` | Secret | Resend API key (`re_...`) |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile secret key |
| `CONTACT_TO` | Secret | Inbox that receives form submissions (not exposed on the site) |
| `CONTACT_FROM` | Plaintext | Verified sender, e.g. `forms@kenhelms.dev` |

Public Turnstile site key lives in `hugo.toml` → `turnstileSiteKey`.

### Sandbox testing (before domain verification)

| Name | Value |
|------|-------|
| `CONTACT_FROM` | `onboarding@resend.dev` |
| `CONTACT_TO` | Resend account email only |

### Production (after Resend domain verified)

| Name | Value |
|------|-------|
| `CONTACT_FROM` | `forms@kenhelms.dev` |
| `CONTACT_TO` | Your inbox (secret) |

Mail is sent **from** `forms@kenhelms.dev` with **reply-to** set to the visitor's address. `CONTACT_TO` is only read server-side.

## Resend

1. [resend.com](https://resend.com) → **Domains** → add `kenhelms.dev`
2. Add the DNS records Resend provides (DKIM, etc.)
3. Wait until the domain shows **Verified**
4. Create an API key → store as `RESEND_API_KEY` in Pages

Check **Emails** in Resend for delivery status. If messages show **Suppressed**, remove the address from the suppression list.

### Spam folder

New senders often land in spam (e.g. Proton). Mark **Not spam** once to train the filter. DMARC and SPF help long-term reputation.

## DNS records

Manage in **Cloudflare → DNS** for `kenhelms.dev`.

### Site

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` | `kenhelms-site.pages.dev` | Proxied |

### Email sending (Resend)

Merge into **one** SPF TXT on `@`:

```
v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all
```

Remove legacy Mailchannels records if still present (`relay.mailchannels.net`, `_mailchannels` TXT).

Add Resend DKIM records from the Resend dashboard.

### DMARC (recommended, monitor-only)

| Type | Name | Content |
|------|------|---------|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:ping@kenhelms.dev;` |

Use `p=none` while monitoring. Avoid `p=reject` until all sending paths are verified — strict DMARC can affect Email Routing forwards.

Omit `rua=...` if you do not want aggregate report emails.

### Inbound email (optional)

Cloudflare **Email Routing** can forward `ping@kenhelms.dev` to your personal inbox for direct mail. The contact form sends via Resend **directly** to `CONTACT_TO` — it does not route through `ping@`.

## www redirect

Canonical URL is `https://kenhelms.dev` (`baseURL` in `hugo.toml`).

1. **Rules → Redirect Rules** — `www.kenhelms.dev` → `https://kenhelms.dev` (301)
2. When prompted, **Create a new proxied DNS record** for `www`
3. Use **A** record: Name `www`, IPv4 `192.0.2.1`, Proxied (placeholder; redirect handles traffic)

Test: `https://www.kenhelms.dev` should redirect to `https://kenhelms.dev`.

## Turnstile

1. Cloudflare dashboard → **Turnstile** → site for `kenhelms.dev`
2. **Site key** → `hugo.toml` (`turnstileSiteKey`)
3. **Secret key** → Pages env `TURNSTILE_SECRET_KEY`

## Functions

There is no Functions tab with source code in the dashboard. The handler is `functions/api/contact.js` in the repo; Cloudflare deploys it as `/api/contact`.

Runtime settings: **Pages → Settings → Runtime** (Placement: Default is fine).

Logs: **Pages → kenhelms-site → Logs** (real-time) after a form submission.

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| "Server not configured" | Missing env var or deploy before vars were saved. Retry deployment. |
| "Verification failed" | Turnstile secret mismatch. |
| "Could not send message" | Resend error — check form message after deploy (errors are surfaced) or Resend logs. |
| Form says Sent, no mail | Resend **Suppressed**, or mail in spam. |
| Resend Delivered, no mail (to `ping@`) | Email Routing forward issue — send form to inbox directly via `CONTACT_TO` secret instead. |
| `/api/contact` 404 locally | Expected — Functions only run on Pages. |

## Security headers

`static/_headers` sets baseline security headers for the static output.

## PASSWORDS.CSV easter egg

Desktop file under **Drive C:** → password prompt → reward image with visitor counter.

| Piece | Location |
|-------|----------|
| UI | `layouts/partials/passwords.html`, `static/js/passwords.js` |
| API | `functions/api/passwords.js` → `POST /api/passwords` |
| Image | `static/images/quaid.webp` |
| Counter | Cloudflare **KV** binding |

### KV setup (required for visitor count)

1. **Workers & Pages → KV → Create namespace** (e.g. `password-egg`)
2. **Pages → kenhelms-site → Settings → Bindings → KV namespace**
   - Variable name: `PASSWORD_EGG_KV`
   - KV namespace: the one you created
3. **Redeploy**

Password check runs in the browser (case-insensitive: `password`). Wrong attempts show a Jurassic Park–style denial dialog. The API increments the visitor counter only after a correct password. Without KV, the image still unlocks but the counter shows **—**.

