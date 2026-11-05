import ArticleCard from "../components/ArticleCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useContent, published } from "../context/ContentContext.jsx";

export default function Writings() {
  const { content } = useContent();
  const articles = published(content.articles);
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Writings"
        title="Articles For Clearer Action"
        text="Reflections on mindset, leadership, clarity, and meaningful work."
      />
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
