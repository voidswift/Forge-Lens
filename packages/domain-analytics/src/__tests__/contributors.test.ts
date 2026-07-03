import { describe, it, expect } from "vitest";
import { computeContributors, computeBusFactor } from "../contributors";
import { HealthData } from "../formulas/types";

describe("Contributor Intelligence", () => {
  it("calculates roles and scores correctly", () => {
    const now = new Date();
    
    // User1: 20 commits (40 pts) + 5 PRs (25 pts) = 65 pts -> Core Maintainer
    const commitsUser1 = Array.from({ length: 20 }).map((_, i) => ({
      sha: `c${i}`,
      timestamp: now,
      authorName: "User1"
    }));
    const prsUser1 = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      createdAt: now,
      updatedAt: now,
      state: "closed",
      authorName: "User1",
      title: "PR"
    }));

    // User2: 2 commits (4 pts) + 1 PR (5 pts) = 9 pts -> Occasional Contributor
    const commitsUser2 = Array.from({ length: 2 }).map((_, i) => ({
      sha: `u2c${i}`,
      timestamp: now,
      authorName: "User2"
    }));
    const prsUser2 = [{
      id: 99,
      createdAt: now,
      updatedAt: now,
      state: "closed",
      authorName: "User2",
      title: "PR"
    }];

    const data: HealthData = {
      commits: [...commitsUser1, ...commitsUser2],
      pullRequests: [...prsUser1, ...prsUser2]
    };

    const profiles = computeContributors(data);
    expect(profiles.length).toBe(2);

    const u1 = profiles.find(p => p.name === "User1");
    expect(u1?.score).toBe(65);
    expect(u1?.role).toBe("Core Maintainer");
    expect(u1?.trend).toBe("Increasing");

    const u2 = profiles.find(p => p.name === "User2");
    expect(u2?.score).toBe(9);
    expect(u2?.role).toBe("Occasional Contributor");
  });

  it("calculates bus factor correctly", () => {
    const profiles = [
      { name: "A", score: 100, role: "", trend: "", expertise: "", lastActive: new Date() },
      { name: "B", score: 90, role: "", trend: "", expertise: "", lastActive: new Date() },
      { name: "C", score: 10, role: "", trend: "", expertise: "", lastActive: new Date() },
      { name: "D", score: 5, role: "", trend: "", expertise: "", lastActive: new Date() },
    ];

    // Total score = 205. 50% = 102.5.
    // A gives 100 (not >= 102.5). A+B gives 190 (>= 102.5). So Bus Factor = 2.
    const bf = computeBusFactor(profiles);
    expect(bf).toBe(2);
  });
});
