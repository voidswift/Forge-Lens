# Deploying ForgeLens

This is a checklist, not a script: nothing here has been run against a production account. Follow it top to bottom. Service dashboards change, so treat menu names as approximate.

Architecture reminder: Next.js app on Vercel → Postgres (Neon or Supabase) → Inngest Cloud calls back into `/api/inngest` to run sync jobs → Clerk handles sign-in with GitHub.

## 0. Prerequisites

- A GitHub account that owns (or can create) an OAuth app and a personal access token.
- Accounts on Vercel, Neon (or Supabase), Inngest and Clerk.
- Node 20+, pnpm 9 and this repo cloned locally (needed for migrations and the seed).

## 1. Managed Postgres (Neon or Supabase)

1. Create a project/database in a region close to your Vercel region.
2. Copy the **pooled** connection string if offered, otherwise the direct one. It must end in `?sslmode=require`.
3. This is your `DATABASE_URL`.

## 2. Generate secrets

```bash
# 32-character key that encrypts stored GitHub tokens. Keep it forever: changing it makes old tokens unreadable.
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"   # -> DB_ENCRYPTION_KEY
# Any random string for the GitHub webhook secret
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"   # -> GITHUB_WEBHOOK_SECRET
```

Create a GitHub **fine-grained personal access token** with read-only access to *public repositories*. This is `GITHUB_TOKEN`, used only for the showcase seed and as a fallback for public repos (never for private repos).

## 3. Clerk (production instance)

1. In Clerk, create a **Production** instance (separate from development) and attach your domain.
2. **Social connections → GitHub**: for production, Clerk requires your *own* GitHub OAuth app:
   - GitHub → Settings → Developer settings → OAuth Apps → New.
   - Homepage URL: your production URL. Callback URL: the one Clerk displays in its GitHub connection panel.
   - Paste the Client ID and Client Secret back into Clerk.
   - Add the scopes needed to read the repositories you want to import (at minimum `read:user`, `user:email`; add `repo` only if you intend to support private repositories).
3. **API Keys**: copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts `pk_live_`) and `CLERK_SECRET_KEY` (`sk_live_`).
4. **Webhooks** → add endpoint `https://<your-domain>/api/webhooks/clerk`, subscribe to `user.created` and `user.deleted` (the only events the handler acts on), and copy the signing secret to `CLERK_WEBHOOK_SECRET`.

## 4. Vercel (apps/web in a monorepo)

1. Import the GitHub repository.
2. **Root Directory**: `apps/web`. Turn on **"Include source files outside of the Root Directory in the Build Step"** (workspace packages live in `packages/*`).
3. **Framework Preset**: Next.js. Leave install/build commands default (Vercel detects pnpm from the lockfile and `packageManager`).
4. **Node.js version**: 20.x or newer.
5. Add environment variables (Production and Preview):

| Variable | Where it comes from |
| --- | --- |
| `DATABASE_URL` | Step 1 |
| `DB_ENCRYPTION_KEY` | Step 2 (required: the app refuses to run in production without it) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET` | Step 3 |
| `GITHUB_TOKEN`, `GITHUB_WEBHOOK_SECRET` | Step 2 |
| `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Step 5 |
| `INGEST_MAX_MONTHS`, `INGEST_MAX_ITEMS` | Optional (defaults 12 and 5000) |
| `NEXT_PUBLIC_APP_URL` | Your production URL, used in badge Markdown |
| `OPENAI_API_KEY` | Optional; enables the AI Insights page |

6. Deploy once so the URL exists. (The first deploy can succeed before migrations; pages that query the database will error until step 6 is done.)

## 5. Inngest Cloud

1. Create an app/environment in Inngest Cloud.
2. Copy the **Event Key** and **Signing Key** into Vercel (`INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`) and redeploy.
3. **Sync the app**: Apps → Sync new app → URL `https://<your-domain>/api/inngest`. (If Vercel Deployment Protection is on, allow Inngest through or use the Vercel integration.)
4. Confirm `sync-repository` and `reconcile-repositories-cron` appear as functions.

## 6. Migrations and showcase seed against production

Run from your machine, pointing at the production database. Do not commit these values.

```bash
# Apply migrations (baseline migration includes the is_showcase column)
DATABASE_URL='postgres://...prod...' pnpm db:migrate

# Pre-analyze the showcase repos (takes several minutes; uses GITHUB_TOKEN)
DATABASE_URL='postgres://...prod...' GITHUB_TOKEN='ghp_...' DB_ENCRYPTION_KEY='...' \
  pnpm --filter web exec tsx scripts/seed-showcase.mts
```

Note: `pnpm seed:showcase` reads `apps/web/.env.local`; the explicit form above lets you pass production values without a file. If a repo fails, the script marks it `FAILED` and moves on; re-run to retry.

If you previously used `drizzle-kit push` on this database, the baseline migration may conflict with existing tables. Use a fresh database, or reconcile manually. Never drop tables that hold data without a backup.

## 7. GitHub webhook (optional, keeps repos fresh)

For repos you want live updates for: Settings → Webhooks → payload URL `https://<your-domain>/api/webhooks/github`, content type `application/json`, secret = `GITHUB_WEBHOOK_SECRET`, events: Pushes and Pull requests. The nightly Inngest cron also reconciles drift.

## 8. Post-deploy smoke test

- [ ] Landing page `/` loads, shows the search box and the showcase list.
- [ ] While **logged out** (private window), open a showcase repo from the landing page: the full report renders with evidence lines and contributors.
- [ ] `/r/<owner>/<not-analyzed-repo>` shows "Not analyzed yet" with a sign-in button.
- [ ] `/api/badge/<owner>/<repo>` returns an SVG (check `Content-Type: image/svg+xml` and `Cache-Control`); an unknown repo shows `not analyzed`.
- [ ] Sign-in with GitHub works and lands on `/dashboard`.
- [ ] Import a **small** public repo from the dashboard; in Inngest Cloud the `sync-repository` run completes and the repo reaches status "Completed".
- [ ] In Inngest, open that run's event: the payload contains only `repositoryId`, `fullName`, `userId` (no token).
- [ ] With `OPENAI_API_KEY` unset, the "AI Insights" nav item is absent.

## Rollback

Vercel: promote the previous deployment. Database: restore from your provider's point-in-time backup; migrations are additive-only so far.
