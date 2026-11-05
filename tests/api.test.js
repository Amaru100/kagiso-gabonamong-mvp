import test, { after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const directory = await mkdtemp(join(tmpdir(), "kg-content-test-"));
const fixture = JSON.parse(
  await readFile(new URL("../src/data/content.json", import.meta.url), "utf8"),
);
process.env.CONTENT_FILE = join(directory, "content.json");
process.env.OWNER_PASSWORD = "test-only-owner-password-42";
delete process.env.VERCEL;
delete process.env.CONTENT_GITHUB_TOKEN;
const { default: handler, contentHandler } =
  await import("../server/admin-handler.js");
const { publicContent } = await import("../server/validation.js");
after(() => rm(directory, { recursive: true, force: true }));
beforeEach(() => writeFile(process.env.CONTENT_FILE, JSON.stringify(fixture)));
async function call(method, body, cookie, extra = {}, target = handler) {
  const headers = {};
  let output;
  const res = {
    statusCode: 200,
    setHeader(key, value) {
      headers[key.toLowerCase()] = value;
    },
    end(data) {
      output = JSON.parse(data);
    },
  };
  await target(
    {
      method,
      body,
      headers: {
        host: "localhost:5173",
        origin: "http://localhost:5173",
        ...(cookie ? { cookie } : {}),
        ...extra,
      },
    },
    res,
  );
  return { status: res.statusCode, body: output, headers };
}
async function login() {
  const result = await call("POST", { password: process.env.OWNER_PASSWORD });
  assert.equal(result.status, 200);
  return result.headers["set-cookie"].split(";")[0];
}
test("owner routes fail closed and reject forged sessions / cross-site requests", async () => {
  assert.equal((await call("GET")).status, 401);
  assert.equal(
    (await call("GET", null, "kg_owner=9999999999999.forged")).status,
    401,
  );
  assert.equal(
    (await call("PUT", { content: fixture, revision: "bad" })).status,
    401,
  );
  assert.equal(
    (
      await call("POST", { password: process.env.OWNER_PASSWORD }, null, {
        origin: "https://other.example",
      })
    ).status,
    403,
  );
  assert.equal((await call("PATCH")).status, 405);
});
test("owner session is HttpOnly, strict, expiring; missing configuration cannot sign in", async () => {
  const result = await call("POST", { password: process.env.OWNER_PASSWORD });
  assert.match(result.headers["set-cookie"], /HttpOnly; SameSite=Strict/);
  assert.match(result.headers["set-cookie"], /Max-Age=14400/);
  const saved = process.env.OWNER_PASSWORD;
  process.env.OWNER_PASSWORD = "";
  assert.equal((await call("POST", { password: saved })).status, 503);
  process.env.OWNER_PASSWORD = saved;
  const loggedOut = await call("DELETE");
  assert.match(loggedOut.headers["set-cookie"], /Max-Age=0/);
});
test("content CRUD persists, drafts stay private, and stale saves do not overwrite", async () => {
  const cookie = await login();
  const state = await call("GET", null, cookie);
  const content = structuredClone(state.body.content);
  content.articles[0].title = "An edited writing";
  content.articles.push({
    ...content.articles[0],
    id: "private-draft",
    title: "Private draft",
    published: false,
  });
  content.events.splice(0, 1);
  content.settings.authorBio = "The real story.";
  const result = await call(
    "PUT",
    { content, revision: state.body.revision },
    cookie,
  );
  assert.equal(result.status, 200);
  const persisted = JSON.parse(
    await readFile(process.env.CONTENT_FILE, "utf8"),
  );
  assert.equal(persisted.settings.authorBio, "The real story.");
  assert.equal(persisted.events.length, fixture.events.length - 1);
  const publicResult = await call("GET", null, null, {}, contentHandler);
  assert.equal(
    publicResult.body.content.articles[0].title,
    "An edited writing",
  );
  assert.equal(
    publicResult.body.content.articles.some(
      (item) => item.id === "private-draft",
    ),
    false,
  );
  assert.equal(
    publicContent(persisted).articles.some(
      (item) => item.id === "private-draft",
    ),
    false,
  );
  assert.equal(
    (await call("GET", null, cookie)).body.content.articles.at(-1).title,
    "Private draft",
  );
  assert.equal(
    (
      await call(
        "PUT",
        { content: fixture, revision: state.body.revision },
        cookie,
      )
    ).status,
    409,
  );
  assert.equal(
    (await call("GET", null, cookie)).body.content.settings.authorBio,
    "The real story.",
  );
});
test("reject dangerous asset URLs, malformed settings, duplicate IDs and oversized payloads", async () => {
  const cookie = await login();
  const state = (await call("GET", null, cookie)).body;
  for (const url of [
    "javascript:alert(1)",
    "//evil.example/photo.svg",
    "data:text/html,evil",
  ]) {
    const content = structuredClone(fixture);
    content.articles[0].image = url;
    assert.equal(
      (await call("PUT", { content, revision: state.revision }, cookie)).status,
      400,
    );
  }
  const duplicate = structuredClone(fixture);
  duplicate.articles.push(duplicate.articles[0]);
  assert.equal(
    (
      await call(
        "PUT",
        { content: duplicate, revision: state.revision },
        cookie,
      )
    ).status,
    400,
  );
  assert.equal(
    (await call("PUT", { content: {}, revision: state.revision }, cookie))
      .status,
    400,
  );
  assert.equal(
    (await call("PUT", { padding: "a".repeat(900001) }, cookie)).status,
    413,
  );
});
test("GitHub publishing sends the expected branch and revision; conflicts are reported", async () => {
  const cookie = await login();
  const originalFetch = globalThis.fetch;
  process.env.CONTENT_GITHUB_TOKEN = "test-placeholder";
  process.env.CONTENT_BRANCH = "main";
  let submitted;
  globalThis.fetch = async (url, options) => {
    assert.match(
      url,
      /api.github.com\/repos\/Amaru100\/kagiso-gabonamong-mvp\/contents\/src\/data\/content.json/,
    );
    submitted = JSON.parse(options.body);
    return {
      ok: true,
      status: 200,
      json: async () => ({ content: { sha: "updated-sha" } }),
    };
  };
  try {
    const result = await call(
      "PUT",
      { content: fixture, revision: "previous-sha" },
      cookie,
    );
    assert.equal(result.status, 200);
    assert.equal(submitted.branch, "main");
    assert.equal(submitted.sha, "previous-sha");
    assert.equal(
      JSON.parse(Buffer.from(submitted.content, "base64").toString()).settings
        .authorName,
      fixture.settings.authorName,
    );
    globalThis.fetch = async () => ({ ok: false, status: 409 });
    assert.equal(
      (await call("PUT", { content: fixture, revision: "old" }, cookie)).status,
      409,
    );
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.CONTENT_GITHUB_TOKEN;
  }
});
test("repeated incorrect passwords are rate limited", async () => {
  for (let i = 0; i < 8; i++)
    assert.equal(
      (
        await call("POST", { password: "wrong" }, null, {
          "x-forwarded-for": "test-rate-limit",
        })
      ).status,
      401,
    );
  assert.equal(
    (
      await call("POST", { password: "wrong" }, null, {
        "x-forwarded-for": "test-rate-limit",
      })
    ).status,
    429,
  );
});
test("malformed JSON is rejected and production without publishing secrets serves a public snapshot", async () => {
  assert.equal((await call('POST', '{broken')).status, 400)
  process.env.VERCEL = '1'
  try {
    const signedIn = await call('POST', { password: process.env.OWNER_PASSWORD })
    assert.match(signedIn.headers['set-cookie'], /; Secure/)
    const cookie = signedIn.headers['set-cookie'].split(';')[0]
    assert.equal((await call('GET', null, cookie)).status, 503)
    const publicResult = await call('GET', null, null, {}, contentHandler)
    assert.equal(publicResult.status, 200)
    assert.equal(publicResult.body.content.settings.authorName, fixture.settings.authorName)
  } finally { delete process.env.VERCEL }
})
