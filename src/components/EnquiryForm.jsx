import { useState } from "react";
import { useContent } from "../context/ContentContext.jsx";
import { contactRecipient, enquiryUrl } from "../contact.js";

export default function EnquiryForm({ subject = "", service = "", services }) {
  const { content: { settings } } = useContent();
  const email = contactRecipient(settings.email);
  const [continued, setContinued] = useState(false);
  return <form className="m-form" onSubmit={(event) => {
    event.preventDefault();
    if (!email) return;
    const fields = new FormData(event.currentTarget);
    window.location.href = enquiryUrl(email, fields, fields.get("service") || service);
    setContinued(true);
  }}>
    {services && <fieldset><legend>I'm enquiring about</legend>
      {services.map((option) => <label className="m-radio" key={option}><input type="radio" name="service" value={option} required />{option}</label>)}
    </fieldset>}
    <label>Your name<input className="admin-input" name="name" autoComplete="name" required /></label>
    <label>Email<input className="admin-input" name="email" type="email" autoComplete="email" required /></label>
    <label>Subject<input key={subject || service} className="admin-input" name="subject" defaultValue={subject || (service ? "Booking enquiry: " + service : "")} required /></label>
    <label>Message<textarea className="admin-input" name="message" rows={5} required /></label>
    {email ? <p>This opens your email app. You can also write directly to <a className="m-link" href={"mailto:" + email}>{email}</a>.</p> :
      <p>Contact is awaiting setup. An email address will be available once confirmed.</p>}
    <button type="submit" className="m-button" disabled={!email}>Continue in email</button>
    {continued && <p role="status">Review the draft in your email app and send it there.</p>}
  </form>;
}
