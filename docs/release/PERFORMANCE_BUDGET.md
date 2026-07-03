# Performance Budget

To prevent regressions, ForgeLens enforces strict performance budgets on all pull requests. If a change violates these budgets, the CI pipeline will fail. 

| Metric | Budget | Description |
| :--- | :--- | :--- |
| **Ingestion Memory** | `< 500 MB` | The Node V8 isolate running the sync worker must never exceed 500MB, regardless of repository size. |
| **API Latency (P99)** | `< 200 ms` | Core Next.js API route responses must remain snappy. |
| **Dashboard Load** | `< 1 s` | The React UI must paint within 1 second. |
| **Analytics Compilation** | `< 300 ms` | Health, Resilience, and Contributor engines must compile instantly. |
| **Queue Wait Time** | `< 5 s` | Webhook to Worker pickup latency. |
| **DB Insertion Rate** | `> 500 rows/s` | Batch inserts must not degrade. |
| **Error Rate** | `< 0.1%` | Fatal unhandled exceptions in the sync pipeline. |

## CI Rules

- `memory +25%` → **FAIL**
- `latency +30%` → **FAIL**
- `db_queries * 2` (N+1 regression) → **FAIL**
