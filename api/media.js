import { sanitizeRichText } from "../src/richText.js";
import { administrator, databaseReady, rows } from "../server/database.js";
import { readContent } from "../server/content-store.js";
import { publicContent } from "../server/validation.js";

export default async function handler(req,res) {
  res.setHeader("Cache-Control","private, no-store");
  res.setHeader("X-Content-Type-Options","nosniff");
  if (req.method !== "GET" && req.method !== "HEAD") { res.statusCode=405; return res.end(); }
  const id = req.query?.file ?? new URL(req.url,"http://localhost").searchParams.get("file");
  if (!databaseReady() || !/^[0-9a-f-]{36}\.(pdf|png|jpg|webp)$/.test(id || "")) { res.statusCode=404; return res.end(); }
  try {
    const url = "/media/" + id;
    const token = (req.headers.cookie || "").match(/(?:^|;\s*)mm_session=([^;]+)/)?.[1];
    const actor = token ? await administrator(token) : null;
    if (!actor) {
      const { content } = await readContent();
      const published = publicContent(content);
      const inline = (html) => sanitizeRichText(html || "").includes('<img src="' + url + '" ');
      const listed = published.settings.authorPhoto === url || inline(published.settings.authorBioHtml) || inline(published.settings.missionHtml) ||
        Object.values(published).some((collection) => Array.isArray(collection) &&
          collection.some((item) => [item.url,item.image,item.cover].includes(url) || inline(item.bodyHtml)));
      if (!listed) { res.statusCode=404; return res.end(); }
    }
    const [record] = await rows("mystic_media?path=eq."+id+"&select=type,name");
    if (!record) { res.statusCode=404; return res.end(); }
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const response = await fetch(process.env.SUPABASE_URL.replace(/\/$/,"")+"/storage/v1/object/authenticated/mystic-media/"+id,
      {method:req.method,redirect:"manual",headers:{apikey:key, Authorization:"Bearer "+key},signal:AbortSignal.timeout(12000)});
    if (!response.ok) { res.statusCode=503; return res.end(); }
    res.setHeader("Content-Type",record.type);
    if (record.type === "application/pdf") {
      const name = record.name.replace(/[^a-z0-9_. -]/gi,"_");
      res.setHeader("Content-Disposition",'attachment; filename="' + name + '"');
    }
    if (req.method === "HEAD") return res.end();
    return res.end(req.worker ? response.body : Buffer.from(await response.arrayBuffer()));
  } catch {
    res.statusCode=503;
    return res.end();
  }
}
import { Buffer } from "node:buffer";
