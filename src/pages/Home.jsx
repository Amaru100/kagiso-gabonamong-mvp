import { ArrowRight, BookOpen, CalendarDays, Download, Mic2 } from 'lucide-react'
import { motion } from 'framer-motion'
import ArticleCard from '../components/ArticleCard.jsx'
import ResourceCard from '../components/ResourceCard.jsx'
import ProductCard from '../components/ProductCard.jsx'
import EventCard from '../components/EventCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import Button from '../components/Button.jsx'
import MonogramLogo from '../components/MonogramLogo.jsx'
import { articles } from '../data/articles.js'
import { resources } from '../data/resources.js'
import { products } from '../data/products.js'
import { events } from '../data/events.js'
import { testimonials } from '../data/testimonials.js'

const heroImage = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2200&q=80'
const authorImage = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1000&q=80'

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="self-center">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.3em] text-[#d6b15e]">WRITER &bull; SPEAKER &bull; BUILDER</p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-[#f8f4e8] sm:text-6xl lg:text-7xl">Short writings. Practical resources. Powerful seminars for a better you and business.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#cfc8b5]">Insights and experiences to help you think bigger, act with clarity, and build a legacy of impact from Gaborone, Botswana.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/writings"><BookOpen size={18} /> Read Writings</Button>
              <Button to="/resources" variant="secondary"><Download size={18} /> Download Resources</Button>
              <Button to="/events" variant="secondary"><CalendarDays size={18} /> View Events</Button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="relative min-h-[520px] overflow-hidden rounded-lg border border-[#d6b15e]/25 bg-[#111111] shadow-2xl shadow-black/40">
            <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/58 to-[#070707]/12" />
            <div className="relative flex h-full min-h-[520px] flex-col justify-end p-8 sm:p-10">
              <MonogramLogo size="lg" className="mb-6" />
              <h2 className="max-w-md text-3xl font-black">Build with clarity. Lead with impact.</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#e7dfcc]">Premium writing, resources, seminars, and advisory experiences for ambitious professionals and entrepreneurs.</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Featured Writings" title="Ideas For Focused Builders" text="Short, practical essays on motivation, leadership, mindset, clarity, and business growth." />
        <div className="mx-auto grid max-w-7xl items-stretch gap-5 md:grid-cols-3">
          {articles.slice(0, 3).map((article) => <ArticleCard key={article.id} article={article} />)}
        </div>
      </section>

      <section className="bg-[#0d0d0d] px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Free Downloads" title="Resources You Can Use Today" text="Downloadable PDF resources for clarity, goals, daily discipline, and idea validation." />
        <div className="mx-auto grid max-w-7xl items-stretch gap-5 md:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Premium Learning" title="Guides, Toolkits And Workbooks" text="Paid demo products in BWP with local cart and placeholder checkout." />
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="bg-[#0d0d0d] px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Upcoming Events" title="Seminars And Webinars" text="Practical learning experiences hosted from Gaborone, Botswana." />
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-3">
          {events.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-lg border border-[#d6b15e]/25 bg-[#111111]">
            <img src={authorImage} alt="" className="h-72 w-full object-cover opacity-90" />
            <div className="p-8">
              <Mic2 className="text-[#d6b15e]" size={38} />
              <h2 className="mt-5 text-3xl font-black">About Kagiso Gabonamong</h2>
              <p className="mt-4 leading-7 text-[#cfc8b5]">Kagiso writes and speaks for people who want to think bigger, act with discipline, and build meaningful work. His message blends motivation, entrepreneurship, leadership, clarity, mindset, and business growth.</p>
              <Button to="/about" variant="secondary" className="mt-6">Learn More <ArrowRight size={18} /></Button>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <blockquote key={item.name} className="flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.035] p-6">
                <p className="text-sm leading-6 text-[#cfc8b5]">"{item.quote}"</p>
                <footer className="mt-auto pt-5 text-sm font-bold text-[#d6b15e]">{item.name}<span className="block text-xs font-semibold text-[#8f8879]">{item.role}</span></footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-lg border border-[#d6b15e]/25 bg-[#d6b15e] p-8 text-[#070707]">
          <h2 className="text-3xl font-black">Get new writings and resources</h2>
          <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
            <input className="min-h-12 rounded-md border border-black/10 bg-[#f8f4e8] px-4 text-[#070707]" placeholder="Email address" type="email" />
            <Button variant="primary" className="bg-[#070707] text-[#f8f4e8] hover:bg-[#202020]">Sign Up</Button>
          </form>
        </div>
      </section>
    </>
  )
}
