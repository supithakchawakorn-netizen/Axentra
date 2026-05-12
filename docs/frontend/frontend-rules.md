# Frontend rules — V1

Strict rules so Cursor, Claude Code, and humans build the same way.

## 1. Stack

- Next.js App Router, TypeScript strict.
- Tailwind utility-first.
- shadcn/ui primitives. No other UI libraries.
- Icons: `lucide-react`.
- Forms: `react-hook-form` + `zod` resolver.
- Dates: `date-fns`.
- Player: Mux Player React for VOD; LiveKit React components for live.
- **No chart library.** Not in V1, not even for sparklines.

## 2. Component model

- **Server Components by default.** Add `"use client"` only when you need state, effects, refs, browser APIs, or event handlers.
- A page (`page.tsx`) is a Server Component. Heavy interactive children get split into client components in `components/<area>/`.
- Co-locate small private subcomponents in the same folder; promote to `components/` only when reused.

### Folder layout under `components/`

- `ui/` — shadcn primitives (generated, lightly extended).
- `layout/` — site shell (header, footer, sidebars).
- `video/` — Mux player wrapper, video card, video grid, video meta.
- `live/` — LiveKit viewer, live card, live chat (read-only public, conditional compose).
- `ticker/` — ticker chip, ticker header (text only), summary card, news card.
- `creator/` — creator strip, verified badge, profile tabs.
- `shared/` — empty states, loading skeletons, formatters.

## 3. Styling

- Tailwind classes inline. No CSS Modules, no styled-components.
- Use `cn()` (from `lib/utils/cn.ts`) for conditional classes.
- Variants via `cva` inside `components/ui/*`.
- Dark mode is the default. Use semantic Tailwind tokens (`bg-background`, `text-foreground`, `border-border`).
- Tailwind config holds the design tokens. No magic hex values in components.

## 4. Naming

- Files: `kebab-case.tsx`, `kebab-case.ts`.
- Components: `PascalCase`. One default export per component file.
- Hooks: `useCamelCase` in `hooks/`.
- Server Actions: `verbNoun`, in `_actions.ts` adjacent to the page that uses them.
- Route Handlers: `app/api/<area>/<thing>/route.ts`.

## 5. Data fetching and mutation (decision rule)

| Need | Use |
|---|---|
| Read in a public/SSR page | Server Component using `lib/supabase/server.ts` |
| Mutation from a creator-studio form | Server Action |
| Webhook from a third party | Route Handler |
| Vercel Cron job | Route Handler |
| Token/URL needed by an unauthenticated public client | Route Handler (rate-limited) |
| Real-time UI (chat, presence) | LiveKit / Supabase Realtime SDK on the client |

There is **one** way to do each. Do not add a Route Handler that mirrors a Server Action.

## 6. Forms

- `react-hook-form` + `zod`.
- Schema lives in `types/<feature>.ts` and is shared between the form and the Server Action.
- Server Action re-parses with the same schema (never trust the client).
- Surface field errors next to fields. Server errors at the top.

## 7. Loading and errors

- Every route segment has `loading.tsx` and `error.tsx` where it makes sense.
- Skeletons in `components/shared/skeletons/`.
- `error.tsx` reports to Sentry; UI says "Something went wrong" with a retry button. Never leak server error text.

## 8. Accessibility

- Semantic elements. Keyboard reachability. Visible focus rings.
- Images and avatars require `alt`.
- Mux Player and LiveKit have captions/keyboard support; do not disable.
- Color contrast meets WCAG AA on both themes.

## 9. SEO

- Every public page exports `generateMetadata` with title, description, OG image, canonical URL.
- Server-render content for `/v/[videoId]`, `/t/[ticker]`, `/@[handle]`, `/room/[roomId]`.
- `sitemap.ts`, `robots.ts`, `manifest.ts` in `app/`.

## 10. Performance

- Images via `next/image`; provide width/height or `fill` with a sized container.
- Heavy client islands behind `dynamic(() => import(...), { ssr: false })` only when necessary.
- Avoid layout shift; reserve space for player and chat.
- Use `revalidate` for ticker summaries and explore feed; tag-based revalidation when content changes.

## 11. Analytics

- Wrap PostHog in `lib/posthog/`. EU cloud. Use a thin `track(event, props)` helper.
- Anonymous distinct IDs for viewers. No PII in event properties.
- Keep implementation parity tracked in `docs/frontend/analytics-audit-matrix.md`.
- Events for V1:
  - `home_view`, `explore_view`, `live_directory_view`, `ticker_view`, `video_view`, `live_view`
  - `video_play`, `video_25/50/75/100`, `live_join`
  - `creator_signup`, `creator_signin`
  - `video_upload_start`, `video_upload_complete`
  - `live_room_create`, `live_room_start`, `live_room_end`
  - `broker_connect_start`, `broker_connect_complete`, `broker_visibility_toggle`
  - `waitlist_submit`

## 12. Don'ts

- No additional UI libraries (Material, Chakra, Mantine, etc.).
- No chart library (recharts, lightweight-charts, tradingview-widget) — V1 has no charts of any kind.
- No client-side data fetching for SSR-critical content.
- No `dangerouslySetInnerHTML` on user input.
- No global state libraries unless justified.
- No experimental Next features unless explicitly approved.
- No Route Handler that duplicates a Server Action.
