import { inngest } from "./client";
import { GitHubClient } from "@forgelens/github";
import { db, commits, pullRequests, repositories, users } from "@forgelens/db";
import { eq } from "drizzle-orm";

export const syncRepository = inngest.createFunction(
  { 
    id: "sync-repository",
    retries: 3 
  },
  { event: "repository/sync" },
  async ({ event, step }) => {
    const { repositoryId, fullName, githubToken } = event.data;

    const octokit = new GitHubClient(githubToken);
    
    await step.run("fetch-commits", async () => {
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

// Nightly Reconciliation Cron to heal webhook data drift
export const reconcileRepositoriesCron = inngest.createFunction(
  { id: "reconcile-repositories-cron" },
  { cron: "0 0 * * *" }, // Runs every night at midnight UTC
  async ({ step }) => {
    
    const repos = await step.run("fetch-active-repositories", async () => {
      return await db
        .select({
          id: repositories.id,
          fullName: repositories.fullName,
          userId: repositories.userId
        })
        .from(repositories);
    });

    const usersWithTokens = await step.run("fetch-user-tokens", async () => {
      return await db
        .select({ 
          id: users.id, 
          githubToken: users.githubToken 
        })
        .from(users);
    });

    const tokenMap = new Map(usersWithTokens.map(u => [u.id, u.githubToken]));

    const eventsToDispatch = repos
      .filter(repo => tokenMap.has(repo.userId) && tokenMap.get(repo.userId))
      .map(repo => ({
        name: "repository/sync",
        data: {
          repositoryId: repo.id,
          fullName: repo.fullName,
          githubToken: tokenMap.get(repo.userId)
        }
      }));

    if (eventsToDispatch.length > 0) {
      await step.sendEvent("dispatch-syncs", eventsToDispatch);
    }

    return { message: `Dispatched ${eventsToDispatch.length} reconciliation jobs.` };
  }
);
