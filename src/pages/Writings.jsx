import { useState } from "react";
import ArticleCard from "../components/ArticleCard.jsx";
import { useContent, published } from "../context/ContentContext.jsx";

export default function Writings() {
  const { content } = useContent();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const articles = published(content.articles);
  const categories = [...new Set(articles.map((article) => article.category).filter(Boolean))];
  const visible = articles.filter((article) => (!category || article.category === category) &&
    [article.title, article.excerpt].join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="m-wrap m-page">
    <h1>Writings</h1><p>Writing for people who never stop asking questions.</p>
    <div className="m-filters">
      <label>Search writings<input className="admin-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)}/></label>
      {categories.length > 1 && <label>Category<select className="admin-input" value={category} onChange={(event) => setCategory(event.target.value)}>
        <option value="">All categories</option>{categories.map((name) => <option key={name}>{name}</option>)}
      </select></label>}
    </div>
    {visible.length ? <div className="m-writing-grid">{visible.map((article) => <ArticleCard key={article.id} article={article}/>)}</div> : <p role="status">No writings match your search.</p>}
  </section>;
}
