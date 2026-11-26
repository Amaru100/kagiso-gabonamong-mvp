import test, { after, beforeEach } from "node:test";

test("approved articles and supplied PDFs are preserved", async () => {
  const html = await readFile(new URL("../design-reference/mystic-mind-fixed-covers-and-about.html", import.meta.url),"utf8");
  for (const article of fixture.articles.slice(0,3)) {
    const raw = html.match(new RegExp('id="reader-'+article.id+'"[\\s\\S]*?<div class="reader-body">([\\s\\S]*?)</div><a class="reader-back'))[1];
    assert.equal(raw.replace(/<h1>[\s\S]*?<\/h1>/,"").trim(),article.bodyHtml);
    assert.equal(publicContent(fixture).articles.find((item)=>item.id===article.id).bodyHtml,article.bodyHtml);
  }
  const {createHash} = await import("node:crypto");
  const expected = ["bcc6eac5435069674f249e00246a211aefa74c7e7068d07d58c19cca02e71e98","220fa874e9a883d05984368b274193dae628581f302534bc124dd8661eea0b3c"];
  for (const [index,resource] of fixture.resources.slice(0,2).entries()) {
    const file = await readFile(new URL("../public"+resource.url,import.meta.url));
    assert.equal(createHash("sha256").update(file).digest("hex"),expected[index]);
  }
});

test("rich text keeps editorial formatting while dropping unsafe markup", async () => {
  const {sanitizeRichText} = await import("../src/richText.js");
  const rendered = sanitizeRichText('<p onclick="x()">Hello <em>world</em></p><svg onload="x()"></svg><a href="javascript:alert(1)">link</a>');
  assert.equal(rendered,"<p>Hello <em>world</em></p><a>link</a>");
});

test("enquiries report unavailable, validation failure, throttling and persisted success", async (t) => {
  const {default:enquiry} = await import("../server/enquiry-handler.js");
  const input = {id:"3771de80-6424-47fd-b702-346ef751291c",type:"service",category:"Workshops",name:"Editor Test",email:"test@example.org",subject:"Workshop",message:"Interested"};
  assert.equal((await call("POST",{...input,email:"bad"},null,{},enquiry)).status,400);
  assert.equal((await call("POST",input,null,{},enquiry)).status,503);
  assert.equal((await call("GET",null,null,{},enquiry)).status,405);
  const config = {SUPABASE_URL:"https://test.invalid",SUPABASE_SERVICE_ROLE_KEY:"test-key",ENQUIRY_RATE_SECRET:"test-rate-key"};
  Object.assign(process.env,config);
  t.after(()=>{for (const key of Object.keys(config)) delete process.env[key];});
  let submissions = 0;
  t.mock.method(globalThis,"fetch", async (url, options) => {
    assert.match(url,/mystic_submit_enquiry$/);
    const args = JSON.parse(options.body);
    assert.equal(args.entry.category,"Workshops");
    assert.match(args.fingerprint,/^[0-9a-f]{64}$/);
    return Response.json(++submissions === 1 ? "saved" : "limited");
  });
  assert.deepEqual((await call("POST",input,null,{},enquiry)).body,{ok:true});
  assert.equal((await call("POST",input,null,{},enquiry)).status,429);
});

test("configured CMS verifies administrator role and protects private modules", async (t) => {
  const config = {SUPABASE_URL:"https://test.invalid",SUPABASE_ANON_KEY:"test-anon",SUPABASE_SERVICE_ROLE_KEY:"test-key"};
  Object.assign(process.env,config);
  t.after(()=>{for (const key of Object.keys(config)) delete process.env[key];});
  const id = "3771de80-6424-47fd-b702-346ef751291c";
  t.mock.method(globalThis,"fetch",async (url)=>{
    if (url.endsWith("/user")) return Response.json({id});
    if (url.includes("mystic_admins")) return Response.json([{role:"content_admin"}]);
    if (url.includes("mystic_content")) return Response.json([{content:fixture,revision:id}]);
    if (url.includes("mystic_enquiries")) return Response.json([]);
    assert.fail("Unexpected database request: "+url);
  });
  const endpoint = (view) => (req,res)=>handler({...req,url:"/api/admin?view="+view},res);
  assert.equal((await call("GET",null,null,{},endpoint("enquiries"))).status,401);
  assert.equal((await call("POST",{},null,{},endpoint("media"))).status,401);
  assert.equal((await call("PUT",{id,role:"super_admin"},"mm_session=test-token",{},endpoint("administrators"))).status,403);
  assert.equal((await call("GET",null,"mm_session=test-token",{},endpoint("activity"))).status,403);
  assert.deepEqual((await call("GET",null,"mm_session=test-token",{},endpoint("enquiries"))).body,{records:[]});
  assert.equal((await call("GET",null,"mm_session=test-token")).body.role,"content_admin");
});

