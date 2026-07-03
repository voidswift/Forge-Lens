import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const repositories = pgTable("repositories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  githubId: integer("github_id").notNull().unique(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  isPrivate: boolean("is_private").notNull(),
  syncStatus: text("sync_status").notNull().default("PENDING"), // PENDING, IMPORTING, LIVE
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
