# Axentra

Web-first market video and live platform. Watch market commentary on demand or live, follow creators who link their brokerage read-only for credibility, and read AI-generated summaries on ticker pages.

V1 is **public-watch first**: anyone can watch videos and live rooms without an account. Creators sign in to upload, go live, and link a brokerage account read-only.

> Heads up: Axentra **does not** execute trades, pool capital, or run a copy-trading product. See `docs/project/non-goals.md`.

## Stack

- **Framework**: Next.js (App Router) + TypeScript (strict)
- **UI**: Tailwind CSS v4 + shadcn/ui (zinc base, dark default)
- **Auth + DB**: Supabase (Postgres, Auth, RLS, Storage, Vault)
- **VOD**: Mux (upload + playback) — wired in M1
- **Live**: LiveKit (rooms + WebRTC) — wired in M2
- **AI**: OpenAI (ticker / news summaries) — wired in M3
- **Brokerage (read-only)**: SnapTrade — wired in M4
- **Payments**: Stripe (scaffolded in M4 for future Premium)
- **Analytics**: PostHog (EU cloud, anonymous distinct IDs)
- **Errors**: Sentry
- **Email**: Resend
- **Market data**: Provider-ready realtime quote tape scaffold (demo by default)
- **Hosting**: Vercel

## Quick start

```bash
# 1. install dependencies
pnpm install

# 2. copy env template and fill in real values as services are provisioned
cp .env.example .env.local

# 3. boot the dev server
pnpm dev
```

App runs at `http://localhost:3000`.

The app boots cleanly with **zero** external services configured — every integration no-ops gracefully when its env vars are absent. Provision services as we hit each milestone.

## Windows / OneDrive setup

This repo lives under `OneDrive\Documents\Axentra`. OneDrive sync interferes with `node_modules`, `.next`, and `.turbo` (millions of small files; constant churn). After your first `pnpm install`, mark these directories as **"Free up space"** so they stop syncing:

1. Open File Explorer.
2. Right-click `node_modules`, `.next`, `.turbo` → **Free up space**.
3. They'll show a cloud-only icon but still work locally.

Alternatively, move the repo out of OneDrive (e.g. to `C:\dev\Axentra`).

## Database setup (Supabase, remote)

We don't run a local Supabase stack on this machine. Migrations push to a remote Supabase project.

1. Create a Supabase project at <https://supabase.com/dashboard>.
2. Copy `Project URL`, `anon public` key, and `service_role` key from **Project Settings → API** into `.env.local`.
3. Install the Supabase CLI (Windows): `scoop install supabase` or download from <https://github.com/supabase/cli/releases>.
4. Link this repo to your project:
   ```bash
   supabase link --project-ref <your-project-ref>
   ```
5. Push migrations:
   ```bash
   pnpm db:migrate         # alias for: supabase db push
   ```
6. Generate typed schema:
   ```bash
   pnpm db:types           # writes types/db.ts
   ```

`pnpm db:reset` is a stub for now (a local stack would let us reset on demand). Re-enable once we add Docker/Supabase CLI local dev.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Next.js dev server. |
| `pnpm build` | Production build. |
| `pnpm start` | Run the production build. |
| `pnpm lint` | ESLint (Next.js + TS rules). |
| `pnpm typecheck` | `tsc --noEmit`. |
| `pnpm test` | Vitest unit tests. |
| `pnpm format` | Prettier write. |
| `pnpm check` | `lint && typecheck && test && build` (local CI gate). |
| `pnpm db:migrate` | Push migrations to remote Supabase. |
| `pnpm db:types` | Regenerate `types/db.ts` from the linked project. |

CI on GitHub is intentionally not wired yet (per plan, local git only for now). When a remote is added we'll add `.github/workflows/ci.yml`.

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

## Product stage shorthand

To align execution language with product discussion, use this mapping:

- **V0 (Phase A):** watch-first platform foundation (video + live discovery surfaces).
- **V1 (canonical repo V1):** full scoped V1 in `docs/project/scope-v1.md`, including creator read-only portfolio verification.
- **V2 (post-V1):** premium viewer-side expansion (viewer brokerage linking + follow-trade under strict constraints).

Important: canonical implementation scope is still governed by `scope-v1.md` and `non-goals.md`.

## Repo layout

See `AGENTS.md` for the canonical layout and naming conventions.

## Contributing

This repo is configured for agentic coding with Claude Code and Cursor. Both tools should read `AGENTS.md` first; that file is the shared brain. `CLAUDE.md` and `.cursorrules` point back to it so context stays in one place.

When adding a feature, the order is:

1. Confirm it is in V1 (`docs/project/scope-v1.md`). If unsure, it's probably a non-goal.
2. Read the relevant doc under `docs/`.
3. Make the change.
4. Update the relevant doc if the change shifts behavior or schema.
