import { BriefcaseBusiness, CalendarDays, Check, Mic2, UsersRound, Video } from 'lucide-react'
import { useRef, useState } from 'react'
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
  const [selectedService, setSelectedService] = useState(services[0].title)
  const formRef = useRef(null)

  const chooseService = (title) => {
    setSelectedService(title)
    if (window.innerWidth < 1024) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Work With Me" title="Booking And Enquiry" text="Invite Kagiso for seminars, webinars, corporate talks, workshops, or advisory sessions in Gaborone, Botswana." />
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          {services.map(({ title, icon: Icon }) => {
            const active = selectedService === title
            return (
              <button
                key={title}
                type="button"
                onClick={() => chooseService(title)}
                className={`flex min-h-20 items-center justify-between gap-4 rounded-lg border p-5 text-left transition ${
                  active
                    ? 'border-[#d6b15e] bg-[#d6b15e] text-[#070707] shadow-xl shadow-[#d6b15e]/10'
                    : 'border-white/10 bg-white/[0.035] text-[#f8f4e8] hover:border-[#d6b15e]/60 hover:bg-[#d6b15e]/10'
                }`}
              >
                <span className="inline-flex items-center gap-4">
                  <Icon className={active ? 'text-[#070707]' : 'text-[#d6b15e]'} size={24} />
                  <span className="font-bold">{title}</span>
                </span>
                {active && <Check size={20} />}
              </button>
            )
          })}
        </div>
        <form ref={formRef} className="scroll-mt-28 rounded-lg border border-[#d6b15e]/25 bg-[#111111] p-6">
          <p className="mb-5 rounded-md border border-[#d6b15e]/25 bg-[#d6b15e]/10 px-4 py-3 text-sm font-bold text-[#d6b15e]">You are enquiring about: {selectedService}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3" placeholder="Name" />
            <input className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3" placeholder="Email" type="email" />
            <input className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3" placeholder="Phone" />
            <select className="focus-ring rounded-md border border-white/10 bg-[#070707] px-4 py-3" value={selectedService} onChange={(event) => setSelectedService(event.target.value)}>
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
