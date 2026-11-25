import { readContent, fallbackContent } from "../server/content-store.js";
import { databaseEnabled } from "../server/database.js";
import { publicContent } from "../server/validation.js";

const paths = ["", "/resources", "/writings", "/books", "/recommended-books", "/about", "/mission", "/testimonials", "/work-with-me", "/contact", "/privacy", "/events", "/premium-store"];
const escape = (value) => value.replace(/[<>&"']/g, (character) => ({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&apos;"})[character]);

export default async function sitemap(req,res) {
  if (req.method !== "GET") {res.statusCode=405;return res.end();}
  let origin;
  try {
    const url = new URL(process.env.SITE_ORIGIN);
    if (url.protocol !== "https:" || url.username || url.password) throw new Error("Invalid origin");
    origin = url.origin;
  } catch {res.statusCode=404;return res.end();}
  try {
    const content = await readContent().then((result)=>result.content).catch((error)=>{
      if (databaseEnabled()) throw error;
      return fallbackContent();
    });
    const writingPaths = publicContent(content).articles.map((article)=>"/writings/"+encodeURIComponent(article.id));
    const entries = [...paths,...writingPaths].map((path)=>"<url><loc>"+escape(origin+path)+"</loc></url>").join("");
    res.setHeader("Content-Type","application/xml; charset=utf-8");
    res.setHeader("Cache-Control","no-store");
    return res.end('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+entries+"</urlset>");
  } catch {res.statusCode=503;return res.end();}
}
