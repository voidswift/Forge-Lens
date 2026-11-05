"use server";

import { auth } from "@clerk/nextjs/server";
import { db, repositories, commits, pullRequests } from "@forgelens/db";
import { and, count, eq, gte } from "drizzle-orm";

export async function getDashboardAnalytics() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const owned = eq(repositories.userId, userId);

  const [[repoRow], [commitRow], [openRow], [closedRow]] = await Promise.all([
    db.select({ n: count() }).from(repositories).where(owned),
    db
      .select({ n: count() })
      .from(commits)
      .innerJoin(repositories, eq(commits.repositoryId, repositories.id))
      .where(and(owned, gte(commits.timestamp, since))),
    db
      .select({ n: count() })
      .from(pullRequests)
      .innerJoin(repositories, eq(pullRequests.repositoryId, repositories.id))
      .where(and(owned, eq(pullRequests.state, "open"))),
    db
      .select({ n: count() })
      .from(pullRequests)
      .innerJoin(repositories, eq(pullRequests.repositoryId, repositories.id))
      .where(and(owned, eq(pullRequests.state, "closed"))),
  ]);

  return {
    totalRepos: repoRow.n,
    totalCommits7d: commitRow.n,
    openPrs: openRow.n,
    closedPrs: closedRow.n,
  };
}
