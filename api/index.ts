/** Test: import only express, no other deps */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";

const app = express();
app.use(express.json());
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});
app.get("/api/*", (_req, res) => {
  res.json({ status: "catch-all", url: _req.url, time: new Date().toISOString() });
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.url && req.url.includes("?path=")) {
    req.url = req.url.replace(/\?path=[^&]*/, "").replace(/\?$/, "");
  }
  return app(req as any, res as any);
}
