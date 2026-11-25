import { Link } from "react-router-dom";
import ResourceCard from "../components/ResourceCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useContent, published } from "../context/ContentContext.jsx";

export default function Resources() {
  const { content } = useContent();
  const resources = published(content.resources);
  return (
    <section className="m-wrap m-page">
      <SectionHeader
        eyebrow="Resources"
        title="Ideas worth keeping."
        text="Guides and resources on visualization, meditation, awareness and personal development."
      />
      <div className="grid gap-8 sm:grid-cols-2">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
      <Link className="m-link mt-8" to="/premium-store">Explore guides and toolkits</Link>
    </section>
  );
}
