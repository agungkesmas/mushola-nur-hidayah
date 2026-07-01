/**
 * Shared dispatch helper for Vercel Functions.
 *
 * Vercel Functions (fluid) only matches single-segment paths with
 * catch-all patterns, so we generate one file per Express route.
 * Each generated file simply imports this helper and exports it as
 * the default handler.
 *
 * The helper lazy-loads the Express app from `src/server/app.ts` and
 * forwards the incoming Vercel request to it. Vercel preserves the
 * original URL in `req.url`, so Express route matching works
 * transparently.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

let _appPromise: Promise<any> | null = null;

async function getApp() {
  if (!_appPromise) {
    // IMPORTANT: do NOT include the .ts extension — Vercel compiles
    // .ts → .js at build time and Node resolves the .js at runtime.
    _appPromise = import("../src/server/app.js").then((m) => m.getApp());
  }
  return _appPromise;
}

export async function dispatch(req: VercelRequest, res: VercelResponse) {
  try {
    const app = await getApp();
    return app(req as any, res as any);
  } catch (err: any) {
    console.error("[api/dispatch] Handler error:", err);
    res.status(500).json({
      status: "error",
      message: err?.message || "Unknown error",
      stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      time: new Date().toISOString(),
    });
  }
}
