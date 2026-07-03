"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { inngest } from "@/inngest/client";
import { redirect } from "next/navigation";
import { GitHubClient } from "@forgelens/github";
import { db, repositories } from "@forgelens/db";
import { revalidatePath } from "next/cache";

export async function syncRepositories() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const client = await clerkClient();
  const tokens = await client.users.getUserOauthAccessToken(userId, "oauth_github");
  const githubToken = tokens.data[0]?.token;

  if (!githubToken) {
    throw new Error("No GitHub token found");
  }

  const octokit = new GitHubClient(githubToken);
  const repos = await octokit.listRepositories();

  for (const repo of repos) {
    // Upsert the repository record quickly
    await db.insert(repositories).values({
      id: repo.id.toString(),
      userId,
      fullName: repo.full_name,
      isPrivate: repo.private,
    }).onConflictDoNothing();

    // Enqueue the heavy lifting to the durable background worker
    await inngest.send({
      name: "repository/sync",
      data: {
        repositoryId: repo.id.toString(),
        fullName: repo.full_name,
        githubToken: githubToken
      }
    });
  }

  revalidatePath("/dashboard");
}
