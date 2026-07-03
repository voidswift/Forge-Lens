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
      isPrivate: repo.private,
    }));
  }
}
