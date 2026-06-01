import { ArrowRight } from 'lucide-react'
import Button from './Button.jsx'

export default function ArticleCard({ article }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/20">
      {article.image && (
        <div className="h-48 overflow-hidden">
          <img src={article.image} alt="" className="h-full w-full object-cover opacity-85 transition duration-500 hover:scale-105" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#d6b15e]">
          <span>{article.category}</span>
          <span className="text-[#8f8879]">{article.readingTime}</span>
        </div>
        <h3 className="text-xl font-black text-[#f8f4e8]">{article.title}</h3>
        <p className="mt-3 text-sm leading-6 text-[#cfc8b5]">{article.excerpt}</p>
        <Button to="/writings" variant="ghost" className="mt-auto px-0 pt-5">
          Read More <ArrowRight size={17} />
        </Button>
      </div>
    </article>
  )
}
