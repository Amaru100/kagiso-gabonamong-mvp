import { Link } from "react-router-dom";

export default function Privacy() {
  return <section className="m-wrap m-page m-privacy">
    <h1>Privacy Policy</h1>
    <p>When enquiry submissions are enabled, Mystic Mind collects your name, email address, subject, message, and the service category you choose. This information is used to review and respond to your enquiry.</p>
    <p>Enquiries are available to authorised administrators. Submission controls may use a short-lived identifier derived from your network address to limit abuse.</p>
    <p>You can use the <Link className="m-link" to="/contact">Contact page</Link> to request assistance with your information once enquiries are enabled.</p>
    <p>Hosting providers, retention periods, and a privacy contact are pending owner confirmation before launch.</p>
  </section>;
}
