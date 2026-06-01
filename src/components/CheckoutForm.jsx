import { CreditCard, Smartphone, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button.jsx'
import { useCart } from '../context/CartContext.jsx'

const methods = [
  { id: 'Card', icon: CreditCard },
  { id: 'Orange Money', icon: Smartphone },
  { id: 'MyZaka', icon: Wallet },
]

export default function CheckoutForm() {
  const navigate = useNavigate()
  const { items, createOrder } = useCart()
  const [paymentMethod, setPaymentMethod] = useState('Card')
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', country: 'Botswana' })

  const submit = (event) => {
    event.preventDefault()
    if (items.length === 0) return
    createOrder(customer, paymentMethod)
    navigate('/thank-you')
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-white/10 bg-white/[0.035] p-6">
      <h2 className="text-xl font-black">Checkout Details</h2>
      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Full name
          <input required className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3 text-[#f8f4e8]" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Email address
          <input required type="email" className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3 text-[#f8f4e8]" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Phone number
          <input required className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3 text-[#f8f4e8]" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Country/region
          <input readOnly className="rounded-md border border-white/10 bg-[#111111] px-4 py-3 text-[#cfc8b5]" value={customer.country} />
        </label>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#d6b15e]">Payment Method</h3>
        <p className="mt-3 rounded-md border border-[#d6b15e]/25 bg-[#d6b15e]/10 p-3 text-sm text-[#f8f4e8]">Payment methods are placeholders for MVP demo purposes only.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {methods.map(({ id, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setPaymentMethod(id)} className={`min-h-14 rounded-md border px-4 py-3 text-sm font-bold transition ${paymentMethod === id ? 'border-[#d6b15e] bg-[#d6b15e] text-[#070707]' : 'border-white/10 text-[#f8f4e8] hover:bg-white/5'}`}>
              <span className="inline-flex items-center gap-2"><Icon size={18} /> {id}</span>
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" className="mt-8 w-full" disabled={items.length === 0}>Place Order</Button>
    </form>
  )
}
