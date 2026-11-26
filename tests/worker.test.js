import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import worker from "../worker/index.js";

const origin = "https://mysticmind.co.bw";
const userId = "3771de80-6424-47fd-b702-346ef751291c";
const mediaId = "466b19ef-16af-42ef-a1e8-c889c675778a.pdf";
const session = "mm_session=test-token";
const assetBinding = { ASSETS: { fetch: async () => new Response("<!doctype html>") } };
const call = (path, options) => worker.fetch(new Request(origin+path,options),assetBinding);

function configure(t, upstream) {
  const values = {
    CLOUDFLARE_WORKER:"1", SITE_ORIGIN:origin, SUPABASE_URL:"https://test.invalid",
    SUPABASE_ANON_KEY:"test-anon", SUPABASE_SERVICE_ROLE_KEY:"test-key", ENQUIRY_RATE_SECRET:"test-rate-key",
  };
  const original = Object.fromEntries(Object.keys(values).map((key)=>[key,process.env[key]]));
  Object.assign(process.env,values);
  t.after(()=>{
    for(const [key,value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key]; else process.env[key]=value;
    }
  });
  t.mock.method(globalThis,"fetch",upstream);
}

test("Worker serves fallback content, sitemap and unindexed SPA admin shell", async (t) => {
  configure(t,async () => assert.fail("Fallback content should not fetch Supabase"));
  delete process.env.SUPABASE_URL;
  const result = await call("/api/content");
  assert.equal(result.status,200);
  assert.equal((await result.json()).content.settings.email,"info@mysticmind.co.bw");
  assert.match(await (await call("/sitemap.xml")).text(), /https:\/\/mysticmind\.co\.bw\/writings\/game/);
  assert.equal((await call("/admin/login")).headers.get("X-Robots-Tag"),"noindex, nofollow");
  assert.equal((await call("/api/admin")).status,401);
  assert.equal((await call("/api/unknown")).status,404);
});

test("Worker admin sessions are secure and use the authorised Supabase role", async (t) => {
  configure(t,async (url,options)=>{
    assert.equal(options.redirect,"manual");
    if (url.includes("/token?")) return Response.json({access_token:"test-token",expires_in:3600});
    if (url.endsWith("/user")) return Response.json({id:userId});
    if (url.includes("mystic_admins")) return Response.json([{role:"content_admin"}]);
    if (url.includes("mystic_content")) return Response.json([{content:{},revision:userId}]);
    assert.fail("Unexpected request: "+url);
  });
  const credentials = {method:"POST",body:JSON.stringify({email:"admin@example.org",password:"test-password"})};
  assert.equal((await call("/api/admin",{...credentials,headers:{origin:"http://mysticmind.co.bw"}})).status,403);
  assert.equal((await call("/api/admin",{...credentials,headers:{origin,"content-length":"8193"}})).status,413);
  const login = await call("/api/admin",{...credentials,headers:{origin}});
  assert.equal(login.status,200);
  assert.match(login.headers.get("Set-Cookie"),/^mm_session=test-token;.*HttpOnly; SameSite=Strict;.*Secure$/);
  assert.equal((await (await call("/api/admin",{headers:{cookie:session}})).json()).uploadTransport,"binary");
  assert.equal((await call("/api/admin?view=administrators",{headers:{cookie:session}})).status,403);
});

test("Worker uses Cloudflare visitor IP for enquiries and preserves UTF-8 JSON", async (t) => {
  const ip = "192.0.2.8";
  configure(t,async (url,options)=>{
    assert.equal(options.redirect,"manual");
    assert.match(url,/mystic_submit_enquiry$/);
    const {entry,fingerprint}=JSON.parse(options.body);
    assert.equal(entry.message,"Olá e boa tarde.");
    assert.equal(fingerprint,createHmac("sha256","test-rate-key").update(ip).digest("hex"));
    return Response.json("saved");
  });
  const result = await call("/api/enquiry",{
    method:"POST",headers:{origin,"cf-connecting-ip":ip},
    body:JSON.stringify({id:userId,type:"contact",name:"Test",email:"test@example.org",subject:"Enquiry",message:"Olá e boa tarde."}),
  });
  assert.equal(result.status,200);
});

test("Worker accepts protected binary uploads and streams published media", async (t) => {
  const pdf = "%PDF-1.4\n%%EOF";
  let published = false;
  configure(t,async (url,options)=>{
    if (url.endsWith("/user")) return Response.json({id:userId});
    if (url.includes("mystic_admins")) return Response.json([{role:"content_admin"}]);
    if (url.includes("mystic_content")) return Response.json([{content:{settings:{},resources:published ? [{url:"/media/"+mediaId}]:[]},revision:userId}]);
    if (url.includes("mystic_media")) {
      if (options.method === "POST") {
        assert.equal(JSON.parse(options.body).name,"Example #1.pdf");
        return Response.json([{url:"/media/"+mediaId}]);
      }
      return Response.json([{type:"application/pdf",name:"File.pdf"}]);
    }
    if (url.includes("/storage/") && options.method === "POST") {
      assert.equal(options.body.toString(),pdf);
      return new Response(null,{status:200});
    }
    if (url.includes("/storage/")) return new Response(pdf);
    assert.fail("Unexpected request: "+url);
  });
  const upload = {method:"POST",headers:{origin,"content-type":"application/pdf","x-media-name":"Example%20%231.pdf"},body:pdf};
  assert.equal((await call("/api/admin?view=media",upload)).status,401);
  assert.equal((await call("/api/admin?view=media",{...upload,headers:{...upload.headers,cookie:session,"content-length":"3000001"}})).status,413);
  assert.equal((await call("/api/admin?view=media",{...upload,headers:{...upload.headers,cookie:session}})).status,201);
  assert.equal((await call("/media/"+mediaId)).status,404);
  published = true;
  const response = await call("/media/"+mediaId);
  assert.equal(response.status,200);
  assert.equal(response.headers.get("Content-Disposition"),'attachment; filename="File.pdf"');
  assert.equal(await response.text(),pdf);
});

