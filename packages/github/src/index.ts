import { Octokit } from "octokit";
import { throttling } from "@octokit/plugin-throttling";

const MyOctokit = Octokit.plugin(throttling);

export class GitHubClient {
  private octokit: InstanceType<typeof MyOctokit>;

  constructor(token: string) {
    this.octokit = new MyOctokit({
      auth: token,
      throttle: {
        onRateLimit: (retryAfter, options: any, octokit, retryCount) => {
          octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
          if (retryCount < 3) {
            octokit.log.info(`Retrying after ${retryAfter} seconds!`);
            return true;
          }
        },
        onSecondaryRateLimit: (retryAfter, options: any, octokit) => {
          octokit.log.warn(`SecondaryRateLimit detected for request ${options.method} ${options.url}`);
          return true; // Let it automatically retry with backoff
        },
      },
    });
  }

  async getRepository(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.rest.repos.get({ owner, repo });
      return data;
    } catch (e: any) {
      if (e.status === 404) return null;
      throw e;
    }
  }

  /**
   * Async generator that yields commits page by page.
   * Prevents loading 1M commits into memory at once.
   */
  async *getCommitsStream(owner: string, repo: string, perPage = 100) {
    const iterator = this.octokit.paginate.iterator(this.octokit.rest.repos.listCommits, {
      owner,
      repo,
      per_page: perPage,
    });

    for await (const response of iterator) {
      yield response.data;
    }
  }

  /**
   * Async generator that yields PRs page by page.
   */
  async *getPullRequestsStream(owner: string, repo: string, perPage = 100) {
    const iterator = this.octokit.paginate.iterator(this.octokit.rest.pulls.list, {
      owner,
      repo,
      state: "all",
      per_page: perPage,
    });

    for await (const response of iterator) {
      yield response.data;
    }
  }
}
