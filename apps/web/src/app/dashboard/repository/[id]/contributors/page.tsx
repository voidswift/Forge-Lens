import { db } from "@forgelens/db";
import { contributors, repositories } from "@forgelens/db/src/schemas";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";

function getTrendIcon(trend: string) {
  if (trend === "Increasing") return "↑";
  if (trend === "Declining") return "↓";
  return "−";
}

function getTrendColor(trend: string) {
  if (trend === "Increasing") return "text-green-600";
  if (trend === "Declining") return "text-red-600";
  return "text-gray-500";
}

function getRoleBadge(role: string) {
  if (role === "Core Maintainer") return "bg-green-100 text-green-800";
  if (role === "Active Contributor") return "bg-blue-100 text-blue-800";
  if (role === "Occasional Contributor") return "bg-yellow-100 text-yellow-800";
  if (role === "New Contributor") return "bg-gray-100 text-gray-800";
  return "bg-red-100 text-red-800"; // Inactive
}

export default async function ContributorsPage({ params }: { params: { id: string } }) {
  const repo = await db.query.repositories.findFirst({
    where: eq(repositories.id, params.id),
  });

  if (!repo) {
    redirect("/dashboard");
  }

  const profiles = await db.query.contributors.findMany({
    where: eq(contributors.repositoryId, params.id),
    orderBy: [desc(contributors.score)],
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contributor Intelligence</h1>
          <p className="text-gray-500 mt-1">Understanding who keeps this repository alive.</p>
        </div>
        <div className="text-right bg-red-50 p-4 rounded-lg border border-red-100">
          <p className="text-xs font-bold uppercase tracking-wider text-red-600">Bus Factor</p>
          <p className="text-2xl font-black text-red-900">{repo.busFactor || 0}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <div className="flex-1"><input type="text" placeholder="Search contributors..." className="w-full text-sm border-gray-300 rounded-lg" disabled /></div>
          <div className="w-48"><select className="w-full text-sm border-gray-300 rounded-lg" disabled><option>All Roles</option></select></div>
        </div>
        
        {profiles.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No contributors found. If the repository is currently syncing, check back shortly.
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-900">Contributor</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-center">Score</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-center">Trend</th>
                <th className="px-6 py-4 font-semibold text-gray-900">Expertise</th>
                <th className="px-6 py-4 font-semibold text-gray-900 text-right">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadge(p.role)}`}>
                      {p.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-gray-900">{p.score}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold text-lg ${getTrendColor(p.trend)}`} title={p.trend}>
                      {getTrendIcon(p.trend)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {p.expertise}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {p.lastActive ? new Date(p.lastActive).toLocaleDateString() : "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
