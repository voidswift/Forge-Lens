import { pgTable, text, timestamp, customType } from "drizzle-orm/pg-core";
import { encrypt, decrypt } from "../encryption";

const encryptedText = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'text';
  },
  toDriver(value: string): string {
    return encrypt(value);
  },
  fromDriver(value: unknown): string {
    if (typeof value !== 'string') return '';
    return decrypt(value);
  },
});

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Matches Clerk User ID
  email: text("email").notNull().unique(),
  githubToken: encryptedText("github_token"), // Encrypted AES-256-GCM token
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
