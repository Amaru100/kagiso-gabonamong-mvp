import BooksSection from "../components/BooksSection.jsx";
export default function Books({ recommended = false }) {
  return <section className="m-wrap m-page">
    <h1>{recommended ? "Books worth your time." : "Books"}</h1>
    <p>{recommended ? "A collection of books Kagiso recommends, exploring the mind, identity, belief and personal development." : "Books by Kagiso Gabonamong."}</p>
    <BooksSection recommended={recommended} />
  </section>;
}
