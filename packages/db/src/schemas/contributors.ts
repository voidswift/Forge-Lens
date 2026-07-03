import { pgTable, text, timestamp, integer, json } from "drizzle-orm/pg-core";
import { repositories } from "./repositories";

export const contributors = pgTable("contributors", {
  id: text("id").primaryKey(), // combo of repoId + authorName
  repositoryId: text("repository_id").notNull().references(() => repositories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").notNull(), // Core Maintainer, Active Contributor, etc.
  score: integer("score").notNull(),
  trend: text("trend").notNull(), // Increasing, Stable, Declining
  expertise: text("expertise"), // e.g., "Frontend", "Authentication"
  lastActive: timestamp("last_active"),
  algorithmVersion: text("algorithm_version").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
