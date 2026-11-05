import { useSearchParams } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { useContent } from "../context/ContentContext.jsx";
import EnquiryForm from "../components/EnquiryForm.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
export default function Contact() {
  const [params] = useSearchParams();
  const {
    content: { settings },
  } = useContent();
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Get in touch"
        title="A conversation starts here."
        text="For events, resources, writing enquiries, and working together."
      />
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-white/15 bg-[#101813] p-8">
          <h2 className="text-2xl font-semibold">Contact details</h2>
          <div className="mt-7 grid gap-6 text-[#bbc6bf]">
            <span className="inline-flex items-center gap-3">
              <MapPin size={20} />
              {settings.location}
            </span>
            <a
              className="inline-flex items-center gap-3 break-all"
              href={`mailto:${settings.email}`}
            >
              <Mail className="shrink-0" size={20} />
              {settings.email}
            </a>
            <a
              className="inline-flex items-center gap-3"
              href={`tel:${settings.phone.replace(/\s/g, "")}`}
            >
              <Phone size={20} />
              {settings.phone}
            </a>
          </div>
        </div>
        <EnquiryForm subject={params.get("subject") || ""} />
      </div>
    </section>
  );
}
