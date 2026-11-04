"use client";

import { useState } from "react";

export function CopyBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-start gap-3">
      <code className="flex-1 break-all rounded-lg bg-gray-100 p-3 text-xs text-gray-800">{text}</code>
      <button
        type="button"
        className="shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-50"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // clipboard unavailable; user can select the text manually
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
