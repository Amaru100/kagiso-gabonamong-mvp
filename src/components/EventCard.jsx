import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import Button from "./Button.jsx";
export default function EventCard({ event }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-white/15 bg-[#101813] p-6">
      <p className="eyebrow">{event.kind}</p>
      <h3 className="mt-4 text-xl font-semibold">{event.title}</h3>
      <div className="mt-5 grid gap-3 text-sm text-[#bbc6bf]">
        <span className="inline-flex items-center gap-2">
          <CalendarDays size={17} />
          {event.date}
        </span>
        <span className="inline-flex items-center gap-2">
          <MapPin size={17} />
          {event.location}
        </span>
      </div>
      <p className="mt-5 flex-1 text-sm leading-7 text-[#bbc6bf]">
        {event.description}
      </p>
      <Button
        to={`/contact?subject=${encodeURIComponent("Event enquiry: " + event.title)}`}
        variant="secondary"
        className="mt-6"
      >
        Enquire about this event <ArrowUpRight size={16} />
      </Button>
    </article>
  );
}
