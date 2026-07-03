# ForgeLens DevOps Playbook

*Deployments should be boring.*

## 1. The CI/CD Pipeline

We use GitHub Actions to enforce our quality gates. A Pull Request cannot be merged unless it passes the following:

- **Lint & Typecheck:** `eslint` and `tsc --noEmit` must pass with 0 errors.
- **Tests:** Vitest (Unit/Integration) must pass. Coverage cannot drop below the baseline.
- **Security:** CodeQL and Dependency Review must find 0 critical/high vulnerabilities.
- **Infrastructure:** The `drizzle-kit` migration must cleanly apply and rollback against an ephemeral database.
- **Architecture:** `dependency-cruiser` must confirm no module boundary violations.

## 2. Progressive Delivery

We do not treat "Deployment" and "Release" as the same event.
- **Deployment:** Moving code to production servers. (Happens constantly via Vercel and our Worker orchestrator).
- **Release:** Exposing a feature to users. (Managed via PostHog Feature Flags).

New features roll out in phases:
1. Internal Team Only
2. 10% Beta Group
3. 50% Rollout
4. 100% General Availability

## 3. SLOs and Error Budgets

We measure reliability objectively. If we exhaust our error budget, feature development stops, and the team pivots to reliability fixes.

| Service | Target SLO | Acceptable Downtime / Month |
| :--- | :--- | :--- |
| **API / Web** | 99.95% | ~21 minutes |
| **Webhooks** | 99.99% | ~4 minutes |
| **AI Reports** | 99.5% | ~3.6 hours |

## 4. Rollback Policy

A deployment will be automatically (or manually) rolled back if Datadog observes any of the following within 15 minutes of deployment:
- API Error Rate (HTTP 5xx) exceeds 2%.
- The p95 Latency of the Repository Dashboard exceeds 500ms.
- BullMQ Dead Letter Queue spikes by more than 100 jobs.

## 5. Scheduled Maintenance

If a database migration requires locking large tables, we enter Maintenance Mode:
1. Toggle the Maintenance Feature Flag (UI shows banner).
2. Pause all BullMQ worker queues (Ingestion stops, but webhooks are still received and queued in Redis).
3. Run the migration.
4. Resume workers to drain the backlog.
5. Toggle off Maintenance Mode.
