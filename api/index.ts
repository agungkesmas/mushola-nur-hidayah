/** Test: import getApp from src/server/app */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getApp } from "../src/server/app";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.url && req.url.includes("?path=")) {
      req.url = req.url.replace(/\?path=[^&]*/, "").replace(/\?$/, "");
    }
    const app = await getApp();
    return app(req as any, res as any);
  } catch (err: any) {
    console.error("[handler] error:", err);
    res.status(500).json({
      status: "error",
      message: err?.message || "Unknown error",
      stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
      code: err?.code,
      time: new Date().toISOString(),
    });
  }
}
