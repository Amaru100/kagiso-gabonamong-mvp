import EventCard from '../components/EventCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { events } from '../data/events.js'

export default function Events() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Events" title="Seminars, Webinars And Workshops" text="Upcoming demo events hosted from Gaborone, Botswana with ticket prices shown in BWP." />
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
        {events.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
    </section>
  )
}
