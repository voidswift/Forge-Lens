# ForgeLens Engineering Quality Principles

*This is the cultural DNA of ForgeLens. Whenever you are faced with an architectural trade-off, consult these principles.*

1. **Users never wait for background work.**
   No user-facing HTTP request should block while waiting for GitHub to sync or an LLM to generate text. The UI reads optimized projections; workers compute them asynchronously.

2. **Every metric is reproducible.**
   Analytics are derived from an immutable `raw_events` append-only log. If we change a formula tomorrow, we can replay history to recalculate it perfectly.

3. **Every recommendation cites evidence.**
   The LLM never computes truth; it explains truth computed by the Analytics Engine. If the AI makes a claim about repository health, the prompt must have provided the hard data to back it up.

4. **Every request is authenticated and authorized.**
   Zero Trust. We enforce Row-Level Security (RLS) in the database and validate Workspace RBAC in the application layer. No component trusts another solely because it is inside the system boundary.

5. **Every cache has an invalidation strategy.**
   There are only two hard things in Computer Science. In ForgeLens, if you cache something, you must explicitly document the event that invalidates it (e.g., `Webhook Received -> Invalidate Snapshot`).

6. **Every failure is observable.**
   If a background job fails, it must emit an event, log a structured payload, and enter a Dead Letter Queue. Silent failures are forbidden.

7. **Every feature ships with tests.**
   We optimize for *Confidence per Line of Code*. We test behaviors, not implementations. Every critical business invariant and domain formula must have automated coverage.

8. **Every architecture rule is enforceable.**
   If a rule exists, it belongs in CI. Folder boundaries are enforced by `dependency-cruiser`. Formatting is enforced by Prettier. If it relies on humans remembering it, it will eventually fail.

9. **Performance budgets are treated as API contracts.**
   Performance is a security feature to prevent resource exhaustion. If an endpoint introduces an N+1 query and exceeds its latency budget (e.g., < 150ms), the PR is rejected.

10. **Deployments should be boring.**
    Every deployment must be reversible. Every infrastructure change must be reproducible via IaC. We use feature flags to separate deployment from release.
