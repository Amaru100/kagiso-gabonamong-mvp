import ArticleCard from '../components/ArticleCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { articles } from '../data/articles.js'

export default function Writings() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Writings" title="Articles For Clearer Action" text="Demo articles for the MVP preview. No backend is required." />
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
      </div>
    </section>
  )
}
