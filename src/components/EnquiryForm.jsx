import { useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function EnquiryForm({ subject = "", service = "", services }) {
  const submission = useRef(null);
  const active = useRef(false);
  const [state, setState] = useState({});

  async function submit(event) {
    event.preventDefault();
    if (active.current) return;
    active.current = true;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const payload = {...fields, type: services ? "service" : "contact"};
    const key = JSON.stringify(payload);
    if (submission.current?.key !== key) submission.current = {key, id:crypto.randomUUID()};
    setState({busy:true});
    try {
      const response = await fetch("/api/enquiry", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...payload,id:submission.current.id}),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || "The enquiry could not be saved.");
      setState({saved:true});
      form.reset();
      submission.current = null;
    } catch (error) {
      setState({error:error instanceof SyntaxError ? "Online enquiries are currently unavailable." : error.message});
    } finally {
      active.current = false;
    }
  }

  return <form className="m-form" onSubmit={submit}>
    {services && <fieldset><legend>I'm enquiring about</legend>
      {services.map((option, index) => <label className="m-radio" key={option}><input type="radio" name="category" value={option} defaultChecked={index === 0} required />{option}</label>)}
    </fieldset>}
    <div className="m-form-two">
      <label>Your name<input className="admin-input" name="name" autoComplete="name" maxLength={120} required /></label>
      <label>Email<input className="admin-input" name="email" type="email" autoComplete="email" maxLength={254} required /></label>
    </div>
    <label>Subject<input key={subject || service} className="admin-input" name="subject" defaultValue={subject || (service ? "Booking enquiry: " + service : "")} maxLength={200} required /></label>
    <label>Message<textarea className="admin-input" name="message" rows={4} maxLength={4000} required /></label>
    <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <p>We use your details to respond to this enquiry. <Link className="m-link" to="/privacy">Privacy Policy</Link></p>
    <button type="submit" className="m-button" disabled={state.busy}>{state.busy ? "Submitting…" : "Submit enquiry"}</button>
    {state.error && <p role="alert">{state.error}</p>}
    {state.saved && <p role="status">Your enquiry was received.</p>}
  </form>;
}
