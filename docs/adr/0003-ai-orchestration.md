# ADR 0003: AI Orchestration and Deterministic Separation

**Status:** Accepted
**Date:** 2026-07-03

## Context
ForgeLens uses Large Language Models (LLMs) to provide executive summaries and repository audits. However, LLMs are prone to hallucinating quantitative data (e.g., stating a repository has 500 open issues when it actually has 50). This destroys trust in enterprise software.

## Decision
The LLM will strictly be used to **explain truth, not compute it**.

1. **Computation Layer:** The Analytics Engine (TypeScript + Postgres) calculates all numerical data (Health Score, active contributors, average merge time) deterministically.
2. **Context Builder:** We will build a pipeline that serializes these deterministic metrics into a structured prompt context.
3. **Generation Layer:** The LLM is instructed via its System Prompt to rely *only* on the provided metrics and to generate narrative insights (e.g., "Velocity dropped because...").

We will use a multi-model routing strategy:
- **GPT-4o-mini:** For quick, low-latency tasks like Issue Summaries.
- **Claude 3.5 Sonnet:** For deep reasoning tasks like the Full Repository Audit.

## Rationale
- **Trust:** By removing the LLM's ability to "guess" metrics, we guarantee that the numbers shown in the AI report match the numbers on the dashboard exactly.
- **Cost & Latency:** Routing simpler tasks to smaller models (GPT-4o-mini) reduces token costs by 90% and improves time-to-first-token.
- **Auditability:** We can unit test the Analytics Engine mathematically, leaving the LLM to focus purely on natural language generation.

## Consequences
- We must build and maintain a robust Context Builder that correctly formats JSON metrics for the LLM.
- We must implement Golden Dataset evaluations to ensure that prompt changes do not degrade narrative quality.
