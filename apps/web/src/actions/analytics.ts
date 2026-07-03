"use server";

import { auth } from "@clerk/nextjs/server";
import { getDashboardMetrics } from "@forgelens/domain-analytics";

export async function getDashboardAnalytics() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // The database and aggregation logic is safely abstracted to the Domain layer.
  return await getDashboardMetrics(userId);
}
