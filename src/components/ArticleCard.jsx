import { Link } from "react-router-dom";

export function writingCover(article) {
  if (article.image && !/^\/art\/cover-\d+\.svg$/.test(article.image)) return article.image;
  const sketches = ["eye", "book", "lightbulb"];
  const index = [...article.id].reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return "/sketches/" + sketches[index % sketches.length] + ".svg";
}

export default function ArticleCard({ article }) {
  const path = "/writings/" + article.id;
  return <article className="m-entry">
    <Link to={path} aria-label={"Read " + article.title}><img src={writingCover(article)} alt="" loading="lazy" width="348" height="240"/></Link>
    <div><h3><Link to={path}>{article.title}</Link></h3>
      <p>{article.excerpt}</p>
      <Link className="m-link" to={path}>Read full post<span className="sr-only"> — {article.title}</span></Link>
      <div className="m-meta">{[article.author || "Kagiso Gabonamong", article.date, article.readingTime].filter(Boolean).join(" · ")}</div>
    </div>
  </article>;
}
