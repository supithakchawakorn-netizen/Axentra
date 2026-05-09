md# Varg Packs — Project Overview

## What it is

Varg Packs is a web-first **video and live platform for retail market commentary**. Think of it as a YouTube + Twitch hybrid scoped to markets, where creator credibility is reinforced by a read-only brokerage link rather than self-claimed track records.

## Why now

- Retail market content lives across YouTube, X spaces, Discord, and Substack — each optimized for something other than market video.
- Trust in market influencers is low because performance is rarely verifiable.
- Live-streamed market commentary during the trading day is fragmented and hard to discover.

Varg Packs concentrates the format (video + live) and adds verification (read-only brokerage link) so viewers can quickly tell which creators actually trade what they post.

## Audience

- **Viewers (primary, anonymous in V1)**: retail traders and investors looking for market video, live commentary, and per-ticker context.
- **Creators (secondary)**: market commentators, retail traders, and analysts who already publish elsewhere and want a market-native home with verified credibility.

## V1 product shape

- Public, no-login watch experience: homepage, explore, live directory, ticker pages, creator profiles, video and live room watch pages.
- Creator-only sign-in (Google + email).
- Creator studio for upload, live, profile, and brokerage link.
- AI summaries on ticker pages.
- Creator monetization in V1: gifts, donations, and creator-scoped ad-free unlocks.
- Pricing page explains monetization model and policies.

## Delivery phase shorthand

For planning conversations, we use this shorthand without changing canonical scope docs:

- **V0 / Phase A**: core watch surfaces (video + live).
- **V1**: canonical repo V1 as defined in `scope-v1.md` (including creator read-only brokerage verification).
- **V2**: advanced viewer-side brokerage and follow-trade expansion after V1 ships.

Scope authority remains `scope-v1.md` and `non-goals.md`.

## What it is **not**

Varg Packs is a media platform. It does **not**:

- Execute trades on behalf of users.
- Pool user capital.
- Run a copy-trading product.
- Offer a deep chart terminal in V1.

A future Premium tier may offer a *follow-trade* feature, but only via each viewer's own linked individual brokerage account — never via pooled money. See `non-goals.md`.

## Differentiation

- **Format-native.** Designed around video and live, not retrofitted from a chat or newsletter product.
- **Verified credibility.** Read-only brokerage link is a first-class creator surface, not a gimmick.
- **Ticker-as-a-page.** Every public ticker page is a discovery surface that links creator content with an AI-written summary.
- **Strict scope.** No trading, no pooled capital, no chart terminal — Varg Packs stays a media product so it can move fast and stay out of regulated execution paths in V1.

## North-star metric (V1)

Weekly active anonymous watch sessions per creator with linked brokerage. (Watching is the product; verified creators are the moat.)
