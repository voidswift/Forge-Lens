# ADR 0002: Event-Driven Analytics & CQRS-Lite

**Status:** Accepted
**Date:** 2026-07-03

## Context
ForgeLens must display real-time analytics (velocity, issue resolution, health scores) for repositories containing tens of thousands of commits and issues. If the API queries a relational database to aggregate these metrics synchronously on page load, the database will eventually fall over and the UI will feel sluggish.

## Decision
We will separate the "Write" path from the "Read" path, adopting a CQRS-Lite (Command Query Responsibility Segregation) approach with Event Sourcing principles.

1. **Write Path (Raw Events):** Webhooks and background importers append immutable records to a `raw_events` table (e.g., `IssueClosedEvent`, `PullRequestMergedEvent`). This table is optimized for rapid inserts and chronological scanning.
2. **Read Path (Snapshots):** A background worker (`worker-analytics`) periodically reads the new `raw_events`, computes the deterministic metrics, and writes the results to a `repository_snapshots` table. The Next.js API only ever reads from `repository_snapshots`.

## Rationale
- **O(1) Dashboard Loads:** The UI never performs aggregations. It reads a pre-computed JSONB object or flat row.
- **Reproducibility:** If we discover a bug in the Health Score formula, we can replay the `raw_events` table to regenerate the snapshots perfectly.
- **Resilience:** If the Analytics Worker crashes, the Webhook receiver continues appending raw events safely. The system is eventually consistent.

## Consequences
- Data on the dashboard may be slightly stale (eventually consistent by a few seconds or minutes). We must reflect this clearly in the UI (e.g., "Last updated 2 mins ago").
- We must implement robust Dead Letter Queues for the snapshot generators.
