import ProductCard from "../components/ProductCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useContent, published } from "../context/ContentContext.jsx";

export default function PremiumStore() {
  const { content } = useContent();
  const products = published(content.products);
  return (
    <section className="m-wrap m-page">
      <SectionHeader
        eyebrow="The collection"
        title="Premium Guides And Toolkits"
        text="Explore the collection and enquire directly for availability and access."
      />
      <div className="grid gap-8 sm:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
