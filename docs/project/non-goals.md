md# Non-goals — V1

Things that are explicitly **not** in V1. Some are deferred; some are permanent. Both are off-limits right now.

## Deferred (may return in later versions, with rules)

### Viewer accounts and social features

- Viewer sign-up, profiles, follows, playlists, watch history, bookmarks, saved tickers, notifications.
- V1 is anonymous-watch first. Viewer accounts are deferred to V1.x at the earliest.

### Anonymous chat writes

- Chat-write in live rooms is creator + creator-invited co-hosts only. No anonymous chat writes in V1. When viewer accounts ship, chat-write may extend to signed-in viewers.

### Viewer brokerage linking

- In V1 only **creators** can link a brokerage. Viewer-side linking is deferred and **only** for the eventual follow-trade Premium feature.

### Premium subscriptions (live)

- The pricing page exists and Stripe is wired, but no Premium features are active in V1. Treat any "gated by Premium" idea as scope creep until a later milestone explicitly enables it.

### Follow-trade (Premium, later only)

- A future Premium feature where a viewer mirrors a creator's trades.
- **Strict requirement**: must use each viewer's **own linked individual brokerage account**. No pooled money, no shared account, no fund-like structure.
- Out of V1 entirely. Do not stub UI for it. Do not add DB columns for it.

### Native mobile apps

- iOS and Android native apps are out of V1. Web only. PWA manifest (`app/manifest.ts`) is acceptable; React Native, Capacitor, Expo, Tauri, and similar shells are not.

### Any chart UI

- Candle charts, line charts, indicators, watchlists, drawing tools, multi-pane layouts, alerts on price, **and sparklines / mini-charts**.
- No chart library is to be added in V1 (`recharts`, `lightweight-charts`, `tradingview-widget`, etc.).
- Ticker pages display text and content only.

### Creator monetization tools

- Tipping, paid subs to creators, paid live rooms, ad revenue share. Out of V1.

### Internationalization

- V1 ships in English. i18n scaffolding may be added later.

## Permanent (never coming, by design)

### Pooled capital / fund-like products

- Axentra will **never** pool user money, take custody of user funds, or operate anything that resembles a managed fund or copy-trade pool.
- Hard constraint for legal and product reasons. Any task that drifts toward pooling capital must be rejected, regardless of how it is framed.

### Trade execution by Axentra

- Axentra will not place orders on behalf of users from its own infrastructure or under its own brokerage relationship.
- Even when follow-trade ships, execution happens **inside the user's own linked brokerage account**, initiated through that broker's own connection. Axentra is never the executing party.

### Order endpoints on the SnapTrade integration

- The SnapTrade client in `lib/snaptrade/` only ever uses read endpoints (accounts, balances, positions, activities). Order/trade endpoints must not be imported or wrapped in this repo.

## How to handle scope-creep tasks

If a request, ticket, or design touches any of the above:

1. Stop.
2. Reference this file in the PR or chat.
3. Confirm intent with the maintainer.
4. If still required, propose a separate, clearly-labeled later milestone — never sneak it into a V1 PR.
