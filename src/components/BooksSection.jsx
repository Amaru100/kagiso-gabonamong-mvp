import { Link } from "react-router-dom";
import { useContent, published } from "../context/ContentContext.jsx";

export function BookCard({ book }) {
  return (
    <article className="book-note">
      {book.cover ? (
        <img
          className="book-cover"
          src={book.cover}
          alt={`${book.title} cover`}
          loading="lazy"
        />
      ) : (
        <div className="book-cover book-cover-fallback">
          <span>{book.title}</span>
          <small>{book.author}</small>
        </div>
      )}
      <div>
        <p className="book-author">{book.author}</p>
        <h3>{book.title}</h3>
        <p className="book-reason">{book.description}</p>
        {book.url && (
          <a
            className="text-link"
            href={book.url}
            target="_blank"
            rel="noreferrer"
          >
            {book.kind === "own" ? "About the book" : "Book details"}
          </a>
        )}
      </div>
    </article>
  );
}

export default function BooksSection({ full = false }) {
  const { content } = useContent();
  const books = published(content.books || []);
  const recommendations = books.filter((book) => book.kind !== "own");
  const ownBooks = books.filter((book) => book.kind === "own");
  return (
    <>
      <section
        className="editorial-section books-section"
        aria-labelledby="books-heading"
      >
        <div className="section-margin">
          <h2 id="books-heading">Recommended books</h2>
          <p>A reading list, with a few notes on each.</p>
          {!full && (
            <Link to="/books" className="text-link">
              The reading list
            </Link>
          )}
        </div>
        <div>
          {recommendations.some((book) => book.sample) && (
            <p className="sample-note">
              Sample selections for now. Kagiso's personal recommendations will
              follow.
            </p>
          )}
          <div className="book-list">
            {(full ? recommendations : recommendations.slice(0, 3)).map(
              (book) => (
                <BookCard key={book.id} book={book} />
              ),
            )}
          </div>
          {!recommendations.length && (
            <p className="book-reason">
              The reading list will be shared here soon.
            </p>
          )}
        </div>
      </section>
      {ownBooks.length > 0 && (
        <section
          className="editorial-section"
          aria-labelledby="own-books-heading"
        >
          <div className="section-margin">
            <h2 id="own-books-heading">Books by Kagiso</h2>
          </div>
          <div className="book-list">
            {ownBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
