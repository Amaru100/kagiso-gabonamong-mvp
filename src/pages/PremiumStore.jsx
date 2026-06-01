import ProductCard from '../components/ProductCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { products } from '../data/products.js'

export default function PremiumStore() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Premium Store" title="Premium Guides And Toolkits" text="Paid demo products in BWP. Add items to cart and use the placeholder checkout flow." />
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  )
}
