import { useSearchParams } from "react-router-dom";
import EnquiryForm from "../components/EnquiryForm.jsx";

export default function Contact() {
  const [params] = useSearchParams();
  return <section className="m-wrap m-page">
    <h1>Get in touch.</h1>
    <p>For questions, messages, and general enquiries, you can get in touch here.</p>
    <EnquiryForm subject={params.get("subject") || ""}/>
  </section>;
}
