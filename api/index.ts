/** Test: express + supabase */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/supabase-test", async (_req, res) => {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return res.json({ status: "no-creds", url: !!url, key: !!key });
  }
  try {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await sb.from("mosque_profile").select("*").limit(1);
    res.json({ status: "ok", data, error: error?.message });
  } catch (e: any) {
    res.status(500).json({ status: "error", message: e?.message });
  }
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
