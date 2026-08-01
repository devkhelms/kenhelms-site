# kenhelms.dev

Personal portfolio site — Win95 shell, DOS terminal interior. Built with [Hugo](https://gohugo.io/) and deployed on Cloudflare Pages.

Live: [https://kenhelms.dev](https://kenhelms.dev)

## Stack

| Layer | Tech |
|-------|------|
| Site generator | Hugo |
| Hosting | Cloudflare Pages |
| Contact API | Pages Function (`functions/api/contact.js`) |
| Email delivery | [Resend](https://resend.com) |
| Bot protection | Cloudflare Turnstile |

## Local development

Requirements: Hugo (0.164+ recommended; Pages uses `HUGO_VERSION` env var).

```bash
hugo server
```

Open [http://localhost:1313](http://localhost:1313).

The contact form UI loads locally, but `/api/contact` only runs on Cloudflare Pages — submissions fail outside production.

## Project layout

```
content/           Page content (minimal; layout-driven home page)
data/projects.yaml Featured projects
functions/api/     Contact form Pages Function
layouts/           Hugo templates
static/css/        Styles
static/js/         UI, snake easter egg, contact form client
hugo.toml          Site config (public Turnstile site key)
```

## Content

- **Projects** — edit `data/projects.yaml`. Link keys: `project_site`, `repo`, `demo`, `writeup` (not `site`; that conflicts with Hugo's global `site` object).
- **Tagline** — `hugo.toml` → `[params].tagline`

## Features

- Single-page portfolio in a faux MS-DOS window
- Desktop icon: **Portfolio**
- **Start** menu: Snake, Contact
- **Elsewhere**: Contact only
- Snake easter egg (`static/js/snake.js`)
- Contact form with Turnstile → Resend

## Deployment

Push to `main` on GitHub. Cloudflare Pages builds with:

- **Build command:** `hugo --minify`
- **Output directory:** `public`

See [docs/CLOUDFLARE.md](docs/CLOUDFLARE.md) for DNS, env vars, email, and `www` redirect setup.

## Secrets

Never commit API keys or inbox addresses. All secrets live in **Cloudflare Pages → Settings → Variables and secrets (Production)**.
