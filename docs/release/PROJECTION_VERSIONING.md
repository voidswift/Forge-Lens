# Projection Versioning Architecture

*A core directive for Operation Iron: analytics must never be destructively migrated or tightly coupled to database state.*

## Current Flaw
Currently, the sync worker calculates `Health`, `BusFactor`, and `Resilience` synchronously during ingestion. These scores are pushed directly to the database. If we upgrade our Health algorithm from v1 to v2, we either have to:
1. Nuke the database and recalculate from scratch.
2. Accept a mix of v1 and v2 scores in the same column.

Both are catastrophic for an analytics product.

## Future Implementation (CQRS)

We will separate **Ingestion** from **Projection**.

### 1. Ingestion (Write Model)
The Inngest worker's only job is to stream data from GitHub and insert it into an event log or raw table:
- `commits`
- `pull_requests`
- `issues`

### 2. Projections (Read Model)
We will introduce versioned Projection Workers.

Instead of writing to `repositories.health_score`, the worker will write to a new table:
`health_projections`

```sql
CREATE TABLE health_projections (
  repository_id TEXT,
  version TEXT, -- e.g., 'v1', 'v2'
  score INTEGER,
  evidence JSONB,
  computed_at TIMESTAMP
);
```

### 3. Graceful Migrations (Zero Downtime)
When `v2` of the health algorithm is released:
1. We deploy the `v2` Projection Worker.
2. The worker replays historical data from `commits` and `pull_requests`, generating `health_projections` with `version = 'v2'`.
3. Meanwhile, the UI continues serving `v1`.
4. Once `v2` has fully backfilled all repositories, we flip the feature flag in the UI to query `version = 'v2'`.
5. We safely drop `v1` records from the database.

This guarantees zero downtime, completely deterministic metrics, and infinite replayability.
