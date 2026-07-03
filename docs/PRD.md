# ForgeLens Product Requirements Document (PRD)

## 1. Product Vision
**ForgeLens exists to help engineering leadership understand any repository in under 30 seconds.** 

It provides an AI-first engineering intelligence platform backed by an event-driven analytics engine. It replaces intuition with evidence, calculating deterministic metrics and using AI strictly to explain the *why* behind the numbers.

## 2. Target Audience
- **Primary:** Engineering Managers, CTOs, Tech Leads.
- **Secondary:** Open Source Maintainers.

## 3. The "Time to Insight" Metric
Our North Star Metric is **Time to Insight**: The elapsed time from a user pasting a repository URL to them saying, "I didn't know that about this codebase."

## 4. MVP Scope (v1.0)
*What we are building first to prove the core and the value.*

### 4.1 Included
- ✅ **Repository Dashboard:** High-level view of a single repository.
- ✅ **Repository Import (GitHub):** OAuth and background sync pipeline for PRs, Issues, and Commits.
- ✅ **Health Score:** Deterministic formula based on Velocity, Community, and Sustainability.
- ✅ **Repository Sustainability:** Metrics tracking Maintainer Concentration Risk and Knowledge Distribution.
- ✅ **Basic AI Summary:** Evidence-backed explanation of recent repository activity (GPT-4o-mini).
- ✅ **Contributor View:** Leaderboards and activity graphs.

### 4.2 Not Included (Non-Goals for v1.0)
- ❌ GitLab / Bitbucket Support
- ❌ Predictive Burnout (Removed due to privacy/HR risks)
- ❌ Advanced RAG Chatbot (Ask ForgeLens)
- ❌ Multi-language Support
- ❌ Enterprise SSO / SAML
- ❌ CI/CD Analytics (GitHub Actions, etc.)

## 5. Key User Journeys
1. **The Guest Onboarding:** User lands on the homepage, pastes `facebook/react`, and sees a cached dashboard in < 1 second.
2. **The Import Flow:** User signs in, connects GitHub, selects a private repository. The system imports raw events asynchronously while showing a live progress bar.
3. **The AI Explanation:** User sees the Health Score has dropped by 15 points. They hover over the score, and the AI explains: *"Merge time increased by 40% and 3 key maintainers have been inactive for 14 days."*

## 6. Success Metrics
- **Performance:** All cached dashboard reads execute in < 100ms.
- **Reliability:** 99.9% webhook ingestion success rate.
- **Engagement:** > 40% of users who import a repository return within 7 days.
