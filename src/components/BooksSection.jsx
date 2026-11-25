import { useState } from "react";
import { useContent } from "../context/ContentContext.jsx";

function Cover({book}) {
  const [failed, setFailed] = useState(0);
  const src = [book.cover, book.coverBackup][failed];
  return <div className="m-book-cover">{src ? <img src={src} alt={book.coverAlt || "Cover of " + book.title} loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(failed + 1)} /> : <span>Cover unavailable</span>}</div>;
}

export default function BooksSection({ recommended = false, featured = false }) {
  const { content } = useContent();
  const books = (content.books || []).filter((book) => book.published !== false && !book.sample &&
    (recommended ? book.kind !== "own" && book.cover && book.author && book.description && (!featured || book.featured) : book.kind === "own"));
  const visible = featured ? books.slice(0, 4) : books;
  if (!visible.length) return featured ? null : <p>No books have been published here yet.</p>;
  return <div className="m-book-grid">{visible.map((book) => <article key={book.id}>
    <Cover key={book.cover} book={book} />
    <div><h3>{book.title}</h3><p className="m-meta">{book.author}</p><p>{book.description}</p>
    {book.url && <a className="m-link" href={book.url}>Find the book</a>}</div>
  </article>)}</div>;
}
