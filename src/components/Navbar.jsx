import { Menu, ShoppingBag, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

const links = [
  ['Home', '/'],
  ['About', '/about'],
  ['Writings', '/writings'],
  ['Resources', '/resources'],
  ['Premium Store', '/premium-store'],
  ['Events', '/events'],
  ['Work With Me', '/work-with-me'],
  ['Contact', '/contact'],
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { items } = useCart()
  const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-[#d6b15e]/14 text-[#d6b15e]' : 'text-[#f8f4e8] hover:bg-white/5'}`

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070707]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid h-11 w-11 place-items-center rounded-md border border-[#d6b15e]/50 bg-[#d6b15e] text-lg font-black text-[#070707]">KG</span>
          <span className="hidden text-sm font-bold uppercase tracking-[0.22em] text-[#f8f4e8] sm:block">Kagiso Gabonamong</span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([label, href]) => (
            <NavLink key={href} to={href} className={navClass}>
              {label}
            </NavLink>
          ))}
          <NavLink to="/cart" className="ml-2 inline-flex items-center gap-2 rounded-md border border-[#d6b15e]/40 px-3 py-2 text-sm font-bold text-[#d6b15e] hover:bg-[#d6b15e]/10">
            <ShoppingBag size={18} /> Cart {items.length > 0 && <span>({items.length})</span>}
          </NavLink>
        </nav>

        <button className="grid h-11 w-11 place-items-center rounded-md border border-white/15 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-4 pb-4 lg:hidden">
          <div className="grid gap-2">
            {links.map(([label, href]) => (
              <NavLink key={href} to={href} className={navClass} onClick={() => setOpen(false)}>
                {label}
              </NavLink>
            ))}
            <NavLink to="/cart" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#d6b15e] px-4 py-3 text-sm font-black text-[#070707]" onClick={() => setOpen(false)}>
              <ShoppingBag size={18} /> Cart {items.length > 0 && `(${items.length})`}
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  )
}
