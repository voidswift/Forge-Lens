"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db, repositories } from "@forgelens/db";
import { eq, and } from "drizzle-orm";
import { GitHubClient } from "@forgelens/github";
import { inngest } from "@/inngest/client";
import { revalidatePath } from "next/cache";

export async function importRepository(prevState: any, formData: FormData) {
  const repoName = formData.get("repository")?.toString().trim();
  
  if (!repoName) {
    return { error: "Repository name is required." };
  }

  if (!repoName.includes("/") || repoName.split("/").length !== 2) {
    return { error: "Invalid format. Use owner/repo (e.g., facebook/react)." };
  }

  const { userId } = await auth();
  if (!userId) {
    return { error: "Unauthorized." };
  }

  const client = await clerkClient();
  const tokens = await client.users.getUserOauthAccessToken(userId, "oauth_github");
  const githubToken = tokens.data[0]?.token;

  if (!githubToken) {
    return { error: "Please connect your GitHub account." };
  }

  const existing = await db.select()
    .from(repositories)
    .where(and(eq(repositories.userId, userId), eq(repositories.fullName, repoName)))
    .limit(1);

  if (existing.length > 0) {
    return { error: "Repository already imported." };
  }

  try {
    const owner = repoName.split("/")[0];
    const name = repoName.split("/")[1];
    
    const octokit = new GitHubClient(githubToken);
    const githubRepo = await octokit.getRepository(owner, name);

    if (!githubRepo) {
      return { error: "Repository not found or access denied." };
    }

    const repoId = githubRepo.id.toString();

    await db.insert(repositories).values({
      id: repoId,
      userId,
      githubId: githubRepo.id,
      name: githubRepo.name,
      fullName: githubRepo.full_name,
      isPrivate: githubRepo.private,
      syncStatus: "QUEUED",
    }).onConflictDoNothing();

    await inngest.send({
      name: "repository/sync",
      data: {
        repositoryId: repoId,
        fullName: githubRepo.full_name,
        githubToken,
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Import error:", error);
    return { error: error.message || "Failed to import repository." };
  }
}
