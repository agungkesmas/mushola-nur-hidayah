/**
 * Vercel serverless entrypoint — catch-all route.
 *
 * Vercel's `@vercel/node` builder picks up this file and routes any
 * request that doesn't match a static asset through it. We import the
 * Express app from `src/server/app.ts` and export it as the default
 * handler.
 *
 * `getApp()` is memoised, so repeated invocations within the same
 * warm Lambda instance reuse the existing Express app instead of
 * rebuilding it.
 *
 * Vercel preserves the full URL in `req.url` (e.g. `/api/health`), so
 * the Express routes registered with the `/api/...` prefix will match
 * directly without any URL rewriting.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getApp } from "../src/server/app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await getApp();
  // Express apps are Node.js http.RequestListener-compatible — they
  // accept (req, res) and emit the response themselves.
  return app(req as any, res as any);
}
