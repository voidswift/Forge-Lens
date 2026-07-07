/**
 * Scalable script to auto-generate GitHub issues from a JSON file.
 * 
 * Usage: 
 * 1. Create an 'issues.json' file in the same directory.
 * 2. Generate a GitHub PAT with 'Issues: Read and Write' permission.
 * 3. Run: GITHUB_TOKEN=your_token node scripts/create-issues.js
 */

const fs = require('fs');
const path = require('path');

const REPO_OWNER = "voidswift";
const REPO_NAME = "Forge-Lens";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("❌ Error: GITHUB_TOKEN environment variable is missing.");
  process.exit(1);
}

const headers = {
  "Accept": "application/vnd.github.v3+json",
  "Authorization": `token ${GITHUB_TOKEN}`,
  "User-Agent": "ForgeLens-Issue-Bot",
  "Content-Type": "application/json"
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createIssues() {
  const issuesPath = path.join(__dirname, 'issues.json');
  
  if (!fs.existsSync(issuesPath)) {
    console.error(`❌ Error: Could not find ${issuesPath}. Please create it with an array of issues.`);
    process.exit(1);
  }

  const issues = JSON.parse(fs.readFileSync(issuesPath, 'utf8'));
  console.log(`🚀 Starting generation of ${issues.length} issues for ${REPO_OWNER}/${REPO_NAME}...`);
  
  for (let i = 0; i < issues.length; i++) {
    const issue = issues[i];
    
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          title: issue.title,
          body: issue.body || `### Task\n${issue.title}\n\n*If you want to claim this, comment \`.take\` below!*`,
          labels: issue.labels || []
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Created [#${data.number}] - ${issue.title}`);
      } else {
        console.error(`❌ Failed: ${issue.title} (Status: ${response.status})`);
      }
      
      // 1.5 second delay prevents triggering GitHub abuse rate limits when creating 100+ issues
      await sleep(1500); 
    } catch (e) {
      console.error(`❌ Network error on issue: ${issue.title}`);
    }
  }
  
  console.log("🎉 Finished creating the backlog!");
}

createIssues();
