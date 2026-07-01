/**
 * Single Vercel Function entrypoint for the entire /api/* namespace.
 *
 * Vercel Hobby plan limits deployments to 12 serverless functions,
 * so we consolidate all Express routes into a single function file
 * and use `vercel.json` `rewrites` to route every /api/* path here.
 *
 * Vercel's rewrites preserve the original URL in `req.url` (and
 * append the matched path as `?path=...`), so Express route matching
 * works transparently — we just need to strip the appended query.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getApp } from "../src/server/app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Vercel's rewrite from /api/:path* to /api preserves the original
    // URL in req.url but appends ?path=<captured> as an extra query
    // parameter. Strip that extra param so Express sees clean URLs.
    if (req.url && req.url.includes("?path=")) {
      req.url = req.url.replace(/\?path=[^&]*/, "").replace(/\?$/, "");
    }

    const app = await getApp();
    return app(req as any, res as any);
  } catch (err: any) {
    console.error("[api/index] Handler error:", err);
    res.status(500).json({
      status: "error",
      message: err?.message || "Unknown error",
      stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      code: err?.code,
      time: new Date().toISOString(),
    });
  }
}
