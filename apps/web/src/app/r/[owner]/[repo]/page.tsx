import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { RepoHeader, EvidencePanels, timeAgo } from "@/components/report";
import { CopyBox } from "@/components/copy-box";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getPublicRepository, getTopContributors, isValidSlug } from "@/lib/reports";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ owner: string; repo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, repo } = await params;
  return { title: `${owner}/${repo} — ForgeLens report` };
}

function Notice({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
      <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      <div className="mt-4 text-gray-600">{children}</div>
    </div>
  );
}

export default async function PublicReportPage({ params }: Props) {
  const { owner, repo } = await params;
  const h = await headers();

  let body: React.ReactNode;

  if (!isValidSlug(owner, repo)) {
    body = <Notice title="That doesn’t look like a GitHub repository." />;
  } else if (!rateLimit(`report:${clientIp(h)}`, 60).ok) {
    body = <Notice title="Too many requests">Please try again in a minute.</Notice>;
  } else {
    let data = null;
    try {
      data = await getPublicRepository(owner, repo);
    } catch (e) {
      console.error("public report lookup failed", e);
    }

    if (!data) {
      body = (
        <Notice title="Not analyzed yet">
          <p>
            <span className="font-mono">
              {owner}/{repo}
            </span>{" "}
            hasn’t been analyzed yet.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Sign in to import
          </Link>
        </Notice>
      );
    } else {
      const top = await getTopContributors(data.id);
      const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
      const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
      const base = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;
      const reportUrl = `${base}/r/${data.fullName}`;
      const markdown = `[![ForgeLens](${base}/api/badge/${data.fullName})](${reportUrl})`;

      body = (
        <div className="space-y-8">
          <RepoHeader repo={data} />
          <p className="text-sm text-gray-500">
            Last analyzed {data.lastSyncedAt ? timeAgo(data.lastSyncedAt) : "never"}. Scores are computed
            deterministically from recent commit and pull request history.
          </p>
          <EvidencePanels repo={data} />

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-semibold text-gray-900">Contributors</h2>
            </div>
            {top.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">No contributor activity in the analyzed window.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-2">Name</th>
                    <th className="px-6 py-2">Role</th>
                    <th className="px-6 py-2">Trend</th>
                    <th className="px-6 py-2 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {top.map((c) => (
                    <tr key={c.id}>
                      <td className="px-6 py-3 font-medium text-gray-900">{c.name}</td>
                      <td className="px-6 py-3 text-gray-600">{c.role}</td>
                      <td className="px-6 py-3 text-gray-600">{c.trend}</td>
                      <td className="px-6 py-3 text-right font-bold">{c.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 font-semibold text-gray-900">Add this badge to your README</h2>
            <p className="mb-4 text-sm text-gray-500">The badge links back to this report.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/badge/${data.fullName}`} alt="ForgeLens health badge" className="mb-4 h-5" />
            <CopyBox text={markdown} />
          </section>
        </div>
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <Link href="/" className="mb-8 inline-block text-sm font-semibold text-gray-900 hover:underline">
        ← ForgeLens
      </Link>
      {body}
    </div>
  );
}
