/**
 * Minimal app.ts to isolate Vercel runtime issues.
 * Same imports as the full version, but only registers /api/health.
 */
import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import webpush from "web-push";
import fs from "fs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Suppress unused warnings
void path;
void GoogleGenAI;
void webpush;
void fs;
void createClient;
void SupabaseClient;

let _app: express.Application | null = null;

export async function getApp(): Promise<express.Application> {
  if (_app) return _app;
  console.log("[minimal-app] Initialising express app");
  const app = express();
  app.use(express.json());
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      time: new Date().toISOString(),
      runtime: "vercel-minimal",
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
  console.log("[minimal-app] Done");
  return app;
}

export default getApp;
