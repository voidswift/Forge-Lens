import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <header className="bg-[var(--card-bg)] border-b border-[var(--card-border)] h-16 flex items-center px-8">
        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mr-12">ForgeLens</h1>
        
        <nav className="flex-1 flex gap-6 text-sm font-medium">
          <Link href="/dashboard" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Overview</Link>
          <Link href="/dashboard/insights" className="text-indigo-600 hover:text-indigo-900 transition-colors flex items-center gap-2">
            ✨ AI Insights
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserButton />
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        {children}
      </main>
    </div>
  );
}
