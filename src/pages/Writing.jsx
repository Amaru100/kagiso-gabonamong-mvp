import { sanitizeRichText } from "../richText.js";
import { Link, useParams } from "react-router-dom";
import { useContent, published } from "../context/ContentContext.jsx";
import { writingCover } from "../components/ArticleCard.jsx";
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
    <article className="m-wrap m-page m-reader">
      <Link className="text-sm text-[#a6cfb7]" to="/writings">
        Back to writings
      </Link>
      <img className="m-reader-cover mt-6 mb-10 w-full object-contain" src={writingCover(article)} alt="" />
      <p className="eyebrow mt-10">
        {[article.author || "Kagiso Gabonamong", article.date, article.category, article.readingTime].filter(Boolean).join(" · ")}
      </p>
      <h1 className="display-heading mt-4">{article.title}</h1>
      <p className="my-8 text-lg leading-8 text-[#bbc6bf]">{article.excerpt}</p>
      {article.bodyHtml ? <div className="m-rich" dangerouslySetInnerHTML={{__html: sanitizeRichText(article.bodyHtml)}} /> : article.body ? (
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
            The complete piece will appear here when available.
          </p>
        </div>
      )}
      <Link className="m-link" to="/writings">Back to writings</Link>
      <aside className="mt-12"><h2>More writings</h2><ul>{published(content.articles).filter((item) => item.id !== id).slice(0,3).map((item) => <li key={item.id}><Link className="m-link" to={"/writings/" + item.id}>{item.title}</Link></li>)}</ul></aside>
    </article>
  );
}
