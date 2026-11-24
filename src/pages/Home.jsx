import { Link } from "react-router-dom";
import { useContent, published } from "../context/ContentContext.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import BooksSection from "../components/BooksSection.jsx";
import AboutSection from "../components/AboutSection.jsx";

export default function Home() {
  const { content } = useContent();
  const { settings } = content;
  const feature = published(content.resources).find((resource) => resource.featured) || published(content.resources)[0];
  const hasRecommendations = (content.books || []).some((book) => book.published !== false && book.featured && !book.sample && book.kind !== "own" && book.cover && book.author && book.description);
  return <div className="m-wrap">
    <section className="m-hero">
      <h1>{settings.heroTitle === "Kagiso Gabonamong" ? "Read widely.\nThink deeply.\nLive fully." : settings.heroTitle}</h1>
      <p>{settings.heroDescription}</p><Link to="/writings" className="m-link">Explore the writings</Link>
    </section>
    <section className="m-section">
      <p className="m-label">RESOURCES</p><h2>Ideas worth<br/>keeping.</h2>
      <p>Explore the writings, books, and tools that shape the conversation.</p>
      {feature && <article className="m-feature">
        <div className="m-feature-copy"><p className="m-label">FEATURED RESOURCE</p><h3>{feature.title}</h3><p>{feature.description}</p>
          <Link className="m-link" to="/resources">Explore resources</Link>
        </div>
        <div className="m-feature-art" aria-hidden="true">{feature.cover ? <img src={feature.cover} alt="" /> : <div className="m-feature-paper">{feature.title}</div>}</div>
      </article>}
      <div className="m-resource-grid">
        <article><div className="m-resource-art m-resource-green" aria-hidden="true">THE<br/>WRITING<br/>ARCHIVE.</div><h3>Essays &amp; Reflections</h3><p>Thoughtful reading on the ideas, experiences, and questions that matter.</p><Link className="m-link" to="/writings">Explore the archive</Link></article>
        <article><div className="m-resource-art" aria-hidden="true">NOTES<br/>&amp; GUIDES.</div><h3>Guides &amp; Resources</h3><p>A growing collection of practical guides and materials for readers.</p><Link className="m-link" to="/resources">See resources</Link></article>
      </div>
    </section>
    <section className="m-section">
      <p className="m-label">THE BLOG</p><h2>Explore your<br/>curiosity.</h2>
      <p>Writing for people who never stop asking questions.</p>
      {published(content.articles).slice(0,3).map((article) => <ArticleCard key={article.id} article={article}/>)}
      <Link className="m-link" to="/writings">View all writings</Link>
    </section>
    {hasRecommendations && <section className="m-section"><h2>Books worth your time.</h2>
      <p>{settings.recommendationsDescription || "A selection of books recommended by Kagiso, with a personal note on why each is worth reading."}</p>
      <BooksSection recommended featured/><Link className="m-link" to="/recommended-books">View all recommended books</Link></section>}
    <AboutSection />
    <section className="m-newsletter"><h2>A New Perspective<br/>Starts Here.</h2><p>Follow the latest writings, resources, and book announcements.</p>
      {settings.newsletterUrl ? <a className="m-button" href={settings.newsletterUrl}>Get the Letters</a> : <p>Newsletter subscriptions are currently unavailable.</p>}
    </section>
  </div>;
}
