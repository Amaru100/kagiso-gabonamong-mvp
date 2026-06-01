import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import { useCart } from '../context/CartContext.jsx'

const demoOrder = {
  id: 'KG-DEMO-10001',
  items: [
    { title: 'Clarity Creates Momentum', type: 'guide', price: 99 },
    { title: 'Build. Lead. Impact.', type: 'seminar ticket', price: 250 },
  ],
  total: 349,
}

export default function ThankYou() {
  const { lastOrder } = useCart()
  const order = lastOrder || demoOrder

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-lg border border-[#d6b15e]/25 bg-[#111111] p-8 text-center">
        <CheckCircle2 className="mx-auto text-[#d6b15e]" size={62} />
        <h1 className="mt-6 text-4xl font-black">Thank you.</h1>
        <p className="mt-3 text-xl font-bold text-[#f8f4e8]">Your order was successful.</p>
        <p className="mt-2 text-sm text-[#cfc8b5]">Demo order number: <span className="font-bold text-[#d6b15e]">{order.id}</span></p>

        <div className="mt-8 rounded-lg border border-white/10 bg-[#070707] p-5 text-left">
          <h2 className="text-lg font-black">Order Summary</h2>
          <div className="mt-4 grid gap-3">
            {order.items.map((item, index) => (
              <div key={`${item.title}-${index}`} className="flex justify-between gap-4 text-sm">
                <span>{item.title}<span className="block text-xs uppercase tracking-[0.16em] text-[#8f8879]">{item.type}</span></span>
                <span className="font-bold text-[#d6b15e]">BWP {item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-white/10 pt-4 text-lg font-black">
            <span>Total paid</span>
            <span>BWP {order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-3 text-sm leading-6 text-[#cfc8b5]">
          <p>A confirmation email will be sent with your payment receipt and order details.</p>
          <p>If you purchased a digital product, the email will include your download access link.</p>
          <p>If you purchased a seminar or webinar ticket, the email will include your ticket details, access instructions, and event information.</p>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/">Continue Exploring</Button>
          <Link to="/email-preview" className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#d6b15e]/45 px-5 py-3 text-sm font-bold text-[#d6b15e]">View Email Preview</Link>
        </div>
      </div>
    </section>
  )
}