test("Dashboard uses exact enquiry counts and protects activity and administrator management", async (t) => {
  let role = "content_admin";
  configure(t,async (url,options)=>{
    if (url.endsWith("/user")) return Response.json({id:userId,email:"editor@example.org"});
    if (url.includes("mystic_admins")) return Response.json([{role}]);
    if (url.includes("mystic_enquiries")) {
      assert.equal(options.headers.Prefer,"count=exact");
      return Response.json([{id:userId}],{headers:{"Content-Range":"0-0/247"}});
    }
    if (url.includes("mystic_activity")) {
      assert.equal(role,"super_admin");
      return Response.json([{id:"audit",action:"publish"}]);
    }
    assert.fail("Unexpected upstream route");
  });
  const headers={cookie:session};
  assert.equal((await call("/api/admin?view=overview")).status,401);
  assert.deepEqual(await (await call("/api/admin?view=overview",{headers})).json(),{unread:247,activity:[]});
  assert.equal((await call("/api/admin?view=administrators",{method:"PUT",headers:{...headers,origin},body:"{}"})).status,403);
  role="super_admin";
  assert.deepEqual(await (await call("/api/admin?view=overview",{headers})).json(),{unread:247,activity:[{id:"audit",action:"publish"}]});
});

test("Password changes require a same-origin session and correct current password", async (t) => {
  let updates=0;
  configure(t,async (url,options)=>{
    if (url.endsWith("/user") && options.method==="GET") return Response.json({id:userId,email:"editor@example.org"});
    if (url.includes("mystic_admins")) return Response.json([{role:"content_admin"}]);
    if (url.includes("/token?")) {
      const {email,password}=JSON.parse(options.body);
      assert.equal(email,"editor@example.org");
      return password==="fixture-old-password" ? Response.json({user:{id:userId},access_token:"fixture-fresh-token"}) : new Response(null,{status:400});
    }
    if (url.endsWith("/user") && options.method==="PUT") {
      updates++;
      assert.equal(options.headers.Authorization,"Bearer fixture-fresh-token");
      assert.deepEqual(JSON.parse(options.body),{password:"fixture-new-password",current_password:"fixture-old-password"});
      return Response.json({id:userId});
    }
    if (url.endsWith("/logout?scope=global")) return new Response(null,{status:204});
    assert.fail("Unexpected upstream route");
  });
  const change=(headers,currentPassword,newPassword="fixture-new-password")=>call("/api/admin?view=password",{
    method:"POST",headers,body:JSON.stringify({currentPassword,newPassword}),
  });
  assert.equal((await change({origin},"fixture-old-password")).status,401);
  assert.equal((await change({cookie:session},"fixture-old-password")).status,403);
  assert.equal((await change({origin,cookie:session},"wrong-password")).status,401);
  assert.equal((await change({origin,cookie:session},"fixture-old-password","short")).status,400);
  const success=await change({origin,cookie:session},"fixture-old-password");
  assert.equal(success.status,200);
  assert.deepEqual(await success.json(),{ok:true});
  assert.match(success.headers.get("Set-Cookie"),/Max-Age=0/);
  assert.equal(updates,1);
});

test("An administrator can set a password with an unused recovery link without returning tokens", async (t) => {
  const tokenHash="a".repeat(56);
  let used=false;
  configure(t,async (url,options)=>{
    if (url.endsWith("/verify")) {
      assert.deepEqual(JSON.parse(options.body),{token_hash:tokenHash,type:"recovery"});
      if (used) return new Response(null,{status:400});
      used=true;
      return Response.json({user:{id:userId},access_token:"test-token"});
    }
    if (url.endsWith("/user") && options.method==="GET") return Response.json({id:userId});
    if (url.includes("mystic_admins")) return Response.json([{role:"content_admin"}]);
    if (url.endsWith("/user") && options.method==="PUT") {
      assert.deepEqual(JSON.parse(options.body),{password:"fixture-setup-password"});
      return Response.json({id:userId});
    }
    if (url.endsWith("/logout?scope=global")) return new Response(null,{status:204});
    assert.fail("Unexpected upstream route");
  });
  const setup=(headers)=>call("/api/admin?view=setup",{method:"POST",headers,body:JSON.stringify({tokenHash,newPassword:"fixture-setup-password"})});
  assert.equal((await setup({})).status,403);
  const result=await setup({origin});
  assert.equal(result.status,200);
  assert.deepEqual(await result.json(),{ok:true});
  assert.match(result.headers.get("Set-Cookie"),/Max-Age=0/);
  assert.equal((await setup({origin})).status,400);
});
