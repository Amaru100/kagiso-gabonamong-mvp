import { Link } from "react-router-dom";
import ResourceCard from "../components/ResourceCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import EventCard from "../components/EventCard.jsx";
import BooksSection from "../components/BooksSection.jsx";
import { useContent, published } from "../context/ContentContext.jsx";

export default function Home() {
  const { content } = useContent();
  const { settings } = content;
  const writings = published(content.articles);
  const latest = writings[0];
  return (
    <div className="writer-home">
      <section className="writer-intro">
        <div className="writer-introduction">
          <h1>{settings.heroTitle}</h1>
          <p>{settings.heroDescription}</p>
          <Link className="text-link" to="/about">
            More about Kagiso
          </Link>
        </div>
        {latest && (
          <article className="featured-writing">
            <Link
              to={`/writings/${latest.id}`}
              aria-label={`Read ${latest.title}`}
            >
              <img src={latest.image || "/art/cover-1.svg"} alt="" />
            </Link>
            <p className="writing-meta">Latest writing / {latest.category}</p>
            <h2>
              <Link to={`/writings/${latest.id}`}>{latest.title}</Link>
            </h2>
            <p className="featured-excerpt">{latest.excerpt}</p>
          </article>
        )}
      </section>
      <section className="editorial-section" aria-labelledby="writings-heading">
        <div className="section-margin">
          <h2 id="writings-heading">Writings</h2>
          <p>On mindset, leadership, and building a business.</p>
          <Link to="/writings" className="text-link">
            All writings
          </Link>
        </div>
        <div className="writing-index">
          {writings.slice(latest ? 1 : 0, 4).map((article) => (
            <article key={article.id} className="writing-row">
              <div>
                <p className="writing-meta">
                  {article.category} / {article.readingTime}
                </p>
                <h3>
                  <Link to={`/writings/${article.id}`}>{article.title}</Link>
                </h3>
                <p>{article.excerpt}</p>
              </div>
              <Link
                to={`/writings/${article.id}`}
                tabIndex={-1}
                aria-hidden="true"
              >
                <img
                  src={article.image || "/art/cover-1.svg"}
                  alt=""
                  loading="lazy"
                />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <BooksSection />
      <section
        className="editorial-section"
        aria-labelledby="resources-heading"
      >
        <div className="section-margin">
          <h2 id="resources-heading">Resources</h2>
          <p>Worksheets and practical guides to use in your own work.</p>
          <Link to="/resources" className="text-link">
            All resources
          </Link>
        </div>
        <div className="editorial-resource-grid">
          {published(content.resources).map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>
      <section className="editorial-section" aria-labelledby="guides-heading">
        <div className="section-margin">
          <h2 id="guides-heading">Guides</h2>
          <p>Longer reads and workbooks. Enquire directly for access.</p>
        </div>
        <div className="editorial-resource-grid">
          {published(content.products).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <section className="editorial-section" aria-labelledby="events-heading">
        <div className="section-margin">
          <h2 id="events-heading">Events</h2>
          <p>Seminars, webinars, and workshops.</p>
          <Link to="/events" className="text-link">
            All events
          </Link>
        </div>
        <div className="editorial-resource-grid">
          {published(content.events).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
