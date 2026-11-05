import { describe, it, expect } from "vitest";
import { healthTier } from "../tier";

describe("healthTier", () => {
  it.each([
    [100, "Excellent"],
    [80, "Excellent"],
    [79, "Good"],
    [60, "Good"],
    [59, "Warning"],
    [40, "Warning"],
    [39, "Critical"],
    [0, "Critical"],
  ])("score %i -> %s", (score, tier) => {
    expect(healthTier(score).tier).toBe(tier);
  });
});
