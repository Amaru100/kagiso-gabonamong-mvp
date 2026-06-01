import { ArrowRight } from 'lucide-react'
import Button from '../components/Button.jsx'
import SectionHeader from '../components/SectionHeader.jsx'

const topics = ['Motivation', 'Entrepreneurship', 'Leadership', 'Clarity', 'Mindset', 'Business growth']

export default function About() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow="About" title="Kagiso Gabonamong" text="A writer, speaker, and seminar host based in Gaborone, Botswana." />
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-lg border border-[#d6b15e]/25 bg-[#111111] p-8">
            <div className="grid h-24 w-24 place-items-center rounded-md bg-[#d6b15e] text-4xl font-black text-[#070707]">KG</div>
            <h2 className="mt-6 text-2xl font-black">Mission</h2>
            <p className="mt-4 leading-7 text-[#cfc8b5]">To help people build lives, careers, and businesses with sharper thinking, stronger discipline, and a deeper commitment to meaningful impact.</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-8">
            <h2 className="text-3xl font-black">Professional Bio</h2>
            <p className="mt-5 leading-8 text-[#cfc8b5]">Kagiso Gabonamong creates practical content for ambitious people who want to improve how they think, work, lead, and build. Through writings, downloadable resources, seminars, webinars, workshops, and advisory conversations, he shares grounded ideas on clarity, mindset, entrepreneurship, leadership, and business growth.</p>
            <p className="mt-4 leading-8 text-[#cfc8b5]">Based in Gaborone, Botswana, Kagiso's work is designed for people who want more than inspiration. It is built to help them take action, strengthen their standards, and create a lasting legacy of impact.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {topics.map((topic) => <span key={topic} className="rounded-md border border-[#d6b15e]/30 px-4 py-2 text-sm font-bold text-[#d6b15e]">{topic}</span>)}
            </div>
            <Button to="/work-with-me" className="mt-8">Book A Seminar <ArrowRight size={18} /></Button>
          </div>
        </div>
      </div>
    </section>
  )
}
