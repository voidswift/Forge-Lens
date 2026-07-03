import { describe, it, expect } from "vitest";
import { calculateHealthScore } from "../health";
import { HealthData } from "../types";

describe("Health Engine v0", () => {
  it("scores 0 for an empty repository", () => {
    const emptyData: HealthData = {
      commits: [],
      pullRequests: []
    };

    const result = calculateHealthScore(emptyData);
    expect(result.overallScore).toBe(0);
    expect(result.subScores.activity.score).toBe(0);
    expect(result.subScores.velocity.score).toBe(0);
    expect(result.subScores.maintenance.score).toBe(0);
    expect(result.subScores.community.score).toBe(0);
  });

  it("calculates a high score for an active repository", () => {
    const now = new Date();
    
    // Simulate 50 commits from 5 different people
    const commits = Array.from({ length: 50 }).map((_, i) => ({
      sha: `sha${i}`,
      timestamp: now,
      authorName: `User${i % 5}`
    }));

    // Simulate 10 merged PRs
    const pullRequests = Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      createdAt: now,
      updatedAt: now,
      state: "closed",
      authorName: `User${i % 5}`,
      title: `PR ${i}`
    }));

    const data: HealthData = { commits, pullRequests };
    const result = calculateHealthScore(data);
    
    expect(result.subScores.activity.score).toBeGreaterThan(80);
    expect(result.subScores.maintenance.score).toBe(100);
    expect(result.subScores.community.score).toBeGreaterThan(50);
    expect(result.overallScore).toBeGreaterThan(70);
  });

  it("penalizes a huge backlog", () => {
    const now = new Date();
    
    // Simulate 1 commit so maintenance isn't 0
    const commits = [{
      sha: "sha1",
      timestamp: now,
      authorName: "User1"
    }];

    // Simulate 30 open PRs, 0 closed
    const pullRequests = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      createdAt: now,
      updatedAt: now,
      state: "open",
      authorName: `User${i % 2}`,
      title: `PR ${i}`
    }));

    const data: HealthData = { commits, pullRequests };
    const result = calculateHealthScore(data);
    
    expect(result.subScores.velocity.score).toBeLessThan(40);
  });
});
