import { useContent } from "../context/ContentContext.jsx";
import MonogramLogo from "./MonogramLogo.jsx";
export default function AuthorSection() {
  const {
    content: { settings },
  } = useContent();
  return (
    <section className="author-section" aria-labelledby="author-heading">
      <div className="author-inner">
        <div className="author-portrait">
          {settings.authorPhoto ? (
            <img src={settings.authorPhoto} alt={settings.authorName} />
          ) : (
            <>
              <MonogramLogo size="lg" />
              <span>Portrait coming soon</span>
            </>
          )}
        </div>
        <div>
          <h2 id="author-heading" className="display-heading">
            About the author
          </h2>
          <h3 className="mt-5 text-xl font-semibold">{settings.authorName}</h3>
          <p className="mt-4 max-w-2xl whitespace-pre-line leading-8 text-[#bbc6bf]">
            {settings.authorBio ||
              "A biography and photograph will be added here soon."}
          </p>
          <p className="mt-5 text-sm text-[#99b7a7]">{settings.location}</p>
        </div>
      </div>
    </section>
  );
}
