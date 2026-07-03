import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export interface CommitData {
  message: string;
  authorName: string;
  timestamp: Date;
}

export interface PRData {
  title: string;
  state: string;
  authorName: string;
}

export class AnalyticsAI {
  async generateSemanticReview(commits: CommitData[], prs: PRData[]) {
    const commitContext = commits.map(c => `- ${c.authorName}: ${c.message}`).join("\n");
    const prContext = prs.map(pr => `- ${pr.authorName} [${pr.state}]: ${pr.title}`).join("\n");

    const prompt = `
      You are an elite Staff Engineer reviewing a team's recent activity.
      DO NOT summarize basic statistics (e.g., "The team merged 5 PRs"). Those are handled by our deterministic analytics engine.
      Instead, perform a Semantic Code Review:
      - What architectural themes were touched this week?
      - Are there signs of technical debt being added or removed based on the PR titles?
      - What product features were the primary focus?
      
      Return a brief, highly professional Markdown report.

      Commits:
      ${commitContext || "No recent commits."}

      Pull Requests:
      ${prContext || "No recent PRs."}
    `;

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
      });

      return text;
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw new Error("Failed to generate semantic insights.");
    }
  }
}
