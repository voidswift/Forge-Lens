import { Metric, HealthData, MetricResult } from "./types";

export const activityMetric: Metric = {
  id: "activity",
  weight: 0.30,
  calculate(data: HealthData): MetricResult {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCommits = data.commits.filter(c => c.timestamp >= thirtyDaysAgo).length;
    const recentPrs = data.pullRequests.filter(pr => pr.createdAt >= thirtyDaysAgo).length;

    // A simple deterministic formula for v0
    // E.g., 50 commits/month is considered excellent (score 100)
    let score = (recentCommits / 50) * 100;
    
    // Add bonus for PRs
    score += (recentPrs / 10) * 20;

    if (score > 100) score = 100;
    if (score < 0) score = 0;

    const evidence = [
      `${recentCommits} commits in the last 30 days.`,
      `${recentPrs} PRs opened in the last 30 days.`
    ];

    return { score: Math.round(score), evidence };
  }
};
