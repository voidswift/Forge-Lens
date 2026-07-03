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
    const owner = fullName.split("/")[0];
    const repo = fullName.split("/")[1];

    const octokit = new GitHubClient(githubToken);
    
    // Status: Fetching Commits
    await step.run("status-fetching-commits", async () => {
      await db.update(repositories).set({ syncStatus: "Fetching Commits" }).where(eq(repositories.id, repositoryId));
    });

    const commitData = await step.run("fetch-commits", async () => {
      return await octokit.getCommits(owner, repo);
    });

    await step.run("normalize-commits", async () => {
      if (commitData.length === 0) return;
      const values = commitData.map(c => ({
        sha: c.sha,
        repositoryId,
        message: c.commit.message,
        authorName: c.commit.author?.name || "Unknown",
        timestamp: new Date(c.commit.author?.date || new Date())
      }));
      await db.insert(commits).values(values).onConflictDoNothing();
    });

    // Status: Fetching PRs
    await step.run("status-fetching-prs", async () => {
      await db.update(repositories).set({ syncStatus: "Fetching PRs" }).where(eq(repositories.id, repositoryId));
    });

    const prData = await step.run("fetch-prs", async () => {
      return await octokit.getPullRequests(owner, repo);
    });

    await step.run("normalize-prs", async () => {
      if (prData.length === 0) return;
      const values = prData.map(pr => ({
        id: pr.id,
        repositoryId,
        title: pr.title,
        state: pr.state,
        authorName: pr.user?.login || "Unknown",
        createdAt: new Date(pr.created_at),
        updatedAt: new Date(pr.updated_at || pr.created_at)
      }));
      await db.insert(pullRequests).values(values).onConflictDoNothing();
    });

    // Status: Completed
    await step.run("status-completed", async () => {
      await db.update(repositories)
        .set({ syncStatus: "Completed", lastSyncedAt: new Date() })
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
