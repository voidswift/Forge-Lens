import { pgTable, text, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";

export const repositories = pgTable("repositories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  githubId: integer("github_id").notNull().unique(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  isPrivate: boolean("is_private").notNull(),
  syncStatus: text("sync_status").notNull().default("PENDING"), // PENDING, IMPORTING, LIVE
  description: text("description"),
  language: text("language"),
  stars: integer("stars").default(0),
  forks: integer("forks").default(0),
  watchers: integer("watchers").default(0),
  license: text("license"),
  lastSyncedAt: timestamp("last_synced_at"),
  busFactor: integer("bus_factor"),
  healthScore: integer("health_score"),
  healthAlgorithmVersion: text("health_algorithm_version"),
  healthEvidence: json("health_evidence"),
  resilienceScore: integer("resilience_score"),
  resilienceAlgorithmVersion: text("resilience_algorithm_version"),
  resilienceEvidence: json("resilience_evidence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
