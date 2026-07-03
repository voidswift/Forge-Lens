# ForgeLens Development Roadmap

*Guiding Principle: Every sprint must leave the product in a releasable state, even if no release occurs. Each sprint must produce a complete vertical slice.*

---

## Phase A: Prove the Core (Can we build it?)

### Sprint 1: The Walking Skeleton
**Goal:** Prove the infrastructure end-to-end. Get data from GitHub onto a screen.
- **Tasks:** 
  - Set up Turborepo, Next.js, and CI/CD.
  - Implement Clerk Authentication.
  - Provision Database (Neon/Postgres) and Drizzle schemas.
  - Build GitHub OAuth integration.
- **Success Metrics:**
  - ✓ User signs in under 15 seconds.
  - ✓ Repository list loads under 2 seconds.
  - ✓ CI pipeline runs in under 5 minutes.

### Sprint 2: The Data Pipeline
**Goal:** Ingest data securely and asynchronously.
- **Tasks:**
  - Deploy Upstash Redis and BullMQ.
  - Build `worker-sync` to fetch GitHub events (GraphQL).
  - Implement the `raw_events` append-only data store.
  - Build `worker-analytics` to compute basic `repository_snapshot`.
- **Success Metrics:**
  - ✓ Repository imports complete within 60 seconds.
  - ✓ Queue latency under 5 seconds.
  - ✓ Snapshot generation under 30 seconds.

---

## Phase B: Prove the Value (Do users care?)

### Sprint 3: Metrics & UI Polish
**Goal:** Implement the proprietary Analytics Engine and Design System.
- **Tasks:**
  - Implement the Design System (`packages/ui`).
  - Build the Metrics Compiler (YAML-driven formulas for Health, Velocity, Sustainability).
  - Implement Tremor/Recharts data visualizations.
- **Success Metrics:**
  - ✓ UI components pass visual regression tests.
  - ✓ Health Score is deterministic and calculates in < 50ms.

### Sprint 4: Intelligence (AI Summaries)
**Goal:** Introduce the LLM safely to explain the analytics.
- **Tasks:**
  - Implement the AI Gateway (Vercel AI SDK).
  - Build the Context Builder to feed deterministic metrics into the LLM.
  - Generate the "Issue Summary" and "Repository Audit" reports.
- **Success Metrics:**
  - ✓ Cached Summary loads in < 200ms.
  - ✓ Fresh Audit generates in < 8s.
  - ✓ Zero hallucinations in Golden Dataset evaluation.

---

## Phase C: Prove the Business (Will someone pay for it?)

### Sprint 5: Scale, Security, and Beta Launch
**Goal:** Multi-tenant readiness, RBAC, and operational excellence.
- **Tasks:**
  - Enforce Workspace Roles (Admin, Member, Viewer).
  - Activate GitHub Webhooks for real-time `raw_events` updates.
  - Implement Edge Caching and strict query budgets.
  - Finalize Observability (Datadog/Axiom).
- **Success Metrics:**
  - ✓ 99.99% webhook success rate.
  - ✓ API p95 latency < 150ms.
  - ✓ Successful deployment of v1.0 Release Candidate.
