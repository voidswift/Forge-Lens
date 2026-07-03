import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { repositories } from "./repositories";

export const pullRequests = pgTable("pull_requests", {
  id: integer("id").primaryKey(), // GitHub PR ID
  repositoryId: text("repository_id").notNull().references(() => repositories.id, { onDelete: 'cascade' }),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  state: text("state").notNull(), // 'open', 'closed'
  url: text("url").notNull(),
  authorName: text("author_name").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
}, (table) => {
  return {
    repoStateIdx: index("repo_state_idx").on(table.repositoryId, table.state),
    repoUpdatedIdx: index("repo_updated_idx").on(table.repositoryId, table.updatedAt),
  };
});
