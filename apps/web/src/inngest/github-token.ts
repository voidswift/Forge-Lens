import { clerkClient } from "@clerk/nextjs/server";

/**
 * Resolves a GitHub token inside the worker, so tokens never travel in
 * Inngest event payloads (which are stored and visible in the dashboard).
 *
 * - Prefers the user's own Clerk OAuth token.
 * - Falls back to the server-side GITHUB_TOKEN for PUBLIC repos only.
 * Never log or return the result from a `step.run`.
 */
export async function resolveGithubToken(userId: string, isPrivate: boolean): Promise<string> {
  try {
    const client = await clerkClient();
    const tokens = await client.users.getUserOauthAccessToken(userId, "oauth_github");
    const token = tokens.data[0]?.token;
    if (token) return token;
  } catch {
    // fall through to the server token for public repos
  }

  const serverToken = process.env.GITHUB_TOKEN;
  if (!isPrivate && serverToken) return serverToken;

  throw new Error("No GitHub token available for this repository.");
}
