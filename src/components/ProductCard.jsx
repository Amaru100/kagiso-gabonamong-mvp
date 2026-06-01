import { ShoppingCart } from 'lucide-react'
import Button from './Button.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  return (
    <article className="flex h-full flex-col rounded-lg border border-[#d6b15e]/25 bg-[#111111] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b15e]">{product.category}</p>
      <h3 className="mt-4 text-xl font-black">{product.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[#cfc8b5]">{product.description}</p>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-2xl font-black text-[#d6b15e]">BWP {product.price.toFixed(2)}</span>
        <Button onClick={() => addItem(product)}>
          <ShoppingCart size={18} /> Add to Cart
        </Button>
      </div>
    </article>
  )
}
