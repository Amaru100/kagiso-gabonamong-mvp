import admin from "../api/admin.js";
import content from "../api/content.js";
import enquiry from "../api/enquiry.js";
import media from "../api/media.js";
import sitemap from "../api/sitemap.js";

const handlers = new Map([
  ["/api/admin", admin],
  ["/api/content", content],
  ["/api/enquiry", enquiry],
  ["/api/media", media],
  ["/api/sitemap", sitemap],
  ["/sitemap.xml", sitemap],
]);

async function respond(request, url, handler, {notifyEnquiry,recoveryEnabled} = {}) {
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  });
  const req = {
    worker: true,
    notifyEnquiry,
    recoveryEnabled,
    origin: url.origin,
    method: request.method,
    url: url.pathname + url.search,
    headers: Object.fromEntries(request.headers),
    async *[Symbol.asyncIterator]() {
      if (request.body) yield* request.body;
    },
  };
  let body;
  const res = {
    statusCode: 200,
    setHeader(name, value) { headers.set(name, value); },
    end(value) { body = value; },
  };
  try {
    await handler(req, res);
    return new Response(request.method === "HEAD" ? null : body, {status:res.statusCode, headers});
  } catch {
    return new Response('{"error":"The request could not be completed."}', {
      status:500, headers:{"Content-Type":"application/json","Cache-Control":"no-store"},
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    if (pathname.startsWith("/media/")) {
      url.searchParams.set("file", pathname.slice("/media/".length));
      return respond(request, url, media);
    }
    const handler = handlers.get(pathname);
    if (handler) {
      const notifyEnquiry = handler === enquiry && env.RESEND_API_KEY && ctx
        ? (id) => ctx.waitUntil(sendEnquiryNotification(env.RESEND_API_KEY, id))
        : undefined;
      return respond(request, url, handler, {notifyEnquiry,recoveryEnabled:env.PASSWORD_RECOVERY_ENABLED === "1"});
    }
    if (pathname === "/api" || pathname.startsWith("/api/") || pathname === "/media")
      return Response.json({error:"Not found."},{status:404,headers:{"Cache-Control":"no-store"}});
    if ((request.method === "GET" || request.method === "HEAD") &&
        (pathname === "/admin" || pathname.startsWith("/admin/"))) {
      const asset = await env.ASSETS.fetch(new Request(new URL("/index.html", url), {
        method:request.method, headers:request.headers,
      }));
      const headers = new Headers(asset.headers);
      headers.set("X-Robots-Tag","noindex, nofollow");
      headers.set("Cache-Control","no-store");
      return new Response(asset.body,{status:asset.status,headers});
    }
    return env.ASSETS.fetch(request);
  },
};

async function sendEnquiryNotification(key, id) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      redirect: "error",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        "Idempotency-Key": "mystic-enquiry/" + id,
      },
      body: JSON.stringify({
        from: "Mystic Mind <website@notifications.mysticmind.co.bw>",
        to: ["info@mysticmind.co.bw"],
        subject: "New Mystic Mind enquiry",
        text: "A new enquiry is available in the Mystic Mind dashboard.\n\nhttps://mysticmind.co.bw/admin",
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) console.error("Resend enquiry notification rejected:", response.status);
  } catch {
    console.error("Resend enquiry notification could not be sent.");
  }
}
