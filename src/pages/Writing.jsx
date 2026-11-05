import { Link, useParams } from "react-router-dom";
import { useContent, published } from "../context/ContentContext.jsx";
export default function Writing() {
  const { id } = useParams();
  const { content } = useContent();
  const article = published(content.articles).find((item) => item.id === id);
  if (!article)
    return (
      <section className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="text-4xl">Writing not found.</h1>
        <Link className="mt-6 inline-block underline" to="/writings">
          Back to writings
        </Link>
      </section>
    );
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link className="text-sm text-[#a6cfb7]" to="/writings">
        ← All writings
      </Link>
      <p className="eyebrow mt-10">
        {article.category} · {article.readingTime}
      </p>
      <h1 className="display-heading mt-4">{article.title}</h1>
      <p className="my-8 text-lg leading-8 text-[#bbc6bf]">{article.excerpt}</p>
      <img
        className="mb-10 aspect-video w-full rounded-lg object-cover"
        src={article.image || "/art/cover-1.svg"}
        alt=""
      />
      {article.body ? (
        article.body.split(/\n\s*\n/).map((paragraph, index) => (
          <p
            key={index}
            className="mb-6 whitespace-pre-line text-lg leading-9 text-[#d7e0da]"
          >
            {paragraph}
          </p>
        ))
      ) : (
        <div className="rounded-lg border border-white/15 p-7">
          <h2 className="text-xl font-semibold">
            The full writing is on its way.
          </h2>
          <p className="mt-3 leading-7 text-[#bbc6bf]">
            This is a preview. Come back soon to read the complete piece.
          </p>
        </div>
      )}
    </article>
  );
}
