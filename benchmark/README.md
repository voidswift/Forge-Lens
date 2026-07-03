# ForgeLens Benchmarking Suite

This directory contains the tools, scripts, and historical results for the ForgeLens Operation Iron benchmark suite. 

## Benchmark Tiers

We run benchmarks against four tiers of repositories to prove our Operational Readiness under scale:

- **Tier 1 (Small):** `vercel/next.js`
- **Tier 2 (Medium):** `microsoft/vscode`
- **Tier 3 (Large):** `kubernetes/kubernetes`
- **Tier 4 (Extreme):** `torvalds/linux`

## Metrics Tracked

For each run, we measure and record:
- Import duration (ms)
- Peak RAM (MB)
- Peak CPU (%)
- GitHub API Requests
- DB Inserts/sec
- Queue Latency
- Rate Limit & Throttle Events

## Failure Injections

Alongside data throughput, we run Chaos/Failure injection tests:
- `SIGTERM` Worker Kills (Resumption verification)
- Redis / Inngest Disconnects
- GitHub API 429 cascades
- Postgres Connection Drops

All results are recorded in the `results/` directory and summarize our `ENGINEERING_EVIDENCE.md`.
