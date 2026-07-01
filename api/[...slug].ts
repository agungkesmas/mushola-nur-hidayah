/**
 * Vercel serverless entrypoint — catch-all route.
 *
 * Vercel's `@vercel/node` builder picks up this file and routes any
 * request that doesn't match a static asset through it. We import the
 * Express app from `src/server/app.ts` and export it as the default
 * handler.
 *
 * Vercel preserves the full URL in `req.url` (e.g. `/api/health`), so
 * the Express routes registered with the `/api/...` prefix will match
 * directly without any URL rewriting.
 *
 * Errors during app initialisation are caught and returned as a JSON
 * 500 response so the cause is visible in the Vercel dashboard.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Lazy-load the Express app to avoid module-load failures from heavy
// dependencies (firebase, web-push, @google/genai) breaking the entire
// function. The dynamic import is cached by Node after the first call.
let _appPromise: Promise<any> | null = null;
async function getApp() {
  if (!_appPromise) {
    _appPromise = import("../src/server/app.ts").then((m) => m.getApp());
  }
  return _appPromise;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    return app(req as any, res as any);
  } catch (err: any) {
    console.error("[api/catch-all] Handler error:", err);
    res.status(500).json({
      status: "error",
      message: err?.message || "Unknown error",
      stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      time: new Date().toISOString(),
    });
  }
}
