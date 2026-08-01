# kenhelms.dev

Personal portfolio — Win95 shell, DOS terminal interior. Built with [Hugo](https://gohugo.io/) and deployed on [Cloudflare Pages](https://pages.cloudflare.com/).

**Live:** [https://kenhelms.dev](https://kenhelms.dev)

## Stack

| Layer | Tech |
|-------|------|
| Site generator | Hugo |
| Hosting | Cloudflare Pages |
| Contact API | Pages Function (`functions/api/contact.js`) |
| Visitor counter | Pages Function + KV (`functions/api/passwords.js`) |
| Email delivery | [Resend](https://resend.com) |
| Bot protection | Cloudflare Turnstile |

## Local development

Requires Hugo (0.164+; Pages uses the `HUGO_VERSION` env var).

```bash
hugo server
```

Open [http://localhost:1313](http://localhost:1313).

The contact form UI loads locally, but `/api/*` Functions only run on Cloudflare Pages.

## Project layout

```
content/              Minimal page content (layout-driven home page)
data/projects.yaml    Featured projects
docs/CLOUDFLARE.md   DNS, env vars, KV, email setup
functions/api/        Pages Functions (contact, passwords counter)
layouts/              Hugo templates
static/css/           Styles
static/images/        Site images (WebP)
static/js/            Boot, UI, easter eggs, contact client
hugo.toml             Site config
```

## Content

- **Projects** — edit `data/projects.yaml`. Set `links.project_site` to the live URL.
- **Tagline** — `hugo.toml` → `[params].tagline`

## Features

- Single-page portfolio in a faux MS-DOS window
- First-visit boot sequence (skipped on return via `sessionStorage`)
- Desktop: **Portfolio**, **Drive C:**, **PASSWORDS.CSV**
- **Start** menu: Portfolio, Snake, Contact, PASSWORDS.CSV
- **Drive C:** file explorer — photo folders (`static/js/drive-c.js`)
- Snake easter egg (`static/js/snake.js`)
- Contact form with Turnstile → Resend
- `PASSWORDS.CSV` easter egg — see [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md#passwords-csv-easter-egg)

## Deployment

Push to `main`. Cloudflare Pages builds with:

- **Build command:** `hugo --minify`
- **Output directory:** `public`

See [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md) for production setup.

## Secrets

Never commit API keys or inbox addresses. All secrets live in **Cloudflare Pages → Settings → Variables and secrets (Production)**.
