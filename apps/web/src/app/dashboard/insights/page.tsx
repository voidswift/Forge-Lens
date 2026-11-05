import { generateAiInsights } from "@/actions/insights";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";

export const maxDuration = 30;

export default async function InsightsPage() {
  // AI is optional: without a key the page (and its nav item) simply does not exist.
  if (!process.env.OPENAI_API_KEY) notFound();
  const insights = await generateAiInsights();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">AI Engineering Insights</h2>
      </div>
      
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm prose max-w-none text-gray-800">
        <ReactMarkdown>{insights}</ReactMarkdown>
      </div>
    </div>
  );
}
