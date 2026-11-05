import ProductCard from "../components/ProductCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useContent, published } from "../context/ContentContext.jsx";

export default function PremiumStore() {
  const { content } = useContent();
  const products = published(content.products);
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="The collection"
        title="Premium Guides And Toolkits"
        text="Explore the collection and enquire directly for availability and access."
      />
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
