/** MINIMAL test — no heavy imports. Just to verify the function runs. */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    status: "ok",
    url: req.url,
    method: req.method,
    time: new Date().toISOString(),
    node: process.version,
    env_VERCEL: process.env.VERCEL,
    env_VERCEL_ENV: process.env.VERCEL_ENV,
  });
}
