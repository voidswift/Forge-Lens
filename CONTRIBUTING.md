# Contributing to ForgeLens

Thanks for being here! Whether you fix a typo or ship a feature, you're welcome. This guide is short on purpose.

## Our promise

**You will get a first maintainer response on your pull request within 72 hours.** We never auto-close PRs for inactivity. If you haven't heard from us in 72 hours, ping a maintainer in the PR or on Discord. That's on us, not you.

## Pick an issue

1. Browse issues labelled `good first issue` (starter ideas live in [docs/GOOD_FIRST_ISSUES.md](docs/GOOD_FIRST_ISSUES.md)).
2. Comment `.take` on an unassigned issue and you are assigned automatically.
3. Please hold at most 3 assigned issues at a time. If you can't continue, just say so and we'll free it up. Assigned issues quiet for 14 days get unassigned (never closed), so someone else can pick them up.
4. Want to do something bigger? Open an issue first so we can agree on the approach.

## Set up locally (about 10 minutes)

Follow "Quick start" in the [README](README.md). You need Node 20+, pnpm 9 and Docker.

## Run the checks locally

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run all four before pushing; they are the same steps CI runs.

## What CI checks, and why

| Check | Why |
| --- | --- |
| `pnpm lint` | Consistent code style and common bug patterns. |
| `pnpm typecheck` | TypeScript errors across every package, caught before runtime. |
| `pnpm test` | The scoring engine in `packages/domain-analytics` must stay correct. |
| `pnpm build` | The app has to compile. |
| DB migration check | If you touch `packages/db/src/schemas`, run `pnpm db:generate` and commit the new migration. |
| PR evidence (only for performance work) | PRs labelled `perf`, or touching `packages/github`, `apps/web/src/inngest` or `packages/db/src`, need before/after numbers. Use the template `.github/PULL_REQUEST_TEMPLATE/perf.md` (add `?template=perf.md` to the PR URL). UI and docs PRs skip this. |

Green means the code works; red means something real is wrong.

## Pull requests

- One issue or feature per PR. Link it with `Closes #123`.
- Use [Conventional Commits](https://www.conventionalcommits.org/) (`fix(web): ...`, `docs: ...`).
- Fill in the short template: What / Why / How tested / Screenshots.
- Never invent numbers (scores, benchmarks) in docs or UI. Scores come only from `packages/domain-analytics`, never from an LLM.

## Reporting bugs and requesting features

Search existing issues first. For bugs include steps to reproduce, expected vs. actual behavior, and your environment. For features, describe the problem before the solution.

## Community and conduct

Chat with maintainers on the project Discord. Be respectful, constructive and welcoming. Harassment, abuse and spam are not tolerated.

Thank you for helping make ForgeLens better!
