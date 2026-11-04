/**
 * Imports and fully computes the showcase repos using the server GITHUB_TOKEN.
 * Usage: pnpm seed:showcase   (needs DATABASE_URL and GITHUB_TOKEN; see .env.example)
 */
import { db, repositories } from "@forgelens/db";
import { GitHubClient } from "@forgelens/github";
import { eq } from "drizzle-orm";
import {
  computeAndPersist,
  ingestCommitsChunk,
  ingestLimits,
  ingestPullRequestsChunk,
  setStatus,
} from "../src/lib/ingest";
import { SHOWCASE_REPOS, SHOWCASE_USER_ID } from "../src/lib/showcase";

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required to seed showcase repos.");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const client = new GitHubClient(token);
  const limits = ingestLimits();
  console.log(`Ingest cap: ${limits.months} months / ${limits.maxItems} items per stream`);

  for (const fullName of SHOWCASE_REPOS) {
    const [owner, name] = fullName.split("/");
    console.log(`\n== ${fullName}`);
    const gh = await client.getRepository(owner, name);
    if (!gh) {
      console.warn("  not found, skipping");
      continue;
    }
    const repositoryId = gh.id.toString();
    const meta = {
      userId: SHOWCASE_USER_ID,
      githubId: gh.id,
      name: gh.name,
      fullName: gh.full_name,
      isPrivate: false,
      isShowcase: true,
      description: gh.description,
      language: gh.language,
      stars: gh.stargazers_count,
      forks: gh.forks_count,
      watchers: gh.watchers_count,
      license: gh.license?.name,
      syncStatus: "QUEUED",
    };
    await db.insert(repositories).values({ id: repositoryId, ...meta }).onConflictDoUpdate({
      target: repositories.id,
      set: { ...meta, updatedAt: new Date() },
    });

    const ref = { repositoryId, owner, name };
    try {
      await setStatus(repositoryId, "Fetching Commits");
      for (let page: number | null = 1; page !== null; ) {
        const r = await ingestCommitsChunk(client, ref, page, limits);
        console.log(`  commits +${r.count}`);
        page = r.nextPage;
      }
      await setStatus(repositoryId, "Fetching PRs");
      for (let page: number | null = 1; page !== null; ) {
        const r = await ingestPullRequestsChunk(client, ref, page, limits);
        console.log(`  prs +${r.count}`);
        page = r.nextPage;
      }
      await setStatus(repositoryId, "Calculating Health");
      const res = await computeAndPersist(repositoryId);
      console.log(`  health=${res.healthScore} resilience=${res.resilienceScore} busFactor=${res.busFactor}`);
    } catch (e) {
      console.error(`  failed: ${(e instanceof Error ? e.message : String(e)).slice(0, 300)}`);
      await db.update(repositories).set({ syncStatus: "FAILED" }).where(eq(repositories.id, repositoryId));
    }
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
