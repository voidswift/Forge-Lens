import { Metric, HealthData, MetricResult } from "./types";

export const communityMetric: Metric = {
  id: "community",
  weight: 0.20,
  calculate(data: HealthData): MetricResult {
    const uniqueContributors = new Set([
      ...data.commits.map(c => c.authorName),
      ...data.pullRequests.map(pr => pr.authorName)
    ]);

    let score = 0;
    const evidence: string[] = [];
    const count = uniqueContributors.size;

    if (count === 0) {
      return { score: 0, evidence: ["No community participation found."] };
    }

    if (count === 1) {
      score = 20;
      evidence.push("Solo maintainer project (1 contributor).");
    } else if (count <= 5) {
      score = 60;
      evidence.push(`Small community (${count} unique contributors).`);
    } else if (count <= 20) {
      score = 85;
      evidence.push(`Healthy community size (${count} unique contributors).`);
    } else {
      score = 100;
      evidence.push(`Thriving community (${count}+ contributors).`);
    }

    return { score, evidence };
  }
};
