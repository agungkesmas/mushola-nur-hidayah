/**
 * Shared dispatch helper for Vercel Functions.
 *
 * Uses a static import so esbuild bundles the entire Express app
 * (and its dependencies) into the function output at build time.
 * This avoids the "Cannot find module" runtime error that dynamic
 * imports with relative paths cause on Vercel.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
// Static import — resolved & bundled at build time by esbuild.
import { getApp } from "../src/server/app";

export async function dispatch(req: VercelRequest, res: VercelResponse) {
  try {
    // Restore the original URL that was rewritten by vercel.json
    // (rewrites route /api/* to /api; the original path is preserved
    // in the x-vercel-path header).
    const originalPath =
      (req.headers["x-vercel-path"] as string | undefined) ||
      (req.headers["x-forwarded-path"] as string | undefined) ||
      req.url;

    if (originalPath && originalPath !== req.url) {
      // Preserve query string if present in the rewritten URL
      const qIndex = req.url?.indexOf("?");
      const qs = qIndex !== undefined && qIndex >= 0 ? req.url!.substring(qIndex) : "";
      req.url = originalPath + qs;
    }

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
