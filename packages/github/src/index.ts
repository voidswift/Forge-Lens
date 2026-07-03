import { Octokit } from "octokit";

export class GitHubClient {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getUserRepositories() {
    // Note: To handle >100 repos, pagination should be implemented later.
    const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });
    
    return data.map((repo) => ({
      githubId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
  async getRepository(owner: string, repo: string) {
    try {
      const { data } = await this.octokit.rest.repos.get({ owner, repo });
      return data;
    } catch (e: any) {
      if (e.status === 404) return null;
      throw e;
    }
  }

  async getCommits(owner: string, repo: string, perPage = 100) {
    const { data } = await this.octokit.rest.repos.listCommits({ owner, repo, per_page: perPage });
    return data;
  }

  async getPullRequests(owner: string, repo: string, perPage = 100) {
    const { data } = await this.octokit.rest.pulls.list({ owner, repo, state: "all", per_page: perPage });
    return data;
  }
}
