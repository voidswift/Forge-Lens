"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Accepts "owner/repo" or a github.com URL and opens the public report. */
export function parseRepoInput(raw: string): { owner: string; repo: string } | null {
  const cleaned = raw
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/\/+$/, "");
  const [owner, repo, ...rest] = cleaned.split("/");
  if (!owner || !repo || rest.length > 0) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(owner) || !/^[A-Za-z0-9._-]+$/.test(repo)) return null;
  return { owner, repo };
}

export function RepoSearch() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault();
        const value = new FormData(e.currentTarget).get("repo")?.toString() ?? "";
        const parsed = parseRepoInput(value);
        if (!parsed) {
          setError("Use the form owner/repo, e.g. facebook/react");
          return;
        }
        setError(null);
        router.push(`/r/${parsed.owner}/${parsed.repo}`);
      }}
    >
      <label htmlFor="repo" className="sr-only">
        GitHub repository
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="repo"
          name="repo"
          placeholder="Paste a GitHub repo (owner/repo)"
          autoComplete="off"
          className="flex-1 rounded-lg border-2 border-black bg-white px-4 py-3 font-mono text-base outline-none focus:ring-4 focus:ring-gray-200"
        />
        <button
          type="submit"
          className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Analyze
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
