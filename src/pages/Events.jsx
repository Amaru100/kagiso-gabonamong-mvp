import EventCard from "../components/EventCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useContent, published } from "../context/ContentContext.jsx";

export default function Events() {
  const { content } = useContent();
  const events = published(content.events).toSorted((first, second) => (Date.parse(first.date) || Infinity) - (Date.parse(second.date) || Infinity));
  return (
    <section className="m-wrap m-page">
      <SectionHeader
        eyebrow="Events"
        title="Seminars, Webinars And Workshops"
        text="Seminars, webinars, and workshops. Contact us directly for availability and reservations."
      />
      <div className="grid gap-8">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
