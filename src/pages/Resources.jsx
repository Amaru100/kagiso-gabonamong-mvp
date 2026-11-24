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
        title="Free Downloads"
        text="Downloadable PDF resources for clarity, goals, daily discipline, and idea validation."
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
