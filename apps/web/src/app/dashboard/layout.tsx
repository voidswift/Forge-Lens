import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 mr-12">ForgeLens</h1>
        
        <nav className="flex-1 flex gap-6 text-sm font-medium">
          <Link href="/dashboard" className="text-gray-600 hover:text-black transition-colors">Overview</Link>
          <Link href="/dashboard/insights" className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center gap-2">
            ✨ AI Insights
          </Link>
        </nav>

        <UserButton />
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        {children}
      </main>
    </div>
  );
}
