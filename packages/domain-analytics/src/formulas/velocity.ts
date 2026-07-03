import { Metric, HealthData, MetricResult } from "./types";

export const velocityMetric: Metric = {
  id: "velocity",
  weight: 0.30,
  calculate(data: HealthData): MetricResult {
    const closedPrs = data.pullRequests.filter(pr => pr.state === "closed");
    
    let score = 50; // Base score
    const evidence: string[] = [];

    if (data.pullRequests.length === 0) {
      return { score: 0, evidence: ["No pull requests found to measure velocity."] };
    }

    const mergeRate = closedPrs.length / data.pullRequests.length;
    score += (mergeRate * 50); // Up to 50 points for high close/merge rate
    evidence.push(`PR close rate is ${Math.round(mergeRate * 100)}%.`);

    // Penalize large open backlog
    const openPrs = data.pullRequests.length - closedPrs.length;
    if (openPrs > 20) {
      score -= 20;
      evidence.push(`High open backlog (${openPrs} open PRs).`);
    } else {
      evidence.push(`Healthy backlog size (${openPrs} open PRs).`);
    }

    if (score > 100) score = 100;
    if (score < 0) score = 0;

    return { score: Math.round(score), evidence };
  }
};
