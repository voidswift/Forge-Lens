import { ImportRepositoryForm } from "./import-form";
import { getDashboardAnalytics } from "@/actions/analytics";
import { db, repositories } from "@forgelens/db";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HealthBadge } from "@/components/health-badge";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch metrics and repositories concurrently
  const [metrics, repos] = await Promise.all([
    getDashboardAnalytics(),
    db.select().from(repositories).where(eq(repositories.userId, userId))
  ]);

  return (
    <div className="space-y-10">
      
      {/* Metrics Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Engineering Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">Tracked Repositories</p>
            <p className="text-3xl font-bold text-gray-900">{metrics.totalRepos}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">Commits (Last 7d)</p>
            <p className="text-3xl font-bold text-gray-900">{metrics.totalCommits7d}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">Open PRs</p>
            <p className="text-3xl font-bold text-amber-600">{metrics.openPrs}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm font-medium text-gray-500 mb-1">Closed PRs</p>
            <p className="text-3xl font-bold text-green-600">{metrics.closedPrs}</p>
          </div>
        </div>
      </section>

      {/* Repositories Section */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Repositories</h2>
          
          <ImportRepositoryForm />
        </div>

        {repos.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center">
            <p className="text-gray-500">You haven't synced any repositories yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repos.map((repo) => (
              <Link key={repo.id} href={`/dashboard/repository/${repo.id}`} className="block">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-black transition-all h-full cursor-pointer">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{repo.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 truncate">{repo.fullName}</p>
                  </div>
                  <div className="mt-6 flex justify-between items-center text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${repo.isPrivate ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-700'}`}>
                      {repo.isPrivate ? 'Private' : 'Public'}
                    </span>
                    <div className="flex items-center gap-2">
                      {repo.healthScore !== null && repo.healthScore !== undefined && (
                        <HealthBadge score={repo.healthScore} size="sm" />
                      )}
                      <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
                        {repo.syncStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
