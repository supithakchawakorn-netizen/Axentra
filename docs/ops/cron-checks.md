# Cron Checks

## Protected cron routes

- `/api/cron/generate-ticker-summaries`
- `/api/cron/generate-ticker-news-summaries`

## Verification steps

1. Confirm `CRON_SECRET` exists in Vercel production environment.
2. Trigger each cron endpoint manually with `x-cron-secret` header from a secure client.
3. Verify response status is 200 and includes expected batch counters.
4. Verify corresponding rows in Supabase summary tables update timestamps.
5. Confirm Sentry has no new errors for cron route paths.

## Failure response

1. Check OpenAI quota/status and API key validity.
2. Re-run with a smaller ticker subset if provider instability is suspected.
3. If repeated parse failures occur, pin to the previous prompt version and open a follow-up issue.
