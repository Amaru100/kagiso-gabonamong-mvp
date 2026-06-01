import { Download } from 'lucide-react'
import Button from './Button.jsx'

export default function ResourceCard({ resource }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-white/10 bg-[#111111] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6b15e]">Free {resource.format}</p>
      <h3 className="mt-4 text-xl font-black">{resource.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[#cfc8b5]">{resource.description}</p>
      <Button variant="secondary" className="mt-6 w-full">
        <Download size={18} /> Download
      </Button>
    </article>
  )
}
