import CartSummary from '../components/CartSummary.jsx'
import CheckoutForm from '../components/CheckoutForm.jsx'
import SectionHeader from '../components/SectionHeader.jsx'

export default function Checkout() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Checkout" title="Complete Demo Order" text="No real payment will be processed. This MVP uses local demo order data only." />
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_0.8fr]">
        <CheckoutForm />
        <CartSummary checkout />
      </div>
    </section>
  )
}
