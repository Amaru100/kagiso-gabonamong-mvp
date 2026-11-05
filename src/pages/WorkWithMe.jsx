import { useRef, useState } from "react";
import EnquiryForm from "../components/EnquiryForm.jsx";
const services = [
  "Seminars",
  "Webinars",
  "Corporate talks",
  "Workshops",
  "One-on-one advisory/coaching",
];
export default function WorkWithMe() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const formRef = useRef(null);
  const chooseService = (title) => {
    setSelectedService(title);
    if (window.innerWidth < 768)
      formRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
  };
  return (
    <section className="work-page">
      <header className="work-heading">
        <h1>Work with me</h1>
        <p>
          For speaking, workshops, and one-on-one conversations. Choose what you
          have in mind and tell me a little about it.
        </p>
      </header>
      <div className="work-layout">
        <div>
          <p className="service-label">I'm enquiring about</p>
          <div className="service-list">
            {services.map((title) => (
              <button
                key={title}
                type="button"
                aria-pressed={selectedService === title}
                onClick={() => chooseService(title)}
              >
                <span>{title}</span>
                {selectedService === title && (
                  <span className="service-selected">Selected</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div ref={formRef} className="scroll-mt-28">
          <EnquiryForm service={selectedService} />
        </div>
      </div>
    </section>
  );
}
