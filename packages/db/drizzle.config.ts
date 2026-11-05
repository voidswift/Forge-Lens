import type { Config } from "drizzle-kit";

// Load DATABASE_URL from the web app's env file when it is not already set (Node >= 20.12).
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile("../../apps/web/.env.local");
  } catch {
    // no env file; fall through to the check below
  }
}

export default {
  schema: "./src/schemas/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
