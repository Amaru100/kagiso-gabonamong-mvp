import { ArrowUpRight } from "lucide-react";
import Button from "./Button.jsx";
export default function ProductCard({ product }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-white/15 bg-[#101813] p-6">
      <p className="eyebrow">{product.category}</p>
      <h3 className="mt-4 text-xl font-semibold">{product.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-7 text-[#bbc6bf]">
        {product.description}
      </p>
      <Button
        to={`/contact?subject=${encodeURIComponent("Resource enquiry: " + product.title)}`}
        variant="secondary"
        className="mt-6"
      >
        Enquire about this guide <ArrowUpRight size={16} />
      </Button>
    </article>
  );
}
