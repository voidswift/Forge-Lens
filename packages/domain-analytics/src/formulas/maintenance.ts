import { Metric, HealthData, MetricResult } from "./types";

export const maintenanceMetric: Metric = {
  id: "maintenance",
  weight: 0.20,
  calculate(data: HealthData): MetricResult {
    if (data.commits.length === 0) {
      return { score: 0, evidence: ["No commits found."] };
    }

    // Find the most recent commit
    const latestCommit = data.commits.reduce((latest, current) => 
      current.timestamp > latest.timestamp ? current : latest
    , data.commits[0]);

    const daysSinceLastCommit = Math.floor((new Date().getTime() - latestCommit.timestamp.getTime()) / (1000 * 3600 * 24));
    
    let score = 100;
    const evidence: string[] = [];

    if (daysSinceLastCommit <= 7) {
      evidence.push("Active maintenance (commit within the last week).");
    } else if (daysSinceLastCommit <= 30) {
      score -= 20;
      evidence.push(`Maintained recently (${daysSinceLastCommit} days since last commit).`);
    } else if (daysSinceLastCommit <= 90) {
      score -= 50;
      evidence.push(`Warning: Slow maintenance (${daysSinceLastCommit} days since last commit).`);
    } else {
      score = 0;
      evidence.push(`Critical: Appears abandoned (${daysSinceLastCommit} days since last commit).`);
    }

    if (score > 100) score = 100;
    if (score < 0) score = 0;

    return { score, evidence };
  }
};
