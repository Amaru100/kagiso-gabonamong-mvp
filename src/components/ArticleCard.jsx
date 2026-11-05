import { ArrowRight } from "lucide-react";
import Button from "./Button.jsx";

export default function ArticleCard({ article }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
      {article.image && (
        <div className="aspect-video overflow-hidden bg-[#efeee8]">
          <img
            src={article.image}
            alt=""
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8dc6a7]">
          <span>{article.category}</span>
          <span className="text-[#98aaa0]">{article.readingTime}</span>
        </div>
        <h3 className="text-xl font-black text-[#f0f4ef]">{article.title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#bbc6bf]">
          {article.excerpt}
        </p>
        <Button
          to={`/writings/${article.id}`}
          variant="ghost"
          className="mt-auto px-0 pt-5"
        >
          Read More <ArrowRight size={17} />
        </Button>
      </div>
    </article>
  );
}
