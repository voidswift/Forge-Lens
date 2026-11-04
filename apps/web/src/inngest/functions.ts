import { inngest } from "./client";
import { GitHubClient } from "@forgelens/github";
import { db, repositories } from "@forgelens/db";
import { eq } from "drizzle-orm";
import { resolveGithubToken } from "./github-token";
import {
  ingestCommitsChunk,
  ingestPullRequestsChunk,
  computeAndPersist,
  setStatus,
  type RepoRef,
} from "../lib/ingest";
import { SHOWCASE_USER_ID } from "../lib/showcase";

export const syncRepository = inngest.createFunction(
  {
    id: "sync-repository",
    concurrency: { limit: 10 },
    retries: 3,
    triggers: [{ event: "repository/sync" }],
  },
  async ({ event, step }) => {
    const { repositoryId, fullName, userId } = event.data as {
      repositoryId: string;
      fullName: string;
      userId: string;
    };
    const [owner, name] = fullName.split("/");
    const ref: RepoRef = { repositoryId, owner, name };

    // The client (and token) is created inside each step and never returned
    // from step.run, so the token is never persisted in step output.
    const makeClient = async () => {
      const [row] = await db
        .select({ isPrivate: repositories.isPrivate })
        .from(repositories)
        .where(eq(repositories.id, repositoryId))
        .limit(1);
      const isPrivate = userId === SHOWCASE_USER_ID ? false : (row?.isPrivate ?? true);
      return new GitHubClient(await resolveGithubToken(userId, isPrivate));
    };

    await step.run("status-fetching-commits", () => setStatus(repositoryId, "Fetching Commits"));

    // One step per chunk of pages: a retry resumes from the failed chunk.
    let page: number | null = 1;
    while (page !== null) {
      const startPage: number = page;
      const res = await step.run(`commits-from-page-${startPage}`, async () =>
        ingestCommitsChunk(await makeClient(), ref, startPage),
      );
      page = res.nextPage;
    }

    await step.run("status-fetching-prs", () => setStatus(repositoryId, "Fetching PRs"));

    page = 1;
    while (page !== null) {
      const startPage: number = page;
      const res = await step.run(`prs-from-page-${startPage}`, async () =>
        ingestPullRequestsChunk(await makeClient(), ref, startPage),
      );
      page = res.nextPage;
    }

    await step.run("status-calculating-health", () => setStatus(repositoryId, "Calculating Health"));
    await step.run("calculate-and-store", () => computeAndPersist(repositoryId));

    return { message: `Completed sync for ${fullName}` };
  },
);

// Nightly Reconciliation Cron to heal webhook data drift
export const reconcileRepositoriesCron = inngest.createFunction(
  {
    id: "reconcile-repositories-cron",
    triggers: [{ cron: "0 0 * * *" }], // Runs every night at midnight UTC
  },
  async ({ step }) => {
    const repos = await step.run("fetch-active-repositories", async () => {
      return await db
        .select({ id: repositories.id, fullName: repositories.fullName, userId: repositories.userId })
        .from(repositories);
    });

    const eventsToDispatch = repos.map((repo) => ({
      name: "repository/sync",
      data: { repositoryId: repo.id, fullName: repo.fullName, userId: repo.userId },
    }));

    if (eventsToDispatch.length > 0) {
      await step.sendEvent("dispatch-syncs", eventsToDispatch);
    }

    return { message: `Dispatched ${eventsToDispatch.length} reconciliation jobs.` };
  },
);
