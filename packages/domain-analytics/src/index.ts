import { db, commits, pullRequests, repositories } from "@forgelens/db";
import { eq, count, and, inArray, gte } from "drizzle-orm";

export async function getDashboardMetrics(userId: string) {
  if (!userId) {
    throw new Error("Missing user ID context");
  }
  
  const [repoCountResult] = await db
    .select({ count: count() })
    .from(repositories)
    .where(eq(repositories.userId, userId));

  const totalRepos = repoCountResult.count;

  if (totalRepos === 0) {
    return {
      totalRepos: 0,
      totalCommits7d: 0,
      openPrs: 0,
      closedPrs: 0,
    };
  }

  const userRepos = await db
    .select({ id: repositories.id })
    .from(repositories)
    .where(eq(repositories.userId, userId));
  
  const repoIds = userRepos.map(r => r.id);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [commitsResult] = await db
    .select({ count: count() })
    .from(commits)
    .where(and(
      inArray(commits.repositoryId, repoIds),
      gte(commits.timestamp, sevenDaysAgo)
    ));

  const [openPrsResult] = await db
    .select({ count: count() })
    .from(pullRequests)
    .where(and(
      inArray(pullRequests.repositoryId, repoIds),
      eq(pullRequests.state, 'open')
    ));

  const [closedPrsResult] = await db
    .select({ count: count() })
    .from(pullRequests)
    .where(and(
      inArray(pullRequests.repositoryId, repoIds),
      eq(pullRequests.state, 'closed')
    ));

  return {
    totalRepos,
    totalCommits7d: commitsResult?.count || 0,
    openPrs: openPrsResult?.count || 0,
    closedPrs: closedPrsResult?.count || 0,
  };
}
