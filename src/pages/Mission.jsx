import { useContent } from "../context/ContentContext.jsx";

export default function Mission() {
  const { content: { settings } } = useContent();
  return <section className="m-wrap m-page">
    <p className="m-label">THE MISSION</p>
    <h1>Build the confidence<br/>to pursue what matters.</h1>
    <p className="whitespace-pre-line">{settings.mission}</p>
  </section>;
}
