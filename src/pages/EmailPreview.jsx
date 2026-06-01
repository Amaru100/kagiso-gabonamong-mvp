import SectionHeader from '../components/SectionHeader.jsx'
import MonogramLogo from '../components/MonogramLogo.jsx'
import { useCart } from '../context/CartContext.jsx'

const fallback = {
  id: 'KG-DEMO-10001',
  customer: { name: 'Demo Customer' },
  items: [
    { title: 'Clarity Creates Momentum', type: 'guide', price: 99 },
    { title: 'Clarity & Focus Masterclass', type: 'webinar ticket', price: 150 },
  ],
  total: 249,
}

export default function EmailPreview() {
  const { lastOrder } = useCart()
  const order = lastOrder || fallback
  const hasDigital = order.items.some((item) => ['guide', 'toolkit', 'workbook'].includes(item.type))
  const hasEvent = order.items.some((item) => item.type?.includes('ticket'))

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Email Preview" title="Confirmation Email Demo" text="This page previews the confirmation email layout. It does not send real email." />
      <div className="mx-auto max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-[#f8f4e8] text-[#111111]">
        <div className="bg-[#070707] p-6 text-[#f8f4e8]">
          <MonogramLogo size="md" />
          <h1 className="mt-4 text-2xl font-black">Kagiso Gabonamong</h1>
          <p className="text-sm text-[#cfc8b5]">Order confirmation from Gaborone, Botswana</p>
        </div>
        <div className="p-6">
          <p className="text-lg font-bold">Hi {order.customer?.name || 'there'},</p>
          <p className="mt-3 leading-7">Thank you for your demo order. Your order number is <strong>{order.id}</strong>.</p>
          <div className="mt-6 rounded-md border border-[#d6b15e]/40 p-4">
            <h2 className="font-black">Order Summary</h2>
            <div className="mt-4 grid gap-3">
              {order.items.map((item, index) => (
                <div key={`${item.title}-${index}`} className="flex justify-between gap-4 text-sm">
                  <span>{item.title}<span className="block text-xs uppercase tracking-[0.12em] text-[#666]">{item.type}</span></span>
                  <span className="font-bold">BWP {item.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-[#d6b15e]/30 pt-4 text-lg font-black">
              <span>Total paid</span>
              <span>BWP {order.total.toFixed(2)}</span>
            </div>
          </div>
          <p className="mt-6">Receipt note: this MVP confirmation is a placeholder preview and no real payment has been processed.</p>
          {hasDigital && <p className="mt-4"><strong>Download access:</strong> https://kagisogabonamong.com/demo-download-link</p>}
          {hasEvent && <p className="mt-4"><strong>Ticket/access details:</strong> Your ticket details, access instructions, and event information will appear here.</p>}
          <p className="mt-6">For support, contact hello@kagisogabonamong.com or +267 71 000 000.</p>
        </div>
        <div className="bg-[#111111] p-5 text-center text-sm text-[#f8f4e8]">KG · Kagiso Gabonamong · Gaborone, Botswana</div>
      </div>
    </section>
  )
}
