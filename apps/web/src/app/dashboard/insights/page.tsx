import { generateAiInsights } from "@/actions/insights";
import ReactMarkdown from "react-markdown";
import { PreBlock } from "@/components/copy-button";

export const maxDuration = 30;

export default async function InsightsPage() {
  const insights = await generateAiInsights();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">AI Engineering Insights</h2>
      </div>
      
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm prose max-w-none text-gray-800">
        <ReactMarkdown
          components={{
            pre: ({ children, className }) => (
              <PreBlock className={className}>{children}</PreBlock>
            ),
          }}
        >
          {insights}
        </ReactMarkdown>
      </div>
    </div>
  );
}
