import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { publicContent } from "./server/validation.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const key of [
    "OWNER_PASSWORD",
    "CONTENT_GITHUB_TOKEN",
    "CONTENT_REPO",
    "CONTENT_BRANCH",
  ])
    if (!process.env.CONTENT_FILE && env[key] && !process.env[key])
      process.env[key] = env[key];
  return {
    plugins: [
      react(),
      {
        name: "owner-content",
        resolveId(id) {
          if (id === "virtual:public-content")
            return "\0virtual:public-content";
        },
        load(id) {
          if (id === "\0virtual:public-content")
            return `export default ${JSON.stringify(publicContent(JSON.parse(readFileSync(new URL("./src/data/content.json", import.meta.url), "utf8"))))}`;
        },
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const path = req.url?.split("?")[0];
            if (path !== "/api/admin" && path !== "/api/content") return next();
            const { default: admin, contentHandler } =
              await import("./server/admin-handler.js");
            await (path === "/api/admin" ? admin : contentHandler)(req, res);
          });
        },
      },
    ],
  };
});
