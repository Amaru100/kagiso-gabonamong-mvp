import { useContent, published } from "../context/ContentContext.jsx";

export default function Testimonials() {
  const { content } = useContent();
  return <section className="m-wrap m-page">
    <p className="m-label">CLIENT EXPERIENCES</p>
    <h1>Words from<br/>the people.</h1>
    <div className="m-testimonials">{published(content.testimonials || []).map((person) => <figure key={person.id}>
      <figcaption>{person.image && <img src={person.image} alt={person.title} width="144" height="144" loading="lazy" />}
        <div><h2>{person.title}</h2><p>{person.description}</p></div>
      </figcaption>
      <blockquote><p className="whitespace-pre-line">{person.quote}</p></blockquote>
    </figure>)}</div>
  </section>;
}
