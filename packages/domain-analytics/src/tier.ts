export type HealthTier = "Excellent" | "Good" | "Warning" | "Critical";

export interface TierInfo {
  tier: HealthTier;
  /** Hex colour used by badges and UI. */
  color: string;
}

/** Single source of truth for score tiers. Excellent >=80, Good >=60, Warning >=40, Critical <40. */
export function healthTier(score: number): TierInfo {
  if (score >= 80) return { tier: "Excellent", color: "#2da44e" };
  if (score >= 60) return { tier: "Good", color: "#0969da" };
  if (score >= 40) return { tier: "Warning", color: "#bf8700" };
  return { tier: "Critical", color: "#cf222e" };
}
