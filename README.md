# Axentra

Web-first market video and live platform. Watch market commentary on demand or live, follow creators who link their brokerage read-only for credibility, and read AI-generated summaries on ticker pages.

V1 is **public-watch first**: anyone can watch videos and live rooms without an account. Creators sign in to upload, go live, and link a brokerage account read-only.

> Heads up: Axentra **does not** execute trades, pool capital, or run a copy-trading product. See `docs/project/non-goals.md`.

## Stack

- **Framework**: Next.js (App Router) + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Auth + DB**: Supabase (Postgres, Auth, RLS, Storage, Vault)
- **VOD**: Mux (upload + playback)
- **Live**: LiveKit (rooms + WebRTC)
- **Brokerage (read-only)**: SnapTrade
- **Payments**: Stripe (scaffolded for future Premium)
- **AI**: OpenAI (ticker / news summaries)
- **Analytics**: PostHog (EU cloud)
- **Errors**: Sentry
- **Email**: Resend
- **Hosting**: Vercel

## Quick start

```bash
fill in Supabase, Mux, LiveKit, SnapTrade, Stripe, OpenAI, PostHog, Sentry, Resend keys
pnpm supabase db reset    # applies migrations to local Supabase
pnpm dev
App runs at `http://localhost:3000`.

## Where to look first

| If you want to... | Read |
|---|---|
| Get the full agent context for any task | `AGENTS.md` |
| See what is and isn't in V1 | `docs/project/scope-v1.md`, `docs/project/non-goals.md` |
| See the build order | `docs/project/roadmap.md` |
| Understand pages and routes | `docs/product/page-map.md`, `docs/frontend/routes.md` |
| Work on the database | `docs/backend/db-schema.md` |
| Work on auth | `docs/backend/auth-rules.md` |
| Work on UI | `docs/frontend/frontend-rules.md` |
| Understand AI features | `docs/product/ai-features.md` |
| Understand the brokerage link | `docs/product/creator-broker-link.md` |

## Repo layout

See `AGENTS.md` for the canonical layout and naming conventions.

## Contributing

This repo is configured for agentic coding with Claude Code and Cursor. Both tools should read `AGENTS.md` first; that file is the shared brain. `CLAUDE.md` and `.cursorrules` point back to it so context stays in one place.

When adding a feature, the order is:

1. Confirm it is in V1 (`docs/project/scope-v1.md`). If unsure, it's probably a non-goal.
2. Read the relevant doc under `docs/`.
3. Make the change.
4. Update the relevant doc if the change shifts behavior or schema.
