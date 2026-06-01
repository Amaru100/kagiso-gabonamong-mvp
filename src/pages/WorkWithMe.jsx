import { BriefcaseBusiness, CalendarDays, Mic2, UsersRound, Video } from 'lucide-react'
import SectionHeader from '../components/SectionHeader.jsx'
import Button from '../components/Button.jsx'

const services = [
  { title: 'Seminars', icon: Mic2 },
  { title: 'Webinars', icon: Video },
  { title: 'Corporate talks', icon: BriefcaseBusiness },
  { title: 'Workshops', icon: UsersRound },
  { title: 'One-on-one advisory/coaching', icon: CalendarDays },
]

export default function WorkWithMe() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Work With Me" title="Booking And Enquiry" text="Invite Kagiso for seminars, webinars, corporate talks, workshops, or advisory sessions in Gaborone, Botswana." />
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          {services.map(({ title, icon: Icon }) => (
            <div key={title} className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-5">
              <Icon className="text-[#d6b15e]" size={24} />
              <span className="font-bold">{title}</span>
            </div>
          ))}
        </div>
        <form className="rounded-lg border border-[#d6b15e]/25 bg-[#111111] p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3" placeholder="Name" />
            <input className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3" placeholder="Email" type="email" />
            <input className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3" placeholder="Phone" />
            <select className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3">
              {services.map((service) => <option key={service.title}>{service.title}</option>)}
            </select>
            <input className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3 sm:col-span-2" type="date" />
            <textarea className="focus-ring min-h-36 rounded-md border border-white/10 bg-[#070707] px-4 py-3 sm:col-span-2" placeholder="Message" />
          </div>
          <Button className="mt-6 w-full">Send Enquiry</Button>
        </form>
      </div>
    </section>
  )
}
