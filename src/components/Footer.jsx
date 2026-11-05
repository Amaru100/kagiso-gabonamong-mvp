import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import MonogramLogo from "./MonogramLogo.jsx";
import { useContent } from "../context/ContentContext.jsx";

export default function Footer() {
  const {
    content: { settings },
  } = useContent();
  return (
    <footer className="border-t border-white/10 bg-[#050505]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <MonogramLogo size="md" className="mb-4" />
          <p className="max-w-sm text-sm leading-6 text-[#bbc6bf]">
            Short writings, practical resources, and powerful seminars for
            people building with clarity from Gaborone, Botswana.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#8dc6a7]">
            Explore
          </h3>
          <div className="grid gap-2 text-sm text-[#bbc6bf]">
            <Link to="/writings">Writings</Link>
            <Link to="/resources">Resources</Link>
            <Link to="/premium-store">Guides</Link>
            <Link to="/events">Events</Link>
            <Link to="/admin">Owner login</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#8dc6a7]">
            Contact
          </h3>
          <div className="grid gap-3 text-sm text-[#bbc6bf]">
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} /> {settings.location}
            </span>
            <a
              href={`mailto:${settings.email}`}
              className="inline-flex items-center gap-2"
            >
              <Mail size={16} /> {settings.email}
            </a>
            <a
              href={`tel:${settings.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2"
            >
              <Phone size={16} /> {settings.phone}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-[#98aaa0]">
        &copy; 2026 Samkele Muzila.
      </div>
    </footer>
  );
}
