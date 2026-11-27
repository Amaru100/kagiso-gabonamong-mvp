import { uploadMedia } from "./media.js";
import { administrator, authRequest, databaseRequest, databaseEnabled, rows, requestError } from "./database.js";
import { createHmac, timingSafeEqual, scrypt as rawScrypt } from "node:crypto";
import { promisify } from "node:util";
import { readContent, saveContent, fallbackContent } from "./content-store.js";
import { publicContent, validateContent } from "./validation.js";
const scrypt = promisify(rawScrypt);
const ttl = 60 * 60 * 4;
const attempts = new Map();
const password = () => process.env.OWNER_PASSWORD || "";
const configured = () => password().length >= 16;
const sign = (payload) =>
  createHmac("sha256", password()).update(payload).digest("base64url");
const equal = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
function legacyAuthorized(req) {
  if (!configured()) return false;
  const token = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("kg_owner="))
    ?.slice(9);
  if (!token) return false;
  const [expires, signature] = token.split(".");
  return (
    Number(expires) > Date.now() &&
    Number(expires) < Date.now() + ttl * 1000 + 10000 &&
    equal(signature || "", sign(expires))
  );
}
function cookie(res, value, age, name = "kg_owner") {
  res.setHeader(
    "Set-Cookie",
    `${name}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${process.env.VERCEL || process.env.CLOUDFLARE_WORKER ? "; Secure" : ""}`,
  );
}
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (req.origin) return url.origin === req.origin;
    return url.host === req.headers.host && (process.env.VERCEL ? url.protocol === "https:" : ["https:", "http:"].includes(url.protocol));
  } catch {
    return false;
  }
}
async function readBytes(req, limit) {
  const declared = Number(req.headers["content-length"]);
  if (declared > limit) throw requestError(413, "Content is too large.");
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    length += bytes.length;
    if (length > limit) throw requestError(413, "Content is too large.");
    chunks.push(bytes);
  }
  return Buffer.concat(chunks, length);
}
export async function bodyOf(req, limit = 900000) {
  if (req.body !== undefined) {
    const text =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(text) > limit)
      throw Object.assign(new Error("Content is too large."), { status: 413 });
    try {
      return JSON.parse(text);
    } catch {
      throw Object.assign(new Error("Invalid request."), { status: 400 });
    }
  }
  const text = (await readBytes(req, limit)).toString("utf8");
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw Object.assign(new Error("Invalid request."), { status: 400 });
  }
}
async function databaseAdmin(req, res, send) {
  const mode = new URL(req.url || "/api/admin", "http://localhost").searchParams.get("view");
  if (req.method !== "GET" && !sameOrigin(req)) return send(403,{error:"This request must come from this website."});
  const token = (req.headers.cookie || "").match(/(?:^|;\s*)mm_session=([^;]+)/)?.[1];
  const recoveryEnabled = req.recoveryEnabled ?? (process.env.PASSWORD_RECOVERY_ENABLED === "1");
  if (mode === "recover" && req.method === "POST") {
    if (!recoveryEnabled)
      return send(503,{error:"Email password recovery is unavailable. Contact the site administrator."});
    const body = await bodyOf(req,8192);
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return send(400,{error:"Enter a valid email address."});
    try {
      const result = await authRequest("recover",{method:"POST",body:{email}});
      if (result.status >= 500) console.error("Supabase password recovery request failed:", result.status);
    } catch {
      console.error("Supabase password recovery is unavailable.");
    }
    return send(202,{ok:true});
  }
  if (mode === "setup" && req.method === "POST") {
    const {tokenHash,newPassword} = await bodyOf(req,8192);
    if (typeof tokenHash !== "string" || !/^[a-z0-9]{40,128}$/i.test(tokenHash) ||
      typeof newPassword !== "string" || newPassword.length < 12 || Buffer.byteLength(newPassword) > 72)
      return send(400,{error:"Use a valid setup link and a password of at least 12 characters and at most 72 bytes."});
    const verified = await authRequest("verify",{method:"POST",body:{token_hash:tokenHash,type:"recovery"}});
    if (!verified.ok) return send(verified.status === 429 ? 429 : verified.status >= 500 ? 503 : 400,{error:"This setup link has expired, was already used, or cannot be verified. Ask the site developer for a new link."});
    const session = await verified.json();
    const member = await administrator(session.access_token);
    if (!member || member.id !== session.user?.id) return send(403,{error:"This account is not authorised for the workspace."});
    const changed = await authRequest("user",{method:"PUT",token:session.access_token,body:{password:newPassword}});
    await authRequest("logout?scope=global",{method:"POST",token:session.access_token}).catch(()=>{});
    if (!changed.ok) return send(400,{error:"The password could not be set. Ask the site developer for a new link."});
    cookie(res,"",0,"mm_session");
    return send(200,{ok:true});
  }
  if (req.method === "DELETE") {
    cookie(res,"",0,"mm_session");
    if (token) await authRequest("logout", { method:"POST", token });
    return send(200,{ok:true});
  }
  if (req.method === "POST" && !mode) {
    const body = await bodyOf(req, 8192);
    const { email, password } = body || {};
    if (typeof email !== "string" || email.length > 254 || typeof password !== "string" || password.length > 512)
      return send(400,{error:"Enter your email and password."});
    const response = await authRequest("token?grant_type=password",{method:"POST",body:{email,password}});
    if ((response.status >= 300 && response.status < 400) || response.status >= 500)
      return send(503,{error:"Administrator sign-in is temporarily unavailable."});
    if (!response.ok) return send(response.status === 429 ? 429 : 401,{error:"Sign-in failed. Check your credentials or try again later."});
    const session = await response.json();
    const actor = await administrator(session.access_token);
    if (!actor) return send(403,{error:"This account has no administrator access."});
    cookie(res,session.access_token,Math.min(3600,Number(session.expires_in) || 3600),"mm_session");
    return send(200,{ok:true});
  }
  const actor = await administrator(token);
  if (!actor) return send(401,{mode:"supabase",recoveryEnabled,error:"Sign in to manage the website."});
  if (mode === "overview" && req.method === "GET") {
    const response = await databaseRequest("mystic_enquiries?select=id&status=eq.new&limit=1",{prefer:"count=exact"});
    const count = response.headers.get("Content-Range")?.match(/\/(\d+)$/)?.[1];
    const activity = actor.role === "super_admin" ? await rows("mystic_activity?order=created_at.desc&limit=5") : [];
    return send(200,{unread:response.ok && count !== undefined ? Number(count) : null,activity});
  }
  if (mode === "password" && req.method === "POST") {
    const {currentPassword,newPassword} = await bodyOf(req,8192);
    if (!actor.email || typeof currentPassword !== "string" || !currentPassword || currentPassword.length > 512 ||
      typeof newPassword !== "string" || newPassword.length < 12 || Buffer.byteLength(newPassword) > 72 || currentPassword === newPassword)
      return send(400,{error:"Enter your current password and a different new password of at least 12 characters and at most 72 bytes."});
    const verified = await authRequest("token?grant_type=password",{method:"POST",body:{email:actor.email,password:currentPassword}});
    if (!verified.ok) return send(verified.status === 429 ? 429 : verified.status >= 500 ? 503 : 401,{error:"Could not verify the current password. Check it or try again later."});
    const session = await verified.json();
    if (session.user?.id !== actor.id || !session.access_token) return send(401,{error:"Could not verify this account."});
    const changed = await authRequest("user",{method:"PUT",token:session.access_token,body:{password:newPassword,current_password:currentPassword}});
    if (!changed.ok) return send(changed.status >= 500 ? 503 : 400,{error:"Could not update the password. Choose a stronger password or try again later."});
    cookie(res,"",0,"mm_session");
    await authRequest("logout?scope=global",{method:"POST",token:session.access_token}).catch(()=>{});
    return send(200,{ok:true});
  }
  if (mode === "media") {
    if (req.method === "GET") return send(200,{records:await rows("mystic_media?select=path,url,type,alt,name&order=created_at.desc&limit=200")});
    if (req.method === "POST") {
      let input;
      if (req.worker) {
        try {
          input = {
            type: req.headers["content-type"],
            name: decodeURIComponent(req.headers["x-media-name"] || ""),
            alt: decodeURIComponent(req.headers["x-media-alt"] || ""),
          };
        } catch {
          return send(400,{error:"Invalid media metadata."});
        }
        input.data = await readBytes(req,3_000_000);
      } else {
        input = await bodyOf(req,4_100_000);
      }
      return send(201,{item:await uploadMedia(input,actor.id)});
    }
  }
  if (mode === "enquiries") {
    if (req.method === "GET") return send(200,{records:await rows("mystic_enquiries?select=id,type,category,name,email,subject,message,status,created_at&order=created_at.desc&limit=200")});
    if (req.method === "PUT") {
      const { id, status } = await bodyOf(req);
      if (!/^[0-9a-f-]{36}$/i.test(id) || !["new","read","replied","archived"].includes(status)) return send(400,{error:"Invalid enquiry update."});
      const updated = await rows("mystic_enquiries?id=eq." + id,{method:"PATCH",body:{status},prefer:"return=representation"});
      return updated.length ? send(200,{ok:true}) : send(404,{error:"Enquiry not found."});
    }
  }
  if (mode === "activity" && req.method === "GET") {
    if (actor.role !== "super_admin") return send(403,{error:"Super Admin access required."});
    return send(200,{records:await rows("mystic_activity?order=created_at.desc&limit=200")});
  }
  if (mode === "administrators") {
    if (actor.role !== "super_admin") return send(403,{error:"Super Admin access required."});
    if (req.method === "GET") return send(200,{records:await rows("mystic_admins?order=role")});
    if (req.method === "PUT") {
      const { id, role } = await bodyOf(req);
      if (id === actor.id || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id) || !["content_admin","super_admin","revoked"].includes(role)) return send(400,{error:"Invalid account or role."});
      await rows("rpc/mystic_set_role",{method:"POST",body:{editor:actor.id,target_user:id,next_role:role}});
      return send(200,{ok:true});
    }
  }
  if (mode) return send(405,{error:"Method not allowed."});
  if (req.method === "GET") return send(200,{...await readContent(),role:actor.role, email:actor.email, accountId:actor.id, recoveryEnabled, ...(req.worker ? {uploadTransport:"binary"} : {})});
  if (req.method === "PUT") {
    const body = await bodyOf(req);
    let content;
    try { content = validateContent(body.content); }
    catch (error) { return send(400,{error:error.message}); }
    if (!/^[0-9a-f-]{36}$/i.test(body.revision || "")) return send(400,{error:"Missing content revision."});
    return send(200,{...await saveContent(content,body.revision,actor.id),content});
  }
  return send(405,{error:"Method not allowed."});
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  const send = (status, data) => {
    res.statusCode = status;
    res.end(JSON.stringify(data));
  };
  try {
    if (databaseEnabled()) return await databaseAdmin(req, res, send);
    if (req.worker) return send(401,{mode:"supabase",error:"Administrator access needs setup. Configure Supabase on the Worker."});
    if (req.method === "GET") {
      if (!legacyAuthorized(req))
        return send(401, {
          configured: configured(),
          error: configured()
            ? "Sign in to manage your site."
            : "Owner access needs setup. Add an OWNER_PASSWORD of at least 16 characters on the host.",
        });
      return send(200, await readContent());
    }
    if (!["POST", "PUT", "DELETE"].includes(req.method)) {
      res.setHeader("Allow", "GET, POST, PUT, DELETE");
      return send(405, { error: "Method not allowed." });
    }
    if (!sameOrigin(req))
      return send(403, { error: "This request must come from this website." });
    if (req.method === "DELETE") {
      cookie(res, "", 0);
      return send(200, { ok: true });
    }
    if (!configured())
      return send(503, {
        error:
          "Owner access needs setup. Add an OWNER_PASSWORD of at least 16 characters on the host.",
      });
    if (req.method === "POST") {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket?.remoteAddress ||
        "unknown";
      const now = Date.now();
      for (const [key, value] of attempts)
        if (value.until < now) attempts.delete(key);
      const rate = attempts.get(ip) || {
        count: 0,
        until: now + 15 * 60 * 1000,
      };
      if (rate.count >= 8) {
        res.setHeader("Retry-After", "900");
        return send(429, {
          error: "Too many attempts. Try again in 15 minutes.",
        });
      }
      rate.count++;
      attempts.set(ip, rate);
      const body = await bodyOf(req);
      if (typeof body.password !== "string" || body.password.length > 512)
        return send(401, { error: "Incorrect password." });
      const [supplied, expected] = await Promise.all([
        scrypt(body.password, "kg-owner-login", 64),
        scrypt(password(), "kg-owner-login", 64),
      ]);
      if (!timingSafeEqual(supplied, expected))
        return send(401, { error: "Incorrect password." });
      attempts.delete(ip);
      const expires = String(Date.now() + ttl * 1000);
      cookie(res, `${expires}.${sign(expires)}`, ttl);
      return send(200, { ok: true });
    }
    if (!legacyAuthorized(req))
      return send(401, { error: "Your session expired. Sign in again." });
    const body = await bodyOf(req);
    let content;
    try {
      content = validateContent(body.content);
    } catch (error) {
      return send(400, { error: error.message });
    }
    if (typeof body.revision !== "string" || !body.revision)
      return send(400, {
        error: "Missing content revision. Reload before publishing.",
      });
    return send(200, {
      ...(await saveContent(content, body.revision)),
      content,
    });
  } catch (error) {
    return send(error.status || 500, {
      error: error.status
        ? error.message
        : "The request could not be completed. Please try again.",
    });
  }
}
export async function contentHandler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed." }));
    return;
  }
  try {
    res.end(
      JSON.stringify({ content: publicContent((await readContent()).content) }),
    );
  } catch {
    if (databaseEnabled()) {
      res.statusCode = 503;
      return res.end(JSON.stringify({error:"Published content is temporarily unavailable."}));
    }
    try {
      res.end(
        JSON.stringify({ content: publicContent(await fallbackContent()) }),
      );
    } catch {
      res.statusCode = 503;
      res.end(
        JSON.stringify({
          error:
            "Live content unavailable. The website uses its last published version.",
        }),
      );
    }
  }
}
import { Buffer } from "node:buffer";
