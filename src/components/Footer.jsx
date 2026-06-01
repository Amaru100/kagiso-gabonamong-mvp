import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050505]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="mb-4 inline-grid h-12 w-12 place-items-center rounded-md bg-[#d6b15e] text-lg font-black text-[#070707]">KG</div>
          <p className="max-w-sm text-sm leading-6 text-[#cfc8b5]">Short writings, practical resources, and powerful seminars for people building with clarity from Gaborone, Botswana.</p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#d6b15e]">Explore</h3>
          <div className="grid gap-2 text-sm text-[#cfc8b5]">
            <Link to="/writings">Writings</Link>
            <Link to="/resources">Resources</Link>
            <Link to="/premium-store">Premium Store</Link>
            <Link to="/events">Events</Link>
            <Link to="/email-preview">Email Preview</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#d6b15e]">Contact</h3>
          <div className="grid gap-3 text-sm text-[#cfc8b5]">
            <span className="inline-flex items-center gap-2"><MapPin size={16} /> Gaborone, Botswana</span>
            <span className="inline-flex items-center gap-2"><Mail size={16} /> hello@kagisogabonamong.com</span>
            <span className="inline-flex items-center gap-2"><Phone size={16} /> +267 71 000 000</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-[#8f8879]">© 2026 Kagiso Gabonamong. MVP demo website.</div>
    </footer>
  )
}
