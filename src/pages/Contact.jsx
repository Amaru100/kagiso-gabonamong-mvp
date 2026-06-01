import { Globe2, Mail, MapPin, MessageCircle, Phone, Share2 } from 'lucide-react'
import SectionHeader from '../components/SectionHeader.jsx'
import Button from '../components/Button.jsx'

export default function Contact() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Contact" title="Connect With Kagiso" text="For bookings, resources, writing enquiries, and seminar conversations." />
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-[#d6b15e]/25 bg-[#111111] p-6">
          <h2 className="text-2xl font-black">Contact Details</h2>
          <div className="mt-6 grid gap-4 text-[#cfc8b5]">
            <span className="inline-flex items-center gap-3"><MapPin className="text-[#d6b15e]" size={20} /> Gaborone, Botswana</span>
            <span className="inline-flex items-center gap-3"><Mail className="text-[#d6b15e]" size={20} /> hello@kagisogabonamong.com</span>
            <span className="inline-flex items-center gap-3"><Phone className="text-[#d6b15e]" size={20} /> +267 71 000 000</span>
          </div>
          <div className="mt-8 flex gap-3">
            {[Globe2, MessageCircle, Share2].map((Icon, index) => (
              <a key={index} href="#" className="grid h-11 w-11 place-items-center rounded-md border border-white/10 text-[#d6b15e]" aria-label="Social media placeholder">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
        <form className="rounded-lg border border-white/10 bg-white/[0.035] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3" placeholder="Name" />
            <input className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3" placeholder="Email" type="email" />
            <input className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3 sm:col-span-2" placeholder="Subject" />
            <textarea className="focus-ring min-h-36 rounded-md border border-white/10 bg-[#070707] px-4 py-3 sm:col-span-2" placeholder="Message" />
          </div>
          <Button className="mt-6 w-full">Send Message</Button>
        </form>
      </div>
    </section>
  )
}
