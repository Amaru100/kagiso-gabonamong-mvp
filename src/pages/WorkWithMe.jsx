import {
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Mic2,
  UsersRound,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
import SectionHeader from "../components/SectionHeader.jsx";
import EnquiryForm from "../components/EnquiryForm.jsx";

const services = [
  { title: "Seminars", icon: Mic2 },
  { title: "Webinars", icon: Video },
  { title: "Corporate talks", icon: BriefcaseBusiness },
  { title: "Workshops", icon: UsersRound },
  { title: "One-on-one advisory/coaching", icon: CalendarDays },
];

export default function WorkWithMe() {
  const [selectedService, setSelectedService] = useState(services[0].title);
  const formRef = useRef(null);

  const chooseService = (title) => {
    setSelectedService(title);
    if (window.innerWidth < 1024) {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader
        eyebrow="Work With Me"
        title="Booking And Enquiry"
        text="Invite Kagiso for seminars, webinars, corporate talks, workshops, or advisory sessions in Gaborone, Botswana."
      />
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4">
          {services.map(({ title, icon: Icon }) => {
            const active = selectedService === title;
            return (
              <button
                key={title}
                type="button"
                onClick={() => chooseService(title)}
                className={`flex min-h-20 items-center justify-between gap-4 rounded-lg border p-5 text-left transition ${
                  active
                    ? "border-[#8dc6a7] bg-[#06402B] text-white shadow-xl shadow-[#8dc6a7]/10"
                    : "border-white/10 bg-white/[0.035] text-[#f0f4ef] hover:border-[#8dc6a7]/60 hover:bg-[#8dc6a7]/10"
                }`}
              >
                <span className="inline-flex items-center gap-4">
                  <Icon
                    className={active ? "text-white" : "text-[#8dc6a7]"}
                    size={24}
                  />
                  <span className="font-bold">{title}</span>
                </span>
                {active && <Check size={20} />}
              </button>
            );
          })}
        </div>
        <div ref={formRef} className="scroll-mt-28">
          <EnquiryForm service={selectedService} />
        </div>
      </div>
    </section>
  );
}
