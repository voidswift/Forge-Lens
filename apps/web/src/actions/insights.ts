"use server";

import { auth } from "@clerk/nextjs/server";
import { db, commits, pullRequests, repositories } from "@forgelens/db";
import { eq, inArray, gte, and } from "drizzle-orm";
import { AnalyticsAI } from "@forgelens/ai";

export async function generateAiInsights() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get user's repo IDs
  const userRepos = await db
    .select({ id: repositories.id })
    .from(repositories)
    .where(eq(repositories.userId, userId));
  
  const repoIds = userRepos.map(r => r.id);

  if (repoIds.length === 0) {
    return "No repositories tracked to analyze.";
  }

  // Fetch last 14 days of activity
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const rawCommits = await db
    .select()
    .from(commits)
    .where(and(
      inArray(commits.repositoryId, repoIds),
      gte(commits.timestamp, fourteenDaysAgo)
    ))
    .limit(50);

  const rawPrs = await db
    .select()
    .from(pullRequests)
    .where(and(
      inArray(pullRequests.repositoryId, repoIds),
      gte(pullRequests.updatedAt, fourteenDaysAgo)
    ))
    .limit(20);

  const ai = new AnalyticsAI();
  
  const insights = await ai.generateSemanticReview(
    rawCommits.map(c => ({
      message: c.message,
      authorName: c.authorName,
      timestamp: c.timestamp,
    })),
    rawPrs.map(pr => ({
      title: pr.title,
      state: pr.state,
      authorName: pr.authorName,
    }))
  );

  return insights;
}
