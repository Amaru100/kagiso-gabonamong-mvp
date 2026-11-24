export default function SectionHeader({ eyebrow, title, text }) {
  return (
    <header className="mb-10">
      {eyebrow && <p className="m-label">{eyebrow}</p>}
      <h1>{title}</h1>
      {text && <p>{text}</p>}
    </header>
  );
}
