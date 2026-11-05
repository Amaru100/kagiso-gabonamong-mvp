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
function authorized(req) {
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
function cookie(res, value, age) {
  res.setHeader(
    "Set-Cookie",
    `kg_owner=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${process.env.VERCEL ? "; Secure" : ""}`,
  );
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}
async function bodyOf(req) {
  if (req.body !== undefined) {
    const text =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(text) > 900000)
      throw Object.assign(new Error("Content is too large."), { status: 413 });
    try {
      return JSON.parse(text);
    } catch {
      throw Object.assign(new Error("Invalid request."), { status: 400 });
    }
  }
  let text = "";
  for await (const chunk of req) {
    text += chunk;
    if (Buffer.byteLength(text) > 900000)
      throw Object.assign(new Error("Content is too large."), { status: 413 });
  }
  try {
    return JSON.parse(text || "{}");
  } catch {
    throw Object.assign(new Error("Invalid request."), { status: 400 });
  }
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
    if (req.method === "GET") {
      if (!authorized(req))
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
    if (!authorized(req))
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
