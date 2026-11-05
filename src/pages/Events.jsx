import EventCard from "../components/EventCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useContent, published } from "../context/ContentContext.jsx";

export default function Events() {
  const { content } = useContent();
  const events = published(content.events);
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Events"
        title="Seminars, Webinars And Workshops"
        text="Seminars, webinars, and workshops. Contact us directly for availability and reservations."
      />
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
