import CartSummary from '../components/CartSummary.jsx'
import SectionHeader from '../components/SectionHeader.jsx'

export default function Cart() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Cart" title="Your Selected Items" text="Review products, guides, seminar tickets, and webinar tickets before checkout." />
      <div className="mx-auto max-w-3xl">
        <CartSummary />
      </div>
    </section>
  )
}
