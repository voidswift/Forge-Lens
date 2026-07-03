import { HealthData } from "./formulas/types";

export interface ContributorProfile {
  name: string;
  score: number;
  role: string;
  trend: string;
  expertise: string;
  lastActive: Date;
}

export function computeContributors(data: HealthData): ContributorProfile[] {
  const map = new Map<string, { commits: Date[]; prs: Date[] }>();

  // Aggregate commits
  for (const c of data.commits) {
    if (!map.has(c.authorName)) map.set(c.authorName, { commits: [], prs: [] });
    map.get(c.authorName)!.commits.push(c.timestamp);
  }

  // Aggregate PRs
  for (const pr of data.pullRequests) {
    if (!map.has(pr.authorName)) map.set(pr.authorName, { commits: [], prs: [] });
    map.get(pr.authorName)!.prs.push(pr.createdAt);
  }

  const profiles: ContributorProfile[] = [];
  const now = new Date();

  for (const [name, stats] of map.entries()) {
    // Basic deterministic score
    const score = Math.min(100, Math.round((stats.commits.length * 2) + (stats.prs.length * 5)));
    
    let role = "Inactive";
    if (score >= 50) role = "Core Maintainer";
    else if (score >= 20) role = "Active Contributor";
    else if (score > 5) role = "Occasional Contributor";
    else role = "New Contributor";

    // Find last active
    const allDates = [...stats.commits, ...stats.prs].sort((a, b) => b.getTime() - a.getTime());
    const lastActive = allDates[0] || new Date();

    const daysSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 3600 * 24);
    if (daysSinceActive > 90) role = "Inactive";

    // Trend: Increasing if more than half of activity is in last 30 days
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentActivity = allDates.filter(d => d >= thirtyDaysAgo).length;
    
    let trend = "Stable";
    if (recentActivity === 0) trend = "Declining";
    else if (recentActivity > (allDates.length / 2)) trend = "Increasing";

    // Expertise (mock for now without file paths)
    const expertise = "Code";

    profiles.push({
      name,
      score,
      role,
      trend,
      expertise,
      lastActive
    });
  }

  return profiles.sort((a, b) => b.score - a.score);
}

export function computeBusFactor(profiles: ContributorProfile[]): number {
  if (profiles.length === 0) return 0;
  
  // How many top contributors make up 50% of the score?
  const totalScore = profiles.reduce((sum, p) => sum + p.score, 0);
  let accumulated = 0;
  let count = 0;

  for (const p of profiles) {
    accumulated += p.score;
    count++;
    if (accumulated >= totalScore * 0.5) break;
  }

  return count;
}
