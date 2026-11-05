import { healthTier } from "@forgelens/domain-analytics";
import { renderBadge } from "@/lib/badge";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getPublicRepository, isValidSlug } from "@/lib/reports";

const SIX_HOURS = 6 * 60 * 60;

export async function GET(req: Request, { params }: { params: Promise<{ owner: string; repo: string }> }) {
  const { owner, repo } = await params;

  const headers = {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": `public, max-age=${SIX_HOURS}, s-maxage=${SIX_HOURS}`,
  };

  if (!isValidSlug(owner, repo)) {
    return new Response(renderBadge("ForgeLens", "not analyzed", "#9f9f9f"), { status: 404, headers });
  }

  const rl = rateLimit(`badge:${clientIp(req.headers)}`, 120);
  if (!rl.ok) {
    return new Response("Too many requests", { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
  }

  let score: number | null = null;
  try {
    score = (await getPublicRepository(owner, repo))?.healthScore ?? null;
  } catch (e) {
    console.error("badge lookup failed", e);
    // Don't cache a transient failure for hours.
    return new Response(renderBadge("ForgeLens", "unavailable", "#9f9f9f"), {
      status: 503,
      headers: { "Content-Type": headers["Content-Type"], "Cache-Control": "no-store" },
    });
  }

  if (score === null) {
    // Short cache so a repo that gets analyzed soon after doesn't show stale text for hours.
    return new Response(renderBadge("ForgeLens", "not analyzed", "#9f9f9f"), {
      headers: { ...headers, "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
  }
  return new Response(renderBadge("ForgeLens", `health ${score}`, healthTier(score).color), { headers });
}
