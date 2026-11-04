import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db, repositories } from "@forgelens/db";
import { and, eq, isNotNull } from "drizzle-orm";
import { RepoSearch } from "@/components/repo-search";
import { SHOWCASE_REPOS } from "@/lib/showcase";

export const dynamic = "force-dynamic";

async function getShowcaseScores(): Promise<Map<string, number>> {
  try {
    const rows = await db
      .select({ fullName: repositories.fullName, healthScore: repositories.healthScore })
      .from(repositories)
      .where(and(eq(repositories.isShowcase, true), isNotNull(repositories.healthScore)));
    return new Map(rows.map((r) => [r.fullName.toLowerCase(), r.healthScore as number]));
  } catch {
    return new Map();
  }
}

export default async function Home() {
  const { userId } = await auth();

  // Redirect to dashboard if already authenticated
  if (userId) {
    redirect("/dashboard");
  }

  const scores = await getShowcaseScores();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <p className="font-mono text-sm font-semibold tracking-widest text-gray-500">FORGELENS</p>
      <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-gray-900 sm:text-5xl">
        See any repo’s health, bus factor and maintainer risk in under a minute.
      </h1>

      <div className="mt-10">
        <RepoSearch />
      </div>

      <section className="mt-12" aria-labelledby="showcase-heading">
        <h2 id="showcase-heading" className="text-sm font-semibold uppercase tracking-wider text-gray-500">
          Or look at one we already analyzed
        </h2>
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SHOWCASE_REPOS.map((full) => {
            const score = scores.get(full.toLowerCase());
            return (
              <li key={full}>
                <Link
                  href={`/r/${full}`}
                  className="flex items-center justify-between rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm hover:border-black hover:bg-gray-50"
                >
                  <span>{full}</span>
                  {score !== undefined && <span className="font-bold text-gray-900">{score}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-12 text-sm text-gray-500">
        Want to track your own (including private) repositories?{" "}
        <Link href="/sign-in" className="font-semibold text-gray-900 underline">
          Sign in with GitHub
        </Link>
        .
      </p>
    </div>
  );
}
