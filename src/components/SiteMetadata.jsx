import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useContent } from "../context/ContentContext.jsx";

const titles = {"/mission":"Mission","/testimonials":"Testimonials","/privacy":"Privacy Policy","/writings":"Writings","/books":"Books","/recommended-books":"Recommended Books","/work-with-me":"Work With Me","/contact":"Contact","/about":"About Kagiso Gabonamong","/resources":"Resources","/events":"Events","/premium-store":"Guides"};

export default function SiteMetadata() {
  const { pathname } = useLocation();
  const { content } = useContent();
  const article = content.articles.find((item) => item.published !== false && "/writings/" + item.id === pathname);
  useEffect(() => {
    const title = article?.seoTitle || article?.title || titles[pathname];
    const description = article?.seoDescription || article?.excerpt || content.settings.seoDescription || content.settings.heroDescription;
    const siteName = content.settings.siteName || "Mystic Mind";
    document.title = title ? title + " \u2014 " + siteName : siteName + " \u2014 Writings, Books & Ideas";
    document.querySelector('meta[property="og:site_name"]').content = siteName;
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = description;
    document.querySelector('meta[property="og:type"]').content = article ? "article" : "website";
    const source = import.meta.env.VITE_SITE_ORIGIN;
    if (source && (title || pathname === "/")) {
      let origin;
      try { const url = new URL(source); if (url.protocol !== "https:") return; origin = url.origin; } catch { return; }
      const sharing = document.createElement("meta");
      sharing.setAttribute("property","og:image");
      sharing.content = origin + "/brand/share.png";
      document.head.append(sharing);
      const canonical = Object.assign(document.createElement("link"), {rel:"canonical",href:origin + pathname});
      document.head.append(canonical);
      const structured = document.createElement("script");
      structured.type = "application/ld+json";
      structured.textContent = JSON.stringify({"@context":"https://schema.org",...(article ? {"@type":"Article",headline:article.title,author:{"@type":"Person",name:article.author || "Kagiso Gabonamong"},...(article.date ? {datePublished:article.date} : {})} : {"@type":"WebSite",name:"Mystic Mind",author:{"@type":"Person",name:"Kagiso Gabonamong"}}),url:origin + pathname});
      document.head.append(structured);
      return () => {canonical.remove();structured.remove();sharing.remove();};
    }
  }, [article, pathname, content.settings]);
  return null;
}
