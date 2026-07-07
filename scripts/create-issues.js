/**
 * Script to auto-generate the ForgeLens 30-issue backlog.
 * 
 * Usage: 
 * 1. Generate a GitHub Personal Access Token (Classic) with 'repo' scope.
 * 2. Run: GITHUB_TOKEN=your_token node scripts/create-issues.js
 */

const REPO_OWNER = "voidswift";
const REPO_NAME = "Forge-Lens";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("❌ Error: GITHUB_TOKEN environment variable is missing.");
  console.error("Usage: GITHUB_TOKEN=ghp_xxx node scripts/create-issues.js");
  process.exit(1);
}

const headers = {
  "Accept": "application/vnd.github.v3+json",
  "Authorization": `token ${GITHUB_TOKEN}`,
  "User-Agent": "ForgeLens-Issue-Bot",
  "Content-Type": "application/json"
};

const issues = [
  // EASY
  { title: "Add a loading skeleton state for the Repository Dashboard", labels: ["good first issue", "easy", "frontend"] },
  { title: "Implement a 'Copy to Clipboard' button for Evidence strings", labels: ["good first issue", "easy", "frontend"] },
  { title: "Add empty states (404/No Data) for Contributor Intelligence", labels: ["good first issue", "easy", "frontend"] },
  { title: "Create a specialized Badge component for Health Scores", labels: ["good first issue", "easy", "frontend"] },
  { title: "Add a GET /api/health endpoint for Docker uptime monitoring", labels: ["good first issue", "easy", "backend"] },
  { title: "Enforce maximum length (255 chars) on repository import input", labels: ["good first issue", "easy", "backend"] },
  { title: "Write a CONTRIBUTING.md guide for local Docker setup", labels: ["good first issue", "easy", "docs"] },
  { title: "Document the database schema relations in packages/db/README.md", labels: ["good first issue", "easy", "docs"] },
  { title: "Add a Vitest unit test for the Responsiveness math function", labels: ["good first issue", "easy", "tests"] },
  { title: "Add a Vitest unit test for handling empty arrays in Maintenance score", labels: ["good first issue", "easy", "tests"] },

  // MEDIUM
  { title: "Build the 'Timeline' view showing raw GitHub commits", labels: ["mid", "frontend"] },
  { title: "Implement Dark Mode parsing using Tailwind CSS", labels: ["mid", "frontend"] },
  { title: "Create the 'Bus Factor' visualization card", labels: ["mid", "frontend"] },
  { title: "Create the GET /api/repositories/:id/health endpoint", labels: ["mid", "backend"] },
  { title: "Add a rate limit to the /import endpoint to prevent spam", labels: ["mid", "backend"] },
  { title: "Write an Inngest job to delete raw commits older than 1 year", labels: ["mid", "backend"] },
  { title: "Update GitHub Webhook handler to verify HMAC signature", labels: ["mid", "backend"] },
  { title: "Add server-side pagination to the 'Commits' data table", labels: ["mid", "fullstack"] },
  { title: "Write an integration test for the Inngest worker against mocked Octokit", labels: ["mid", "tests"] },
  { title: "Set up Playwright and write one end-to-end repository import test", labels: ["mid", "tests"] },

  // HARD
  { title: "Octokit Rate Limit Suspension & Resume", labels: ["hard", "backend"] },
  { title: "Refactor getCommitsStream to use async generators correctly", labels: ["hard", "backend"] },
  { title: "Write the CQRS Projection Engine for Health Scores", labels: ["hard", "backend"] },
  { title: "Implement the Bus Factor Algorithm (v0.1) Math", labels: ["hard", "backend"] },
  { title: "Implement the Contributor Freshness time-decay algorithm", labels: ["hard", "backend"] },
  { title: "Migrate from PATs to a full OAuth GitHub App Installation flow", labels: ["hard", "fullstack"] },
  { title: "Implement Zero-Downtime Schema Migrations (v0.1 to v0.2)", labels: ["hard", "database"] },
  { title: "Finalize V8 Memory Benchmarking script", labels: ["hard", "devops"] },
  { title: "Implement Postgres Row Level Security (RLS) via Drizzle", labels: ["hard", "security"] },
  { title: "Implement Idempotent Cursor Recovery on SIGTERM", labels: ["hard", "architecture"] }
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createIssues() {
  console.log(`🚀 Starting generation of ${issues.length} issues for ${REPO_OWNER}/${REPO_NAME}...`);
  
  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          title: issue.title,
          body: `This issue is part of the ForgeLens Beta Backlog.\n\n### Task\n${issue.title}\n\n*If you want to claim this, comment \`.take\` below!*`,
          labels: issue.labels
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Created [#${data.number}] - ${issue.title}`);
      } else {
        console.error(`❌ Failed to create issue: ${issue.title} (Status: ${response.status})`);
        const err = await response.json();
        console.error(err);
      }
      
      // Sleep to prevent triggering GitHub's secondary abuse rate limits
      await sleep(1500); 
    } catch (e) {
      console.error(`❌ Network error on issue: ${issue.title}`);
      console.error(e);
    }
  }
  
  console.log("🎉 Finished creating the backlog!");
}

createIssues();
