/**
 * Shared dispatch helper for Vercel Functions.
 *
 * We use a single function file (api/index.ts) plus a rewrite in
 * vercel.json that routes all /api/* paths to /api. Vercel preserves
 * the original request path in the `x-vercel-path` header, so we
 * restore it before forwarding to the Express app.
 *
 * The Express app is lazy-loaded via dynamic import() to keep the
 * function's cold-start time minimal — heavy dependencies (firebase,
 * web-push, @google/genai) are only loaded when needed.
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
