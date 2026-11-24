import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext.jsx";
export default function AboutSection({ standalone = false }) {
  const { content: { settings } } = useContent();
  const Heading = standalone ? "h1" : "h2";
  return <section className="m-section">
    <Heading>Who is Kagiso<br/>Gabonamong?</Heading>
    <div className="m-about-grid">
      {settings.authorPhoto ? <img src={settings.authorPhoto} alt={settings.authorName} loading="lazy"/> : <div className="m-portrait" aria-hidden="true">KG</div>}
      <div>{settings.authorBio ? <p className="whitespace-pre-line">{settings.authorBio}</p> : <p>Kagiso Gabonamong is the author behind Mystic Mind.</p>}
      <Link className="m-link" to={standalone ? "/work-with-me" : "/about"}>{standalone ? "Work with me" : "About Kagiso"}</Link></div>
    </div>
  </section>;
}
