import type { ReactNode } from "react";

export type EvidenceResult = { score: number; evidence: string[] };

export type ReportRepo = {
  fullName: string;
  stars: number | null;
  forks: number | null;
  language: string | null;
  license: string | null;
  description: string | null;
  syncStatus: string;
  healthScore: number | null;
  healthAlgorithmVersion: string | null;
  busFactor: number | null;
  resilienceScore: number | null;
  resilienceAlgorithmVersion: string | null;
  healthEvidence: unknown;
  resilienceEvidence: unknown;
  lastSyncedAt: Date | null;
};

export // Utility to format time ago
function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

export function RepoHeader({ repo }: { repo: ReportRepo }): ReactNode {
  return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{repo.fullName}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
            {(repo.stars ?? 0) > 0 && <span className="flex items-center gap-1">⭐ {repo.stars}</span>}
            {(repo.forks ?? 0) > 0 && <span>Forks {repo.forks}</span>}
            {repo.language && <span>{repo.language}</span>}
            {repo.license && <span>{repo.license}</span>}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">Status: {repo.syncStatus}</span>
          </div>
          {repo.description && <p className="mt-4 text-gray-700">{repo.description}</p>}
        </div>
        
        {/* Health Score */}
        <div className="shrink-0 bg-gray-50 border border-gray-200 rounded-lg p-4 w-48 text-center flex flex-col justify-center">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Repository Health</p>
          {repo.healthScore !== null ? (
            <>
              <div className="text-3xl font-black text-gray-900">{repo.healthScore}</div>
              <p className="text-xs text-gray-500 mt-1">{repo.healthAlgorithmVersion}</p>
            </>
          ) : (
            <>
              <div className="text-2xl font-black text-gray-400">UNKNOWN</div>
              <p className="text-xs text-gray-400 mt-1">Calculating...</p>
            </>
          )}
        </div>

        {/* Bus Factor */}
        <div className="shrink-0 bg-red-50 border border-red-200 rounded-lg p-4 w-48 text-center flex flex-col justify-center">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Bus Factor</p>
          {repo.busFactor !== null ? (
            <>
              <div className="text-3xl font-black text-red-900">{repo.busFactor}</div>
              <p className="text-xs text-red-600 mt-1">
                {repo.busFactor <= 2 ? "⚠ High Risk" : "Stable"}
              </p>
            </>
          ) : (
            <>
              <div className="text-2xl font-black text-gray-400">UNKNOWN</div>
              <p className="text-xs text-gray-400 mt-1">Calculating...</p>
            </>
          )}
        </div>

        {/* Resilience Score */}
        <div className="shrink-0 bg-blue-50 border border-blue-200 rounded-lg p-4 w-48 text-center flex flex-col justify-center">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Resilience</p>
          {repo.resilienceScore !== null ? (
            <>
              <div className="text-3xl font-black text-blue-900">{repo.resilienceScore}</div>
              <p className="text-xs text-blue-600 mt-1">{repo.resilienceAlgorithmVersion}</p>
            </>
          ) : (
            <>
              <div className="text-2xl font-black text-gray-400">UNKNOWN</div>
              <p className="text-xs text-gray-400 mt-1">Calculating...</p>
            </>
          )}
        </div>
      </div>
  );
}

export function EvidencePanels({ repo }: { repo: ReportRepo }): ReactNode {
  return (
    <>
      {/* Health Evidence Panel */}
      {repo.healthEvidence != null && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Why this score?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(repo.healthEvidence as Record<string, EvidenceResult>).map(([key, result]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">{key}</span>
                  <span className="text-sm font-bold text-gray-900">{result.score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div className="bg-black h-2 rounded-full" style={{ width: `${result.score}%` }}></div>
                </div>
                <ul className="space-y-1">
                  {result.evidence.map((line: string, i: number) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resilience Evidence Panel */}
      {repo.resilienceEvidence != null && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resilience Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(repo.resilienceEvidence as Record<string, EvidenceResult>).map(([key, result]) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{result.score}/100</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2 mb-3">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${result.score}%` }}></div>
                </div>
                <ul className="space-y-1">
                  {result.evidence.map((line: string, i: number) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
