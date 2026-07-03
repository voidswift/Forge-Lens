import { describe, it, expect } from "vitest";
import { calculateResilienceScore } from "../resilience";
import { HealthData } from "../formulas/types";
import { ContributorProfile } from "../contributors";

describe("Resilience Engine", () => {
  it("computes a high resilience score for a healthy project", () => {
    const data: HealthData = {
      commits: [],
      pullRequests: Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        createdAt: new Date(),
        updatedAt: new Date(),
        state: "closed",
        authorName: "User1",
        title: "PR"
      }))
    };

    const profiles: ContributorProfile[] = [
      { name: "A", score: 100, role: "Core Maintainer", trend: "Increasing", expertise: "Code", lastActive: new Date() },
      { name: "B", score: 90, role: "Core Maintainer", trend: "Increasing", expertise: "Code", lastActive: new Date() },
      { name: "C", score: 80, role: "Active Contributor", trend: "Stable", expertise: "Code", lastActive: new Date() },
      { name: "D", score: 80, role: "Active Contributor", trend: "Stable", expertise: "Code", lastActive: new Date() },
      { name: "E", score: 80, role: "Active Contributor", trend: "Stable", expertise: "Code", lastActive: new Date() },
    ];

    const busFactor = 5;

    const result = calculateResilienceScore(data, profiles, busFactor);
    expect(result.overallScore).toBeGreaterThan(80);
    expect(result.subScores.busFactor.score).toBe(100);
    expect(result.subScores.freshness.score).toBe(100);
    expect(result.subScores.reviewCoverage.score).toBe(80);
    expect(result.subScores.knowledge.score).toBe(90);
  });

  it("penalizes a project with a single point of failure", () => {
    const data: HealthData = { commits: [], pullRequests: [] };
    const profiles: ContributorProfile[] = [
      { name: "A", score: 100, role: "Core Maintainer", trend: "Stable", expertise: "Code", lastActive: new Date() }
    ];
    const busFactor = 1;

    const result = calculateResilienceScore(data, profiles, busFactor);
    expect(result.subScores.busFactor.score).toBe(10);
    expect(result.subScores.reviewCoverage.score).toBe(30);
    expect(result.overallScore).toBeLessThan(60);
  });
});
