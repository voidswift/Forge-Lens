import { db, repositories, commits, pullRequests } from "@forgelens/db";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SyncPoller } from "./client-poll";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { RepoHeader, EvidencePanels, timeAgo } from "@/components/report";

export default async function RepositoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const [repo] = await db.select().from(repositories).where(eq(repositories.id, id)).limit(1);

  if (!repo || repo.userId !== userId) {
    notFound();
  }

  // Fetch commits and PRs
  const [repoCommits, repoPrs] = await Promise.all([
    db.select().from(commits).where(eq(commits.repositoryId, id)).orderBy(desc(commits.timestamp)).limit(20),
    db.select().from(pullRequests).where(eq(pullRequests.repositoryId, id)).orderBy(desc(pullRequests.createdAt)).limit(20)
  ]);

  // Unified Timeline
  const timeline = [
    ...repoCommits.map(c => ({ type: "commit", id: c.id, title: c.message, actor: c.authorName, date: c.timestamp })),
    ...repoPrs.map(pr => ({ type: "pr", id: pr.id.toString(), title: pr.title, actor: pr.authorName, date: pr.createdAt }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 30);

  const isSyncing = repo.syncStatus !== "Completed";

  return (
    <div className="space-y-8">
      <SyncPoller isSyncing={isSyncing} />

      <RepoHeader repo={repo} />

      {isSyncing && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            <h3 className="font-semibold text-blue-900">Importing...</h3>
          </div>
          <p className="text-blue-800 text-sm font-mono">
            {repoCommits.length} commits imported • {repoPrs.length} PRs imported
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold">Commits Imported</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{repoCommits.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-semibold">PRs Imported</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{repoPrs.length}</p>
        </div>
        
        {/* Last Sync Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm md:col-span-2 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Last Sync</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {repo.lastSyncedAt ? timeAgo(repo.lastSyncedAt) : "Never"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
            <p className="text-sm font-bold text-green-600 mt-1 flex items-center gap-1 justify-end">
              Healthy <span className="text-lg">✓</span>
            </p>
          </div>
        </div>
      </div>

      {!isSyncing && <EvidencePanels repo={repo} />}

      {/* Unified Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        </div>
        
        {timeline.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {isSyncing ? "Waiting for activity data..." : "No activity found."}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {timeline.map((item, idx) => (
              <li key={idx} className="px-6 py-4 flex gap-4 hover:bg-gray-50 transition-colors">
                <div className="shrink-0 pt-1">
                  {item.type === "commit" ? (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold">
                      C
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                      PR
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <span className="font-semibold text-gray-700">{item.actor}</span>
                    <span className="mx-1">•</span>
                    {timeAgo(item.date)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
