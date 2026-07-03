import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { repositories } from "./repositories";

export const commits = pgTable("commits", {
  id: text("id").primaryKey(), // The commit SHA
  repositoryId: text("repository_id").notNull().references(() => repositories.id, { onDelete: 'cascade' }),
  message: text("message").notNull(),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  url: text("url").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    repoTimeIdx: index("repo_time_idx").on(table.repositoryId, table.timestamp),
  };
});
