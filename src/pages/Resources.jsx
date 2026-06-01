import ResourceCard from '../components/ResourceCard.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { resources } from '../data/resources.js'

export default function Resources() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Resources" title="Free Downloads" text="Placeholder PDF resources for clarity, goals, daily discipline, and idea validation. All prices are BWP 0.00." />
      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2 lg:grid-cols-4">
        {resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
      </div>
    </section>
  )
}
