// Shared ingestion core. Used by the Inngest worker (one step per chunk) and by
// the showcase seed script, so both paths behave identically.
import { db, commits, pullRequests, repositories, contributors, repositorySnapshots } from "@forgelens/db";
import type { GitHubClient } from "@forgelens/github";
import {
  calculateHealthScore,
  computeContributors,
  computeBusFactor,
  calculateResilienceScore,
} from "@forgelens/domain-analytics";
import { eq, sql } from "drizzle-orm";

export const PER_PAGE = 100;
/** Pages fetched per Inngest step, so retries resume instead of restarting. */
export const PAGES_PER_STEP = 10;

export function ingestLimits(env: NodeJS.ProcessEnv = process.env) {
  const months = Number(env.INGEST_MAX_MONTHS) > 0 ? Number(env.INGEST_MAX_MONTHS) : 12;
  const maxItems = Number(env.INGEST_MAX_ITEMS) > 0 ? Number(env.INGEST_MAX_ITEMS) : 5000;
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  return { months, maxItems, since };
}

export interface RepoRef {
  repositoryId: string;
  owner: string;
  name: string;
}

export interface ChunkResult {
  /** Next page to fetch, or null when this stream is finished. */
  nextPage: number | null;
  count: number;
}

export async function setStatus(repositoryId: string, syncStatus: string) {
  await db.update(repositories).set({ syncStatus }).where(eq(repositories.id, repositoryId));
}

export async function ingestCommitsChunk(
  client: GitHubClient,
  ref: RepoRef,
  startPage: number,
  limits = ingestLimits(),
): Promise<ChunkResult> {
  let count = 0;
  for (let page = startPage; page < startPage + PAGES_PER_STEP; page++) {
    const data = await client.getCommitsPage(ref.owner, ref.name, page, PER_PAGE, limits.since);
    if (data.length > 0) {
      const values = data.map((c) => ({
        id: c.sha,
        repositoryId: ref.repositoryId,
        message: c.commit.message,
        authorName: c.commit.author?.name || "Unknown",
        authorEmail: c.commit.author?.email || "",
        url: c.html_url,
        timestamp: new Date(c.commit.author?.date || new Date()),
      }));
      await db.insert(commits).values(values).onConflictDoNothing();
      count += data.length;
    }
    const reachedCap = page * PER_PAGE >= limits.maxItems;
    if (data.length < PER_PAGE || reachedCap) {
      return { nextPage: null, count };
    }
    await db
      .update(repositories)
      .set({ commitsCursor: String(page + 1) })
      .where(eq(repositories.id, ref.repositoryId));
  }
  return { nextPage: startPage + PAGES_PER_STEP, count };
}

export async function ingestPullRequestsChunk(
  client: GitHubClient,
  ref: RepoRef,
  startPage: number,
  limits = ingestLimits(),
): Promise<ChunkResult> {
  let count = 0;
  for (let page = startPage; page < startPage + PAGES_PER_STEP; page++) {
    const data = await client.getPullRequestsPage(ref.owner, ref.name, page, PER_PAGE);
    // Sorted newest-first by creation date, so the first old PR ends the stream.
    const recent = data.filter((pr) => new Date(pr.created_at) >= limits.since);
    if (recent.length > 0) {
      const values = recent.map((pr) => ({
        id: pr.id,
        repositoryId: ref.repositoryId,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        url: pr.html_url,
        authorName: pr.user?.login || "Unknown",
        createdAt: new Date(pr.created_at),
        updatedAt: new Date(pr.updated_at || pr.created_at),
      }));
      await db.insert(pullRequests).values(values).onConflictDoNothing();
      count += recent.length;
    }
    const reachedCap = page * PER_PAGE >= limits.maxItems;
    if (data.length < PER_PAGE || recent.length < data.length || reachedCap) {
      return { nextPage: null, count };
    }
    await db
      .update(repositories)
      .set({ prsCursor: String(page + 1) })
      .where(eq(repositories.id, ref.repositoryId));
  }
  return { nextPage: startPage + PAGES_PER_STEP, count };
}

/** Deterministic scoring from stored rows. Scores come only from domain-analytics. */
export async function computeAndPersist(repositoryId: string) {
  const commitData = await db.query.commits.findMany({ where: eq(commits.repositoryId, repositoryId) });
  const prData = await db.query.pullRequests.findMany({ where: eq(pullRequests.repositoryId, repositoryId) });

  const data = {
    commits: commitData.map((c) => ({ sha: c.id, timestamp: c.timestamp, authorName: c.authorName })),
    pullRequests: prData.map((pr) => ({
      id: pr.id,
      createdAt: pr.createdAt,
      updatedAt: pr.updatedAt,
      state: pr.state,
      authorName: pr.authorName,
      title: pr.title,
    })),
  };

  const profiles = computeContributors(data);
  const busFactor = computeBusFactor(profiles);
  const health = calculateHealthScore(data);
  const resilience = calculateResilienceScore(data, profiles, busFactor);

  if (profiles.length > 0) {
    const values = profiles.map((p) => ({
      id: `${repositoryId}-${p.name}`,
      repositoryId,
      name: p.name,
      role: p.role,
      score: p.score,
      trend: p.trend,
      expertise: p.expertise,
      lastActive: p.lastActive,
      algorithmVersion: health.version,
    }));
    await db
      .insert(contributors)
      .values(values)
      .onConflictDoUpdate({
        target: contributors.id,
        set: {
          role: sql`excluded.role`,
          score: sql`excluded.score`,
          trend: sql`excluded.trend`,
          expertise: sql`excluded.expertise`,
          lastActive: sql`excluded.last_active`,
          algorithmVersion: sql`excluded.algorithm_version`,
          updatedAt: new Date(),
        },
      });
  }

  const now = new Date();
  await db
    .update(repositories)
    .set({
      syncStatus: "Completed",
      lastSyncedAt: now,
      healthScore: health.overallScore,
      healthAlgorithmVersion: health.version,
      healthEvidence: health.subScores,
      busFactor,
      resilienceScore: resilience.overallScore,
      resilienceAlgorithmVersion: resilience.version,
      resilienceEvidence: resilience.subScores,
    })
    .where(eq(repositories.id, repositoryId));

  await db.insert(repositorySnapshots).values({
    id: `${repositoryId}-${now.getTime()}`,
    repositoryId,
    timestamp: now,
    healthScore: health.overallScore,
    resilienceScore: resilience.overallScore,
    busFactor,
  });

  return { healthScore: health.overallScore, resilienceScore: resilience.overallScore, busFactor };
}
