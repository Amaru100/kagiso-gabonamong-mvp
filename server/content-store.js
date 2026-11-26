import { databaseEnabled, rows, requestError } from "./database.js";
import { readFile, writeFile, rename } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import bundledContent from "../src/data/content.json" with { type: "json" };

const file = () =>
  (!process.env.VERCEL && process.env.CONTENT_FILE) ||
  fileURLToPath(new URL("../src/data/content.json", import.meta.url));
const revision = (data) => createHash("sha256").update(data).digest("hex");
const branch = () => process.env.CONTENT_BRANCH || "main";
export async function fallbackContent() {
  if (process.env.CLOUDFLARE_WORKER) return structuredClone(bundledContent);
  return JSON.parse(
    await readFile(
      new URL("../src/data/content.json", import.meta.url),
      "utf8",
    ),
  );
}
const endpoint = () =>
  `https://api.github.com/repos/${process.env.CONTENT_REPO || "Amaru100/kagiso-gabonamong-mvp"}/contents/src/data/content.json`;
function headers() {
  return {
    Authorization: `Bearer ${process.env.CONTENT_GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}
export async function readContent() {
  if (databaseEnabled()) {
    const [record] = await rows("mystic_content?id=eq.1&select=content,revision");
    if (!record) throw requestError(503, "Initial content must be seeded before publishing.");
    return record;
  }
  if (process.env.CLOUDFLARE_WORKER) return { content: await fallbackContent(), revision: null };
  if (process.env.VERCEL || process.env.CONTENT_GITHUB_TOKEN) {
    if (!process.env.CONTENT_GITHUB_TOKEN)
      throw Object.assign(
        new Error(
          "Publishing is not configured. Add CONTENT_GITHUB_TOKEN on the host.",
        ),
        { status: 503 },
      );
    const response = await fetch(
      `${endpoint()}?ref=${encodeURIComponent(branch())}`,
      { headers: headers(), signal: AbortSignal.timeout(12000) },
    );
    if (!response.ok)
      throw Object.assign(
        new Error(
          "Could not read the content repository. Check the publishing configuration.",
        ),
        { status: 503 },
      );
    const data = await response.json();
    return {
      content: JSON.parse(Buffer.from(data.content, "base64").toString()),
      revision: data.sha,
    };
  }
  const data = await readFile(file(), "utf8");
  return { content: JSON.parse(data), revision: revision(data) };
}
let localWrite = Promise.resolve();
export async function saveContent(content, expectedRevision, actor) {
  if (databaseEnabled()) {
    const revision = await rows("rpc/mystic_save_content", {method:"POST",body:{next_content:content, expected_revision:expectedRevision, editor:actor}});
    if (!revision) throw requestError(409, "Content changed. Reload before publishing.");
    return {revision};
  }
  if (process.env.CLOUDFLARE_WORKER) throw requestError(503, "Supabase is required to publish on Cloudflare.");
  if (process.env.VERCEL || process.env.CONTENT_GITHUB_TOKEN) {
    const response = await fetch(endpoint(), {
      method: "PUT",
      headers: { ...headers(), "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Update website content from owner dashboard",
        content: Buffer.from(JSON.stringify(content, null, 2) + "\n").toString(
          "base64",
        ),
        sha: expectedRevision,
        branch: branch(),
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 409 || response.status === 422)
      throw Object.assign(
        new Error(
          "Content changed in another session. Reload the dashboard before publishing.",
        ),
        { status: 409 },
      );
    if (!response.ok)
      throw Object.assign(
        new Error(
          "Publishing failed. Check repository write access and branch permissions.",
        ),
        { status: 503 },
      );
    return { revision: (await response.json()).content.sha };
  }
  const operation = localWrite
    .catch(() => {})
    .then(async () => {
      const latest = await readContent();
      if (latest.revision !== expectedRevision)
        throw Object.assign(
          new Error(
            "Content changed in another session. Reload before publishing.",
          ),
          { status: 409 },
        );
      const data = JSON.stringify(content, null, 2) + "\n";
      await writeFile(file() + ".tmp", data);
      await rename(file() + ".tmp", file());
      return { revision: revision(data) };
    });
  localWrite = operation;
  return operation;
}
