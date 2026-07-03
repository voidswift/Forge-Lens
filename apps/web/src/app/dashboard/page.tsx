import { syncRepositories } from "@/actions/sync";
import { db, repositories } from "@forgelens/db";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch existing repositories from DB for this user
  const repos = await db.select().from(repositories).where(eq(repositories.userId, userId));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Your Repositories</h2>
        
        <form action={syncRepositories}>
          <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Sync GitHub Repositories
          </button>
        </form>
      </div>

      {repos.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-sm text-center">
          <p className="text-gray-500">You haven't synced any repositories yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repos.map((repo) => (
            <div key={repo.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{repo.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{repo.fullName}</p>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${repo.isPrivate ? 'bg-gray-100 text-gray-700' : 'bg-green-50 text-green-700'}`}>
                  {repo.isPrivate ? 'Private' : 'Public'}
                </span>
                <span className="text-gray-400">
                  {repo.syncStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
