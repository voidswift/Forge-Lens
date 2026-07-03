import { ReactNode } from "react";
import Link from "next/link";

export default function RepositoryLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <nav className="flex flex-col space-y-1">
          <Link
            href={`/dashboard/repository/${params.id}`}
            className="px-3 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium text-sm"
          >
            Overview
          </Link>
          <button disabled className="text-left px-3 py-2 text-gray-400 font-medium text-sm cursor-not-allowed">
            Timeline
          </button>
          <button disabled className="text-left px-3 py-2 text-gray-400 font-medium text-sm cursor-not-allowed">
            Pull Requests (Coming Soon)
          </button>
          <Link
            href={`/dashboard/repository/${params.id}/contributors`}
            className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm transition-colors"
          >
            Contributors
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