test("media rejects mismatched signatures and oversized uploads", async () => {
  const { checkedMedia } = await import("../server/media.js");
  const input = {type:"application/pdf",alt:"",name:"test.pdf"};
  assert.throws(()=>checkedMedia({...input,data:Buffer.from("<html>spoofed PDF</html>").toString("base64")}),/valid PDF/);
  assert.throws(()=>checkedMedia({...input,data:Buffer.alloc(3_000_001).toString("base64")}),/under 3 MB/);
  const file = await readFile(new URL("../public/ebooks/the-5-principles.pdf",import.meta.url));
  assert.equal(checkedMedia({...input,data:file.toString("base64")}).extension,"pdf");
});
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
const { default: handler, contentHandler } = await import(
  "../server/admin-handler.js"
);
const { publicContent } = await import("../server/validation.js");
const { validateContent } = await import("../server/validation.js");
after(() => rm(directory, { recursive: true, force: true }));
test("legacy sample resources stay out of public content and edited records survive", () => {
  const sample = {
    id:"clarity-creates-momentum-pdf",title:"Clarity Creates Momentum",format:"PDF",price:0,
    description:"A practical reflection guide for choosing the next right step with confidence.",url:"",published:true,
  };
  const restored = {...sample,url:"/ebooks/admin-upload.pdf"};
  const added = {...sample,id:"owner-resource",title:"An authorised new resource"};
  const configured = {...fixture,resources:[...fixture.resources,sample,restored,added]};
  assert.deepEqual(publicContent(configured).resources,[...fixture.resources,restored,added]);
  const validated = validateContent({...fixture,resources:[...fixture.resources,sample,added]});
  assert.deepEqual(validated.resources.map((item)=>item.id),[
    "the-time-series-and-imagination","the-5-principles","owner-resource",
  ]);
});
test("book content remains compatible with older content files and validates covers and types", () => {
  const legacy = structuredClone(fixture);
  delete legacy.books;
  assert.deepEqual(publicContent(legacy).books, []);
  assert.deepEqual(validateContent(legacy).books, []);
  const content = structuredClone(fixture);
  content.books[0].cover = "javascript:alert(1)";
  assert.throws(() => validateContent(content), /HTTPS/);
  content.books[0].cover = "/books/atomic-habits.jpg";
  content.books[0].kind = "unexpected";
  assert.throws(() => validateContent(content), /book type/);
  content.books[0].kind = "recommended";
  content.books[0].published = false;
  content.books[1].sample = false;
  content.books[1].featured = true;
  assert.equal(
    publicContent(validateContent(content)).books.length,
    fixture.books.filter((book)=>!book.sample && book.published !== false).length - 1,
  );
  assert.equal(publicContent(validateContent(content)).books[0].featured, true);
});
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
  assert.equal((await call("POST", "{broken")).status, 400);
  process.env.VERCEL = "1";
  try {
    const signedIn = await call("POST", {
      password: process.env.OWNER_PASSWORD,
    }, null, {origin:"https://localhost:5173"});
    assert.match(signedIn.headers["set-cookie"], /; Secure/);
    const cookie = signedIn.headers["set-cookie"].split(";")[0];
    assert.equal((await call("GET", null, cookie)).status, 503);
    const publicResult = await call("GET", null, null, {}, contentHandler);
    assert.equal(publicResult.status, 200);
    assert.equal(
      publicResult.body.content.settings.authorName,
      fixture.settings.authorName,
    );
  } finally {
    delete process.env.VERCEL;
  }
});

test("contact placeholders are gated and email drafts encode fields", async () => {
  const { contactRecipient, enquiryUrl } = await import("../src/contact.js");
  assert.equal(contactRecipient("hello@example.com"), "");
  assert.equal(contactRecipient("hello@kagisogabonamong.com"), "");
  assert.equal(contactRecipient("someone@example.org"), "");
  assert.equal(contactRecipient("name@business.test"), "name@business.test");
  const fields = new URLSearchParams({name:"Jane & Jim",email:"jane@business.test",subject:"Talk? Q&A",message:"Line one\nLine two"});
  const draft = new URL(enquiryUrl("owner@business.test", fields, "Workshops"));
  assert.equal(draft.pathname, "owner@business.test");
  assert.equal(draft.searchParams.get("subject"), "Talk? Q&A");
  assert.match(draft.searchParams.get("body"), /Enquiry type: Workshops\r\nName: Jane & Jim/);
  assert.match(draft.searchParams.get("body"), /Line one\nLine two/);
});

test("production seed accepts a bodyless insert and preserves existing content", async (t) => {
  const settings = { SUPABASE_URL: "https://test.invalid", SUPABASE_SERVICE_ROLE_KEY: "fixture-key" };
  const previous = Object.fromEntries(Object.keys(settings).map((name) => [name, process.env[name]]));
  Object.assign(process.env, settings);
  t.after(() => {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push(options.method);
    if (options.method === "POST") {
      assert.match(url, /mystic_content\?on_conflict=id$/);
      assert.match(options.headers.Prefer, /ignore-duplicates,return=minimal/);
      return new Response(null, { status: 201 });
    }
    assert.equal(options.method, "GET");
    return Response.json([{ content: fixture, revision: "original" }]);
  });
  await import("../scripts/seed.mjs");
  assert.deepEqual(calls, ["POST", "GET"]);
});
