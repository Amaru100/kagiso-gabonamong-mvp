import { Link } from "react-router-dom";
export default function ProductCard({ product }) {
  return (
    <article className="catalog-note">
      <p className="writing-meta">{product.category}</p>
      <h3>{product.title}</h3>
      <p className="catalog-description">{product.description}</p>
      <Link
        className="text-link"
        to={`/contact?subject=${encodeURIComponent("Resource enquiry: " + product.title)}`}
      >
        Enquire about this guide
      </Link>
    </article>
  );
}
