import { Link } from "react-router-dom";
export default function ResourceCard({ resource }) {
  return (
    <article className="catalog-note">
      {resource.cover && <img className="m-ebook-cover" src={resource.cover} alt={"Cover of " + resource.title} loading="lazy" />}
      <p className="writing-meta">{resource.format}{resource.pages && " / " + resource.pages + " pages"}</p>
      <h3>{resource.title}</h3>
      {resource.author && <p>{resource.author}</p>}
      <p className="catalog-description">{resource.description}</p>
      {resource.url ? (
        <a
          href={resource.url}
          download={resource.url.startsWith("/") ? "" : undefined}
          rel="noreferrer"
          className="text-link"
        >
          {resource.format === "PDF" ? "Download PDF" : "Download"}
        </a>
      ) : (
        <Link
          className="text-link"
          to={`/contact?subject=${encodeURIComponent("Resource request: " + resource.title)}`}
        >
          Request this resource
        </Link>
      )}
    </article>
  );
}
