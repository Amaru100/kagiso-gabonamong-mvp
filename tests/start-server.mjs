import { mkdtemp, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "vite";
const directory = await mkdtemp(join(tmpdir(), "kg-browser-test-"));
process.env.CONTENT_FILE = join(directory, "content.json");
process.env.OWNER_PASSWORD = "test-only-owner-password-42";
delete process.env.CONTENT_GITHUB_TOKEN;
delete process.env.VERCEL;
await copyFile(
  new URL("../src/data/content.json", import.meta.url),
  process.env.CONTENT_FILE,
);
const server = await createServer({
  server: { host: "127.0.0.1", port: 5174, strictPort: true },
});
await server.listen();
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await server.close();
    await rm(directory, { recursive: true, force: true });
    process.exit(0);
  });
