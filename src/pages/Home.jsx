import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext.jsx";

export default function Home() {
  const { content: { settings } } = useContent();
  return <section className="m-wrap m-hero">
    <h1>{settings.heroTitle}</h1>
    <p>{settings.heroDescription}</p>
    <p>{settings.heroThought}</p>
    <Link className="m-link" to="/writings">Explore the writings</Link>
  </section>;
}
