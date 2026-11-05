import { Link } from "react-router-dom";
export default function EventCard({ event }) {
  return (
    <article className="catalog-note">
      <p className="writing-meta">{event.kind}</p>
      <h3>{event.title}</h3>
      <p className="catalog-details">
        {event.date}
        <br />
        {event.location}
      </p>
      <p className="catalog-description">{event.description}</p>
      <Link
        className="text-link"
        to={`/contact?subject=${encodeURIComponent("Event enquiry: " + event.title)}`}
      >
        Enquire about this event
      </Link>
    </article>
  );
}
