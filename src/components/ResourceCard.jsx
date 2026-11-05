import { Link } from "react-router-dom";
export default function ResourceCard({ resource }) {
  return (
    <article className="catalog-note">
      <p className="writing-meta">Free {resource.format}</p>
      <h3>{resource.title}</h3>
      <p className="catalog-description">{resource.description}</p>
      {resource.url ? (
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          Download
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
