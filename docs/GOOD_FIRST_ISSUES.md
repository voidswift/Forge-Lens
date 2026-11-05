# Good First Issues

Ten well-scoped issues you can paste into GitHub (label them `good first issue`). None needs secrets or a paid service. Sizes: **S** ≈ under 2 hours, **M** ≈ half a day.

Run the checks before any PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

---

## 1. Tests: health score with zero commits and zero PRs
**Why:** Empty repositories are a real input (brand-new imports) and must never produce `NaN`.
**Files:** `packages/domain-analytics/src/formulas/__tests__/health.test.ts`, `packages/domain-analytics/src/formulas/health.ts`
**Acceptance criteria:**
- A test passes `{ commits: [], pullRequests: [] }` to `calculateHealthScore` and asserts every score is a finite number between 0 and 100.
- If a bug is found, fix it in the same PR.
**Size:** S

## 2. Tests: bus factor edge cases
**Why:** Bus factor drives the headline risk label; single-author and tie situations should be pinned down.
**Files:** `packages/domain-analytics/src/__tests__/contributors.test.ts`, `packages/domain-analytics/src/contributors.ts`
**Acceptance criteria:**
- Tests for: one contributor, two equal contributors, many contributors with one dominant author, empty profile list.
- Each test documents the expected value in a comment explaining *why*.
**Size:** S

## 3. Tests: resilience score is deterministic
**Why:** The core promise is "same input, same score".
**Files:** `packages/domain-analytics/src/__tests__/resilience.test.ts`
**Acceptance criteria:**
- A test runs `calculateResilienceScore` twice on identical input (with a fixed `now`, or by freezing time with `vi.useFakeTimers`) and asserts deep equality of the results.
- A test confirms scores stay within 0-100 for extreme inputs (e.g. 10,000 commits by one author).
**Size:** M

## 4. UI: dark-mode-safe text on the public report
**Why:** On dark-mode browsers the "Last analyzed" line and page background look inconsistent with the white cards.
**Files:** `apps/web/src/app/r/[owner]/[repo]/page.tsx`, `apps/web/src/app/globals.css`
**Acceptance criteria:**
- Report page is readable in both light and dark OS themes (attach before/after screenshots).
- No new dependencies.
**Size:** S

## 5. UI: tier label next to the health score
**Why:** `healthTier()` already maps scores to Excellent/Good/Warning/Critical but the report only shows a number.
**Files:** `apps/web/src/components/report.tsx` (use `healthTier` from `@forgelens/domain-analytics`)
**Acceptance criteria:**
- The Health card shows the tier name in the tier colour.
- Works on both the dashboard and the public report (the component is shared).
- Screenshot included.
**Size:** S

## 6. Public report: shareable Open Graph metadata
**Why:** Links to reports look better in chats and social posts with a proper title and description.
**Files:** `apps/web/src/app/r/[owner]/[repo]/page.tsx` (`generateMetadata`)
**Acceptance criteria:**
- `generateMetadata` sets `openGraph.title` and `description` to include the repo name and, when analyzed, the health score from the database. Never show a score for an unanalyzed repo.
- Verified by viewing page source.
**Size:** M

## 7. Public report: "last analyzed" tooltip and empty states
**Why:** Visitors should know how fresh the numbers are, and what the window is.
**Files:** `apps/web/src/app/r/[owner]/[repo]/page.tsx`, `apps/web/src/components/report.tsx`
**Acceptance criteria:**
- Show the analysis window using `INGEST_MAX_MONTHS` (default 12) in the footer text, e.g. "based on the last 12 months".
- Contributors section has a friendly empty state (already partially there; add a test-less manual check and screenshot).
**Size:** S

## 8. Docs: add a real screenshot to the README
**Why:** The README has a commented-out image slot at `docs/assets/report.png`.
**Files:** `README.md`, `docs/assets/report.png`
**Acceptance criteria:**
- Run the app locally, analyze a public repo, capture the report page at about 1200px wide (under 300 KB).
- Uncomment the image tag in the README. No secrets visible in the screenshot.
**Size:** S

## 9. Docs: troubleshooting section in CONTRIBUTING
**Why:** The most common setup failures (port 5432 busy, missing `.env.local`, Docker not running) should be one search away.
**Files:** `CONTRIBUTING.md`
**Acceptance criteria:**
- A "Troubleshooting" section with at least five problems and fixes, each of which you actually reproduced.
- Mention `POSTGRES_PORT` and `pnpm run setup` vs `pnpm setup`.
**Size:** S

## 10. Small feature: validate and normalize the landing-page input
**Why:** `RepoSearch` accepts `owner/repo` and GitHub URLs; extra cases like `github.com/owner/repo/tree/main` or surrounding whitespace should work too.
**Files:** `apps/web/src/components/repo-search.tsx`
**Acceptance criteria:**
- Extract `parseRepoInput` into `apps/web/src/lib/parse-repo.ts` (pure function) and handle `github.com/owner/repo/tree/...`, `/issues`, and a trailing `.git`.
- Add Vitest tests (adding `vitest` to `apps/web` devDependencies using the version already used in `packages/domain-analytics`, plus a `test` script) covering at least eight inputs, valid and invalid.
**Size:** M
