import { ArrowDown, ArrowUpRight } from "lucide-react";
import ArticleCard from "../components/ArticleCard.jsx";
import ResourceCard from "../components/ResourceCard.jsx";
import ProductCard from "../components/ProductCard.jsx";
import EventCard from "../components/EventCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import Button from "../components/Button.jsx";
import { useContent, published } from "../context/ContentContext.jsx";
export default function Home() {
  const { content } = useContent();
  const { settings } = content;
  return (
    <>
      <section className="editorial-hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" /> Independent thinking. Intentional
            living.
          </p>
          <h1>{settings.heroTitle}</h1>
          <p className="hero-description">{settings.heroDescription}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/writings">
              Explore the writings <ArrowUpRight size={18} />
            </Button>
            <Button to="/work-with-me" variant="secondary">
              Start a conversation
            </Button>
          </div>
          <div className="hero-note">
            <ArrowDown size={16} />
            <span>A little perspective. A more deliberate life.</span>
          </div>
        </div>
        <div className="hero-art">
          <img
            src="/art/cover-5.svg"
            alt="An original engraved illustration of a doorway opening toward a distant sun"
          />
          <div className="art-caption">
            <span>01 / A study in perspective</span>
            <span>KG — Collected ideas</span>
          </div>
        </div>
      </section>
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="The writings"
          title="Ideas worth sitting with."
          text="Reflections on clarity, discipline, leadership, and the work of becoming."
        />
        <div className="mx-auto grid max-w-7xl items-stretch gap-7 md:grid-cols-3">
          {published(content.articles)
            .slice(0, 3)
            .map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
        </div>
        <div className="mt-10 text-center">
          <Button to="/writings" variant="secondary">
            All writings <ArrowUpRight size={17} />
          </Button>
        </div>
      </section>
      <section className="section-band px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Put it into practice"
          title="Small tools. Meaningful progress."
          text="Resources to bring a little more intention to your everyday work."
        />
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-4">
          {published(content.resources).map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Go a little deeper"
          title="Guides for the work ahead."
          text="Explore the collection. Get in touch for availability and access."
        />
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {published(content.products).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
      <section className="section-band px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Meet. Learn. Build."
          title="Conversations that move us."
          text="Seminars, workshops, and online sessions. Enquire directly to reserve your place."
        />
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {published(content.events).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </>
  );
}
