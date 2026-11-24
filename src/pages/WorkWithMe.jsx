import EnquiryForm from "../components/EnquiryForm.jsx";
const services = ["Seminars", "Webinars", "Corporate talks", "Workshops", "One-on-one advisory/coaching"];

export default function WorkWithMe() {
  return <section className="m-wrap m-page">
    <h1>Work with me</h1>
    <p>For speaking, workshops, and one-on-one conversations. Choose what you have in mind and tell me a little about it.</p>
    <EnquiryForm services={services}/>
  </section>;
}
