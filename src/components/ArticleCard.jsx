import { Link } from "react-router-dom";
export default function ArticleCard({ article }) {
  return (
    <article className="journal-card">
      <Link to={`/writings/${article.id}`} tabIndex={-1} aria-hidden="true">
        <img src={article.image || "/art/cover-1.svg"} alt="" loading="lazy" />
      </Link>
      <p className="writing-meta">
        {article.category} / {article.readingTime}
      </p>
      <h3>
        <Link to={`/writings/${article.id}`}>{article.title}</Link>
      </h3>
      <p className="journal-excerpt">{article.excerpt}</p>
      <Link className="text-link" to={`/writings/${article.id}`}>
        Read More
      </Link>
    </article>
  );
}
