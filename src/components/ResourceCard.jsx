import { Download } from "lucide-react";
import Button from "./Button.jsx";

export default function ResourceCard({ resource }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-white/10 bg-[#101813] p-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8dc6a7]">
        Free {resource.format}
      </p>
      <h3 className="mt-4 text-xl font-black">{resource.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[#bbc6bf]">
        {resource.description}
      </p>
      {resource.url ? (
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#56866b]/60 px-4 py-3 text-sm font-semibold"
        >
          <Download size={18} /> Download
        </a>
      ) : (
        <Button
          to={`/contact?subject=${encodeURIComponent("Resource request: " + resource.title)}`}
          variant="secondary"
          className="mt-6 w-full"
        >
          Request this resource
        </Button>
      )}
    </article>
  );
}
