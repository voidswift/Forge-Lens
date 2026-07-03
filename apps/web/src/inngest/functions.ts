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

    const client = new GitHubClient(githubToken);
    
    // Status: Fetching Commits
    await step.run("status-fetching-commits", async () => {
      await db.update(repositories).set({ syncStatus: "Fetching Commits" }).where(eq(repositories.id, repositoryId));
    });

    // Stream Commits
    await step.run("fetch-and-store-commits", async () => {
      let count = 0;
      for await (const page of client.getCommitsStream(owner, repo)) {
        if (page.length === 0) continue;
        
        const values = page.map((c: any) => ({
          id: c.sha,
          repositoryId,
          message: c.commit.message,
          authorName: c.commit.author?.name || "Unknown",
          url: c.html_url,
          timestamp: new Date(c.commit.author?.date || new Date()),
        }));
        await db.insert(commits).values(values).onConflictDoNothing();
        
        count += page.length;
        // Optionally update cursor in db if we needed checkpointing mid-stream
      }
      return count;
    });

    // Status: Fetching PRs
    await step.run("status-fetching-prs", async () => {
      await db.update(repositories).set({ syncStatus: "Fetching PRs" }).where(eq(repositories.id, repositoryId));
    });

    // Stream Pull Requests
    await step.run("fetch-and-store-prs", async () => {
      let count = 0;
      for await (const page of client.getPullRequestsStream(owner, repo)) {
        if (page.length === 0) continue;

        const values = page.map((pr: any) => ({
          id: pr.id.toString(),
          repositoryId,
          number: pr.number,
          title: pr.title,
          state: pr.state,
          url: pr.html_url,
          authorName: pr.user?.login || "Unknown",
          createdAt: new Date(pr.created_at),
          updatedAt: new Date(pr.updated_at || pr.created_at),
        }));
        await db.insert(pullRequests).values(values).onConflictDoNothing();
        count += page.length;
      }
      return count;
    });

    // Status: Calculating Health
    await step.run("status-calculating-health", async () => {
      await db.update(repositories).set({ syncStatus: "Calculating Health" }).where(eq(repositories.id, repositoryId));
    });

    // Analytics computation step
    // (Note: For large repos, loading all from DB could still be heavy. 
    // True CQRS projections should be done via SQL aggregates, but for now we query DB instead of memory)
    const healthResult = await step.run("calculate-health", async () => {
      // In a real V8 safe environment, this would be a chunked SQL stream.
      const commitData = await db.query.commits.findMany({ where: eq(commits.repositoryId, repositoryId) });
      const prData = await db.query.pullRequests.findMany({ where: eq(pullRequests.repositoryId, repositoryId) });
      
      const data = {
        commits: commitData.map(c => ({
          sha: c.id,
          timestamp: c.timestamp,
          authorName: c.authorName
        })),
        pullRequests: prData.map(pr => ({
          id: parseInt(pr.id),
          createdAt: pr.createdAt,
          updatedAt: pr.updatedAt,
          state: pr.state,
          authorName: pr.authorName,
          title: pr.title
        }))
      };
      
      const { calculateHealthScore, computeContributors, computeBusFactor, calculateResilienceScore } = await import("@forgelens/domain-analytics");
      
      const profiles = computeContributors(data);
      const busFactor = computeBusFactor(profiles);
      const health = calculateHealthScore(data);
      const resilience = calculateResilienceScore(data, profiles, busFactor);
      
      return { health, profiles, busFactor, resilience };
    });

    await step.run("save-contributors", async () => {
      const { contributors } = await import("@forgelens/db");
      if (healthResult.profiles.length > 0) {
        const values = healthResult.profiles.map(p => ({
          id: `${repositoryId}-${p.name}`,
          repositoryId,
          name: p.name,
          role: p.role,
          score: p.score,
          trend: p.trend,
          expertise: p.expertise,
          lastActive: p.lastActive,
          algorithmVersion: healthResult.health.version,
        }));
        await db.insert(contributors).values(values).onConflictDoNothing();
      }
    });

    // Status: Completed
    await step.run("status-completed", async () => {
      const { repositorySnapshots } = await import("@forgelens/db");
      const now = new Date();

      await db.update(repositories)
        .set({ 
          syncStatus: "Completed", 
          lastSyncedAt: now,
          healthScore: healthResult.health.overallScore,
          healthAlgorithmVersion: healthResult.health.version,
          healthEvidence: healthResult.health.subScores,
          busFactor: healthResult.busFactor,
          resilienceScore: healthResult.resilience.overallScore,
          resilienceAlgorithmVersion: healthResult.resilience.version,
          resilienceEvidence: healthResult.resilience.subScores
        })
        .where(eq(repositories.id, repositoryId));

      await db.insert(repositorySnapshots).values({
        id: `${repositoryId}-${now.getTime()}`,
        repositoryId,
        timestamp: now,
        healthScore: healthResult.health.overallScore,
        resilienceScore: healthResult.resilience.overallScore,
        busFactor: healthResult.busFactor,
      });
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
