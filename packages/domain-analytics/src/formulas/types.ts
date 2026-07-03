export interface HealthData {
  commits: Array<{ sha: string; timestamp: Date; authorName: string }>;
  pullRequests: Array<{ id: number; createdAt: Date; updatedAt: Date; state: string; authorName: string; title: string }>;
}

export interface MetricResult {
  score: number;
  evidence: string[];
}

export interface Metric {
  id: string;
  weight: number;
  calculate(data: HealthData): MetricResult;
}
