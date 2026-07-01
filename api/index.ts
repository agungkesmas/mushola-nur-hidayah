/**
 * Single Vercel Function entrypoint for the entire /api/* namespace.
 *
 * Vercel Hobby plan limits deployments to 12 serverless functions,
 * so we consolidate all Express routes into a single function file
 * and use `vercel.json` `rewrites` to route every /api/* path here.
 *
 * The original URL is preserved by Vercel in `req.url` (or
 * `req.headers['x-vercel-path']` in some edge cases), so Express
 * route matching works transparently.
 *
 * Errors during app initialisation are caught and returned as a JSON
 * 500 response so the cause is visible in the Vercel dashboard.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dispatch } from "./_dispatch";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return dispatch(req, res);
}
