import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import Button from './Button.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function CartSummary({ checkout = false }) {
  const { items, removeItem, subtotal, tax, total } = useCart()

  return (
    <div className="rounded-lg border border-[#d6b15e]/25 bg-[#111111] p-6">
      <h2 className="text-xl font-black">Order Summary</h2>
      <div className="mt-5 grid gap-4">
        {items.length === 0 ? (
          <p className="text-sm text-[#cfc8b5]">Your cart is empty.</p>
        ) : (
          items.map((item) => (
            <div key={item.cartId} className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-bold text-[#f8f4e8]">{item.title}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8f8879]">{item.type || item.category}</p>
                <p className="mt-2 text-sm font-bold text-[#d6b15e]">BWP {item.price.toFixed(2)}</p>
              </div>
              {!checkout && (
                <button className="grid h-10 w-10 place-items-center rounded-md border border-white/10 text-[#cfc8b5] hover:text-[#d6b15e]" onClick={() => removeItem(item.cartId)} aria-label={`Remove ${item.title}`}>
                  <Trash2 size={17} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
      <div className="mt-6 grid gap-3 text-sm">
        <div className="flex justify-between text-[#cfc8b5]"><span>Subtotal</span><span>BWP {subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-[#cfc8b5]"><span>Tax</span><span>BWP {tax.toFixed(2)}</span></div>
        <div className="flex justify-between border-t border-white/10 pt-4 text-lg font-black"><span>Total</span><span>BWP {total.toFixed(2)}</span></div>
      </div>
      {!checkout && (
        <div className="mt-6">
          {items.length > 0 ? <Button to="/checkout" className="w-full">Proceed to Checkout</Button> : <Link to="/premium-store" className="text-sm font-bold text-[#d6b15e]">Browse premium offers</Link>}
        </div>
      )}
    </div>
  )
}
