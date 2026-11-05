import { useState } from "react";
import { useContent } from "../context/ContentContext.jsx";
import Button from "./Button.jsx";
export default function EnquiryForm({ subject = "", service = "" }) {
  const {
    content: { settings },
  } = useContent();
  const [ready, setReady] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n${service ? `Service: ${service}\n` : ""}\n${data.get("message")}`;
    window.location.href = `mailto:${settings.email}?subject=${encodeURIComponent(data.get("subject"))}&body=${encodeURIComponent(message)}`;
    setReady(true);
  };
  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-white/15 bg-[#101813] p-6"
    >
      <div className="grid gap-5">
        <label className="admin-label">
          Your name
          <input
            name="name"
            required
            autoComplete="name"
            className="admin-input"
          />
        </label>
        <label className="admin-label">
          Email
          <input
            name="email"
            required
            type="email"
            autoComplete="email"
            className="admin-input"
          />
        </label>
        <label className="admin-label">
          Subject
          <input
            key={subject || service}
            name="subject"
            defaultValue={
              subject || (service ? `Booking enquiry: ${service}` : "")
            }
            required
            className="admin-input"
          />
        </label>
        <label className="admin-label">
          Message
          <textarea name="message" rows={5} required className="admin-input" />
        </label>
      </div>
      <p className="mt-5 text-sm leading-6 text-[#a5b9ac]">
        This opens your email app. You can also write directly to{" "}
        <a className="underline" href={`mailto:${settings.email}`}>
          {settings.email}
        </a>
        .
      </p>
      <Button type="submit" className="mt-5 w-full">
        Continue in email
      </Button>
      {ready && (
        <p role="status" className="mt-4 text-sm text-[#a5b9ac]">
          Your email draft is ready in your email app. Review and send it there.
        </p>
      )}
    </form>
  );
}
