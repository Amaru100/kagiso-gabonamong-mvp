import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useContent } from "../context/ContentContext.jsx";

const titles = {"/writings":"Writings","/books":"Books","/recommended-books":"Recommended Books","/work-with-me":"Work With Me","/contact":"Contact","/about":"About Kagiso Gabonamong","/resources":"Resources","/events":"Events","/premium-store":"Guides"};

export default function SiteMetadata() {
  const { pathname } = useLocation();
  const { content } = useContent();
  const article = content.articles.find((item) => item.published !== false && "/writings/" + item.id === pathname);
  useEffect(() => {
    const title = article?.title || titles[pathname];
    const description = article?.excerpt || content.settings.heroDescription;
    document.title = title ? title + " — Mystic Mind" : "Mystic Mind — Writings, Books & Ideas";
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = description;
    document.querySelector('meta[property="og:type"]').content = article ? "article" : "website";
  }, [article, pathname, content.settings.heroDescription]);
  return null;
}
