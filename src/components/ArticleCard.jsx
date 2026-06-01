import { ArrowRight } from 'lucide-react'
import Button from './Button.jsx'

export default function ArticleCard({ article }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20">
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#d6b15e]">
        <span>{article.category}</span>
        <span className="text-[#8f8879]">{article.readingTime}</span>
      </div>
      <h3 className="text-xl font-black text-[#f8f4e8]">{article.title}</h3>
      <p className="mt-3 min-h-20 text-sm leading-6 text-[#cfc8b5]">{article.excerpt}</p>
      <Button to="/writings" variant="ghost" className="mt-4 px-0">
        Read More <ArrowRight size={17} />
      </Button>
    </article>
  )
}
