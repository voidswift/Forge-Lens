<p align="center">
  <img src="docs/assets/logo.png" width="160" alt="ForgeLens logo" />
</p>

<h1 align="center">ForgeLens</h1>

<p align="center">
  <strong>See any repo's health, bus factor and maintainer risk in under a minute.</strong>
</p>

<p align="center">
  <a href="https://github.com/voidswift/Forge-Lens/actions/workflows/ci.yml"><img src="https://github.com/voidswift/Forge-Lens/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>

<!-- Add a screenshot or GIF at docs/assets/report.png and uncomment:
<p align="center"><img src="docs/assets/report.png" alt="ForgeLens report" width="800" /></p>
-->

## Try it live

**Live demo:** _add the deployed URL here after the first deploy (see [docs/DEPLOY.md](docs/DEPLOY.md))._

No sign-up needed: paste `owner/repo` on the landing page, or open one of the pre-analyzed showcase repos. Every public report lives at `/r/<owner>/<repo>`.

## What the scores mean

All scores are **deterministic** (no LLM involved) and computed from recent commit and pull request history (default window: the last 12 months, capped at 5,000 items per stream). Every score comes with human-readable evidence lines explaining *why*.

| Score | What it tells you |
| --- | --- |
| **Health** (0-100) | Activity, velocity, maintenance and community signals. |
| **Resilience** (0-100) | How well the project survives people leaving: knowledge spread, review coverage, freshness. |
| **Bus factor** | How few contributors carry most of the work. Lower is riskier. |

Tiers used by badges: **Excellent** 80+, **Good** 60+, **Warning** 40+, **Critical** below 40.

### Add a badge to your README

Open your repo's report page and copy the Markdown from the "Add this badge" box. It looks like:

```md
[![ForgeLens](https://YOUR-HOST/api/badge/OWNER/REPO)](https://YOUR-HOST/r/OWNER/REPO)
```

A repo that has not been analyzed shows `not analyzed`, never a made-up number.

## Quick start (about 10 minutes)

Requirements: Node 20+, pnpm 9, Docker.

```bash
git clone https://github.com/voidswift/Forge-Lens.git
cd Forge-Lens

# 1. Configure environment
cp apps/web/.env.example apps/web/.env.local
#    Fill in at least: Clerk keys (dashboard.clerk.com) and GITHUB_TOKEN.
#    Generate DB_ENCRYPTION_KEY:
#      node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# 2. Install, start Postgres 15, apply migrations
pnpm run setup

# 3. (Optional) pre-analyze the showcase repos (needs GITHUB_TOKEN)
pnpm seed:showcase

# 4. Run the app and the Inngest dev server (two terminals)
pnpm dev
npx inngest-cli dev -u http://localhost:3000/api/inngest
```

Notes:

- Use `pnpm run setup`, not `pnpm setup` (the latter is a built-in pnpm command).
- Port 5432 busy? `POSTGRES_PORT=5433 docker compose up -d` and change the port in `DATABASE_URL`.
- Without `OPENAI_API_KEY` the optional AI Insights page is simply hidden.

## Checks

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

CI runs exactly these on every pull request.

## Project layout

| Path | Purpose |
| --- | --- |
| `apps/web` | Next.js App Router app, Clerk auth, Inngest workers |
| `packages/db` | Drizzle schema and migrations (Postgres) |
| `packages/domain-analytics` | Pure TypeScript scoring, fully unit-tested |
| `packages/github` | Octokit client with throttling |
| `packages/ai` | Optional semantic review (not part of any score) |

Deep dive: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Deploying: [docs/DEPLOY.md](docs/DEPLOY.md).

## Contributing

Friendly first PRs are very welcome. Browse issues labelled `good first issue`, comment `.take` to claim one, and read [CONTRIBUTING.md](CONTRIBUTING.md). We promise a first maintainer response within 72 hours. Starter ideas: [docs/GOOD_FIRST_ISSUES.md](docs/GOOD_FIRST_ISSUES.md).

## License

MIT, as declared by this project. Note: a `LICENSE` file still needs to be added to the repository root.
