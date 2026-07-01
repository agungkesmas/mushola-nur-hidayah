/**
 * Single Vercel Function entrypoint — inlined Express app for testing.
 *
 * All app code is inlined here to verify that the import path
 * `../src/server/app` is the issue (vs the app code itself).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import webpush from "web-push";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

// Suppress unused warnings
void path;
void GoogleGenAI;
void fs;
void createClient;

let _app: express.Application | null = null;

async function getApp(): Promise<express.Application> {
  if (_app) return _app;
  console.log("[inline] Initialising express app");
  const app = express();
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      time: new Date().toISOString(),
      runtime: "vercel-inline",
    });
  });
  app.get("/api/push/public-key", (_req, res) => {
    try {
      const keys = webpush.generateVAPIDKeys();
      res.json({ publicKey: keys.publicKey });
    } catch (e: any) {
      res.status(500).json({ error: e?.message });
    }
  });
  _app = app;
  console.log("[inline] Done");
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.url && req.url.includes("?path=")) {
      req.url = req.url.replace(/\?path=[^&]*/, "").replace(/\?$/, "");
    }
    const app = await getApp();
    return app(req as any, res as any);
  } catch (err: any) {
    console.error("[inline] Handler error:", err);
    res.status(500).json({
      status: "error",
      message: err?.message || "Unknown error",
      time: new Date().toISOString(),
    });
  }
}
