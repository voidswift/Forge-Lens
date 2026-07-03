# Operation Iron: Benchmark Campaign

This directory contains the automated benchmark suite. We do not benchmark once; we benchmark every release to prove our operational resilience and performance trends over time.

## Benchmark Tiers

We run a phased campaign to answer specific engineering questions at every level of scale:

1. **Benchmark 0 (Smoke Test):** `octocat/Hello-World`
   - *Questions:* Does the pipeline work? Are traces and metrics collecting?
2. **Benchmark 1 (Real Project):** `vercel/next.js`
   - *Questions:* Is streaming working? Is memory flat? Is Health Engine accurate?
3. **Benchmark 2 (Large):** `microsoft/vscode`
   - *Questions:* How does batch insertion hold up? Queue back-pressure behavior?
4. **Benchmark 3 (Very Large):** `kubernetes/kubernetes`
   - *Questions:* Checkpoint recovery upon failure? Worker stability?
5. **Benchmark 4 (Torture Test):** `torvalds/linux`
   - *Questions:* Did we survive? Did GitHub throttling recover? Did memory stay below 500MB?

## Metrics Collected

Our JSON history tracks highly granular systems data:

- **GitHub:** Requests, retries, throttle events, pagination pages.
- **Database:** Rows inserted/sec, transaction duration, lock waits.
- **Worker:** Queue wait, processing time, retries, failures.
- **Memory:** Peak heap, GC pauses, RSS (Resident Set Size).
- **CPU:** User/system %, load.
- **Analytics:** Duration to compute Health, Contributors, and Resilience.
- **Network:** Bytes downloaded, average response time.

## Historical Tracking

Every benchmark run saves a snapshot to `history/YYYY-MM-DD.json`. 
We use these snapshots to generate `report.html` and compare deltas (e.g., *Memory decreased 37%*). Any regression against the baseline fails CI.
