/** Minimal health check — no Express, no Firebase, no external deps. */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: "ok",
    time: new Date().toISOString(),
    runtime: "vercel-node",
    node: process.version,
  });
}
