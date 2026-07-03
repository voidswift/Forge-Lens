import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db, commits, pullRequests, repositories } from "@forgelens/db";
import { eq } from "drizzle-orm";

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "No GitHub Webhook Secret configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-hub-signature-256");
  const event = req.headers.get("x-github-event");

  if (!signature || !event) {
    return NextResponse.json({ error: "Missing headers" }, { status: 400 });
  }

  const body = await req.text();
  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(body).digest("hex");

  if (signature !== digest) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);

  try {
    if (event === "push") {
      const githubRepoId = payload.repository.id;
      
      const [repoExists] = await db
        .select()
        .from(repositories)
        .where(eq(repositories.githubId, githubRepoId))
        .limit(1);
      
      if (!repoExists) return NextResponse.json({ status: "Ignored" }, { status: 200 });

      const commitsToInsert = payload.commits.map((commit: any) => ({
        id: commit.id,
        repositoryId: repoExists.id,
        message: commit.message,
        authorName: commit.author.name,
        authorEmail: commit.author.email,
        url: commit.url,
        timestamp: new Date(commit.timestamp),
      }));

      if (commitsToInsert.length > 0) {
        await db.insert(commits).values(commitsToInsert).onConflictDoNothing();
      }
    } 
    else if (event === "pull_request") {
      const githubRepoId = payload.repository.id;
      
      const [repoExists] = await db
        .select()
        .from(repositories)
        .where(eq(repositories.githubId, githubRepoId))
        .limit(1);

      if (!repoExists) return NextResponse.json({ status: "Ignored" }, { status: 200 });

      const pr = payload.pull_request;
      
      await db.insert(pullRequests).values({
        id: pr.id,
        repositoryId: repoExists.id,
        number: pr.number,
        title: pr.title,
        state: pr.state,
        url: pr.html_url,
        authorName: pr.user.login,
        createdAt: new Date(pr.created_at),
        updatedAt: new Date(pr.updated_at),
      }).onConflictDoUpdate({
        target: pullRequests.id,
        set: {
          title: pr.title,
          state: pr.state,
          updatedAt: new Date(pr.updated_at),
        }
      });
    }

    return NextResponse.json({ status: "Success" }, { status: 200 });
  } catch (error) {
    console.error("Error processing GitHub webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
