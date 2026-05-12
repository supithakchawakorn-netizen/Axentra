# Alert Ownership

## Primary ownership

- **Platform owner**: web app uptime, route errors, deployment health.
- **Data/AI owner**: cron generation failures, summary freshness regressions.
- **Integrations owner**: webhook failures and provider authentication drift.

## Escalation path

1. Acknowledge alert in monitoring channel.
2. Triage severity:
   - Sev-1: production outage or data-loss risk
   - Sev-2: major degraded functionality
   - Sev-3: non-blocking regression
3. Assign incident lead and post status every 30 minutes until mitigated.

## Required incident record

- Start time and detection source
- User impact summary
- Root cause
- Mitigation
- Permanent follow-up action
