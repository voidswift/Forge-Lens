import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { repositories } from "./repositories";

export const repositorySnapshots = pgTable("repository_snapshots", {
  id: text("id").primaryKey(),
  repositoryId: text("repository_id").notNull().references(() => repositories.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  healthScore: integer("health_score"),
  resilienceScore: integer("resilience_score"),
  busFactor: integer("bus_factor"),
});
