import BooksSection from "../components/BooksSection.jsx";
export default function Books({ recommended = false }) {
  return <section className="m-wrap m-page">
    <h1>{recommended ? "Recommended Books" : "Books"}</h1>
    <p>{recommended ? "A selection of books recommended by Kagiso, with a personal note on why each is worth reading." : "Books by Kagiso Gabonamong."}</p>
    <BooksSection recommended={recommended} />
  </section>;
}
