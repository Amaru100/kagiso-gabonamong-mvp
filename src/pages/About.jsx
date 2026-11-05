import { useContent } from "../context/ContentContext.jsx";
import Button from "../components/Button.jsx";
export default function About() {
  const {
    content: { settings },
  } = useContent();
  return (
    <section className="mx-auto max-w-4xl px-6 py-20">
      <p className="eyebrow">Writer · Speaker · Builder</p>
      <h1 className="display-heading mt-5">{settings.authorName}</h1>
      <p className="mt-7 text-lg leading-8 text-[#bbc6bf]">
        Writings, resources, and conversations for people building with clarity
        and purpose.
      </p>
      <p className="mt-5 text-[#99b7a7]">{settings.location}</p>
      <Button to="/work-with-me" className="mt-8">
        Work with me
      </Button>
    </section>
  );
}
