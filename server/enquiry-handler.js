import { createHmac } from "node:crypto";
import { rows, databaseReady } from "./database.js";
import { bodyOf, sameOrigin } from "./admin-handler.js";

export const services = ["Seminars", "Webinars", "Corporate talks", "Workshops", "One-on-one advisory/coaching"];

export function validateEnquiry(body) {
  const limits = {name:120,email:254,subject:200,message:4000};
  const result = {};
  for (const [key,max] of Object.entries(limits)) {
    const value = typeof body?.[key] === "string" ? body[key].trim() : "";
    if (!value || value.length > max) return null;
    result[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) return null;
  if (!["contact","service"].includes(body.type) || (body.type === "service" && !services.includes(body.category))) return null;
  if (body.type === "contact" && body.category) return null;
  if (body.website || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id || "")) return null;
  return {...result, id:body.id, type:body.type, category:body.category || null};
}

export default async function enquiryHandler(req,res) {
  res.setHeader("Content-Type","application/json");
  res.setHeader("Cache-Control","no-store");
  const send = (status,data) => {res.statusCode = status; res.end(JSON.stringify(data));};
  if (req.method !== "POST") return send(405,{error:"Method not allowed."});
  if (!sameOrigin(req)) return send(403,{error:"Submit from this website."});
  try {
    const input = validateEnquiry(await bodyOf(req));
    if (!input) return send(400,{error:"Check the enquiry fields and try again."});
    if (!databaseReady() || !process.env.ENQUIRY_RATE_SECRET) return send(503,{error:"Online enquiries are currently unavailable."});
    const ip = req.worker ? req.headers["cf-connecting-ip"] || "unknown" :
      req.headers["x-vercel-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "unknown";
    const fingerprint = createHmac("sha256",process.env.ENQUIRY_RATE_SECRET).update(ip).digest("hex");
    const result = await rows("rpc/mystic_submit_enquiry",{method:"POST",body:{entry:input, fingerprint}});
    if (result === "limited") return send(429,{error:"Too many enquiries. Try again later."});
    if (result !== "saved" && result !== "duplicate") return send(503,{error:"The enquiry could not be saved. Try again later."});
    return send(200,{ok:true});
  } catch (error) {
    return send(error.status === 400 || error.status === 413 ? error.status : 503,{error:"The enquiry could not be saved. Please try again."});
  }
}
