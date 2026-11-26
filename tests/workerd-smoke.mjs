import assert from "node:assert/strict";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { unstable_dev } from "wrangler";

const id = randomUUID();
const pdf = Buffer.from("%PDF-1.4\n%%EOF");
let role = "content_admin";
let mediaPath;
let published = false;

async function read(req) {
  const parts = [];
  for await (const chunk of req) parts.push(chunk);
  return Buffer.concat(parts);
}
const upstream = createServer(async (req, res) => {
  const path = new URL(req.url, "http://localhost").pathname;
  const json = (value, status = 200) => {
    res.writeHead(status, {"Content-Type": "application/json"});
    res.end(JSON.stringify(value));
  };
  try {
    assert.equal(req.headers.apikey, path.startsWith("/auth/") ? "fixture-anon" : "fixture-service");
    if (path === "/auth/v1/token") return json({access_token:"fixture-token", expires_in:3600});
    if (path === "/auth/v1/user") return json({id});
    if (path.endsWith("/mystic_admins")) return json([{role}]);
    if (path.endsWith("/mystic_activity")) return json([]);
    if (path.endsWith("/mystic_content")) return json([{revision:id, content:{settings:{},resources:published ? [{url:mediaPath}] : []}}]);
    if (path.endsWith("/mystic_media")) {
      if (req.method === "POST") {
        mediaPath = JSON.parse(await read(req)).url;
        return json([{url:mediaPath}]);
      }
      return json([{name:"Local.pdf",type:"application/pdf"}]);
    }
    if (path.endsWith("/mystic_submit_enquiry")) {
      assert.match(JSON.parse(await read(req)).fingerprint,/^[0-9a-f]{64}$/);
      return json("saved");
    }
    if (path.includes("/storage/")) {
      if (req.method === "POST") {
        assert.deepEqual(await read(req),pdf);
        return json({ok:true});
      }
      return res.end(pdf);
    }
    return json({error:"Unexpected fixture route"},404);
  } catch (error) {
    console.error(error.message);
    return json({error:"Fixture assertion failed"},500);
  }
});
await new Promise((resolve) => upstream.listen(0,"127.0.0.1",resolve));

let worker;
try {
  worker = await unstable_dev("worker/index.js", {
    config:"wrangler.jsonc", ip:"127.0.0.1", port:0, local:true,
    vars:{
      CLOUDFLARE_WORKER:"1",
      SITE_ORIGIN:"https://mysticmind.co.bw",
      SUPABASE_URL:"http://127.0.0.1:" + upstream.address().port,
      SUPABASE_ANON_KEY:"fixture-anon",
      SUPABASE_SERVICE_ROLE_KEY:"fixture-service",
      ENQUIRY_RATE_SECRET:"fixture-rate",
    },
    experimental:{disableExperimentalWarning:true},
  });
  const origin = "http://" + worker.address + ":" + worker.port;
  const request = (path, options) => fetch(origin+path,options);
  const post = (body) => ({
    method:"POST", headers:{Origin:origin,"Content-Type":"application/json"}, body:JSON.stringify(body),
  });
  const denied = await request("/api/admin");
  assert.equal(denied.status,401);
  assert.equal((await denied.json()).error,"Sign in to manage the website.");
  const login = await request("/api/admin",post({email:"test@example.org",password:"fixture-password"}));
  assert.equal(login.status,200,await login.text());
  assert.match(login.headers.get("set-cookie"),/HttpOnly; SameSite=Strict;.*Secure/);
  const cookie = login.headers.get("set-cookie").split(";")[0];
  const session = {headers:{cookie}};
  assert.equal((await (await request("/api/admin",session)).json()).uploadTransport,"binary");
  assert.equal((await request("/api/admin?view=activity",session)).status,403);
  role = "super_admin";
  assert.equal((await request("/api/admin?view=activity",session)).status,200);
  const upload = await request("/api/admin?view=media",{
    method:"POST",headers:{Origin:origin,cookie,"Content-Type":"application/pdf","X-Media-Name":"Local.pdf"},body:pdf,
  });
  assert.equal(upload.status,201,await upload.text());
  assert.equal((await request(mediaPath)).status,404);
  published = true;
  assert.deepEqual(Buffer.from(await (await request(mediaPath)).arrayBuffer()),pdf);
  assert.equal((await request("/api/enquiry",post({id,type:"contact",name:"Local Test",email:"test@example.org",subject:"Runtime test",message:"Fixture only"}))).status,200);
  console.log("Workerd runtime smoke passed: bindings, login, roles, media and enquiries.");
} finally {
  await worker?.stop();
  await new Promise((resolve) => upstream.close(resolve));
}
