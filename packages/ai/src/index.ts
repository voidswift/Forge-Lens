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
  async generateEngineeringInsights(commits: CommitData[], prs: PRData[]) {
    const commitContext = commits.map(c => `- ${c.authorName}: ${c.message}`).join("\n");
    const prContext = prs.map(pr => `- ${pr.authorName} [${pr.state}]: ${pr.title}`).join("\n");

    const prompt = `
      You are a Staff Engineer analyzing recent engineering activity.
      Analyze the following commits and pull requests.
      Identify bottlenecks, summarize what the team focused on, and suggest areas of improvement.
      Return the result in clear, well-formatted Markdown.

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
      throw new Error("Failed to generate insights.");
    }
  }
}
