/**
 * Local dev entrypoint for Mushola Nur Hidayah.
 *
 * The actual Express app lives in `src/server/app.ts` and is exported
 * via `getApp()`. Vercel imports that function through
 * `api/[[...slug]].ts`; locally, run `npm run dev` which uses this
 * file via tsx.
 *
 * Functions: start the Express app on PORT (default 3000), with Vite
 * dev middleware attached for hot-reload during development.
 */
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { getApp } from "./src/server/app";

(async () => {
  const app = await getApp();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use((req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      const indexFile = path.join(distPath, "index.html");
      if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
      next();
    });
  }

  const PORT = parseInt(process.env.PORT || "3000", 10);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Mushola Nur Hidayah] Dev server running on http://0.0.0.0:${PORT}`);
  });
})().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
