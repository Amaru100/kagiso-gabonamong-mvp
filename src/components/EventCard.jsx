import { Link } from "react-router-dom";
export default function EventCard({ event }) {
  const timestamp = Date.parse(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <article className="catalog-note">
      <p className="writing-meta">{[event.kind, Number.isFinite(timestamp) && (timestamp < today.getTime() ? "Past" : "Upcoming")].filter(Boolean).join(" / ")}</p>
      <h3>{event.title}</h3>
      <p className="catalog-details">
        {event.date}
        <br />
        {event.location}
      </p>
      <p className="catalog-description">{event.description}</p>
      {event.url ? <a className="m-link" href={event.url}>Event details and registration</a> : <Link
        className="text-link"
        to={`/contact?subject=${encodeURIComponent("Event enquiry: " + event.title)}`}
      >
        Enquire about this event
      </Link>}
    </article>
  );
}
