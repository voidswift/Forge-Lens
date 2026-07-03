# ADR 0001: Modular Monolith Architecture

**Status:** Accepted
**Date:** 2026-07-03

## Context
ForgeLens is a complex platform encompassing data ingestion, analytics computation, AI orchestration, and user presentation. We need an architecture that scales cleanly as the team and product grow, without the operational overhead of microservices in the early stages of a startup.

## Decision
We will use a **Modular Monolith** architecture powered by `pnpm` workspaces and `Turborepo`. 

The codebase will be strictly divided into dependency layers:
1. `apps/` (Application Layer - Next.js, Background Workers)
2. `packages/domain-*/` (Domain Layer - Business logic, orchestrations, validators)
3. `packages/providers/` (Infrastructure Layer - GitHub API integrations)
4. `packages/db/` (Data Access Layer - Postgres schemas and migrations)
5. `packages/ui/` (Presentation Layer - Shared design system)

We will enforce dependency directions (e.g., Domain cannot import Apps) using CI tools like `dependency-cruiser` or ESLint boundary plugins.

## Rationale
- **Development Velocity:** A single repository allows for atomic commits across frontend, backend, and infrastructure, drastically simplifying refactoring.
- **Operational Simplicity:** We deploy fewer services. The entire system can run locally on a developer's machine with `docker compose up`.
- **Future-Proofing:** By enforcing strict module boundaries now, we can easily split a domain package (like `domain-analytics`) into its own microservice later if scaling demands it, without untangling spaghetti code.

## Consequences
- Developers must be disciplined about not bypassing module boundaries. We must enforce this mechanically in CI.
- The `package.json` configurations must be meticulously maintained to ensure Turborepo can cache builds correctly.
