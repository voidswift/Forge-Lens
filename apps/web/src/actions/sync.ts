"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { GitHubClient } from "@forgelens/github";
import { db, repositories } from "@forgelens/db";
import { revalidatePath } from "next/cache";

export async function syncRepositories() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Fetch the GitHub token from Clerk
  const client = await clerkClient();
  const response = await client.users.getUserOauthAccessToken(userId, "oauth_github");
  const tokens = response.data;
  
  if (!tokens || tokens.length === 0) {
    throw new Error("No GitHub account linked.");
  }

  const githubToken = tokens[0].token;

  // Initialize GitHub Client
  const githubClient = new GitHubClient(githubToken);

  try {
    const repos = await githubClient.getUserRepositories();

    // Insert or Update repositories in the database
    for (const repo of repos) {
      await db.insert(repositories).values({
        id: repo.githubId.toString(),
        userId: userId,
        githubId: repo.githubId,
        name: repo.name,
        fullName: repo.fullName,
        isPrivate: repo.isPrivate,
        syncStatus: "PENDING",
      }).onConflictDoUpdate({
        target: repositories.githubId,
        set: {
          name: repo.name,
          fullName: repo.fullName,
          isPrivate: repo.isPrivate,
          updatedAt: new Date(),
        }
      });
    }

    revalidatePath("/dashboard");
    return { success: true, count: repos.length };
  } catch (error: any) {
    console.error("Error syncing repositories:", error);
    return { success: false, error: error.message };
  }
}
