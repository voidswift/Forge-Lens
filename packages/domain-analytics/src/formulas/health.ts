import { HealthData, Metric, MetricResult } from "./types";
import { activityMetric } from "./activity";
import { velocityMetric } from "./velocity";
import { maintenanceMetric } from "./maintenance";
import { communityMetric } from "./community";

export const ALGORITHM_VERSION = "v0.1";

export interface HealthScoreResult {
  overallScore: number;
  version: string;
  subScores: Record<string, MetricResult>;
}

const METRICS: Metric[] = [
  activityMetric,
  velocityMetric,
  maintenanceMetric,
  communityMetric
];

export function calculateHealthScore(data: HealthData): HealthScoreResult {
  let overallScore = 0;
  const subScores: Record<string, MetricResult> = {};

  // Ensure weights sum to 1.0 (or close to it)
  for (const metric of METRICS) {
    const result = metric.calculate(data);
    subScores[metric.id] = result;
    overallScore += (result.score * metric.weight);
  }

  return {
    overallScore: Math.round(overallScore),
    version: ALGORITHM_VERSION,
    subScores
  };
}
