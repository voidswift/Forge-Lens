import { db, repositories, contributors } from "@forgelens/db";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";

export const SLUG_RE = /^[A-Za-z0-9._-]{1,100}$/;

export function isValidSlug(owner: string, repo: string) {
  return SLUG_RE.test(owner) && SLUG_RE.test(repo);
}

/** Latest computed analysis for a PUBLIC repository, or null if none exists. Never returns private repos. */
export async function getPublicRepository(owner: string, repo: string) {
  const fullName = `${owner}/${repo}`.toLowerCase();
  const [row] = await db
    .select()
    .from(repositories)
    .where(
      and(
        sql`lower(${repositories.fullName}) = ${fullName}`,
        eq(repositories.isPrivate, false),
        isNotNull(repositories.healthScore),
      ),
    )
    .orderBy(desc(repositories.lastSyncedAt))
    .limit(1);
  return row ?? null;
}

export async function getTopContributors(repositoryId: string, limit = 10) {
  return db
    .select()
    .from(contributors)
    .where(eq(contributors.repositoryId, repositoryId))
    .orderBy(desc(contributors.score))
    .limit(limit);
}
