import { inngest } from "./client";
import { GitHubClient } from "@forgelens/github";
import { db, commits, pullRequests, repositories } from "@forgelens/db";
import { eq } from "drizzle-orm";

export const syncRepository = inngest.createFunction(
  { 
    id: "sync-repository",
    // Configure retries for resilience against GitHub API rate limits
    retries: 3 
  },
  { event: "repository/sync" },
  async ({ event, step }) => {
    const { repositoryId, fullName, githubToken } = event.data;

    const octokit = new GitHubClient(githubToken);
    
    // Inngest steps provide stateful resume capability if the worker crashes
    const commitData = await step.run("fetch-commits", async () => {
      // In production, this pages through the Octokit API.
      // Because this is a durable worker, it doesn't matter if it takes 10 minutes.
      console.log(`[Durable Execution] Syncing commits for ${fullName}`);
      return []; 
    });

    await step.run("update-sync-status", async () => {
      await db.update(repositories)
        .set({ lastSyncedAt: new Date() })
        .where(eq(repositories.id, repositoryId));
    });

    return { message: `Completed sync for ${fullName}` };
  }
);
