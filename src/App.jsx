import { useContent } from "./context/ContentContext.jsx";
import { Route, Routes, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Writings from "./pages/Writings.jsx";
import Resources from "./pages/Resources.jsx";
import PremiumStore from "./pages/PremiumStore.jsx";
import Events from "./pages/Events.jsx";
import Writing from "./pages/Writing.jsx";
import Books from "./pages/Books.jsx";
import Admin from "./pages/Admin.jsx";
import AmbientBackground from "./components/AmbientBackground.jsx";
import SiteMetadata from "./components/SiteMetadata.jsx";
import WorkWithMe from "./pages/WorkWithMe.jsx";
import Mission from "./pages/Mission.jsx";
import Testimonials from "./pages/Testimonials.jsx";
import Privacy from "./pages/Privacy.jsx";
import Contact from "./pages/Contact.jsx";

export default function App() {
  const {loading,error} = useContent();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  if (pathname === "/admin" || pathname === "/admin/login") return <Admin />;
  return (
    <div className="m-site min-h-screen">
      <AmbientBackground />
      <SiteMetadata />
      <a href="#main-content" className="m-skip">Skip to content</a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        {loading ? <p className="m-wrap m-page" role="status">Loading Mystic Mind?</p> : error ? <p className="m-wrap m-page" role="alert">{error}</p> : <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/about" element={<About />} />
          <Route path="/writings" element={<Writings />} />
          <Route path="/writings/:id" element={<Writing />} />
          <Route path="/books" element={<Books />} />
          <Route path="/recommended-books" element={<Books recommended />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/premium-store" element={<PremiumStore />} />
          <Route path="/events" element={<Events />} />
          <Route path="/work-with-me" element={<WorkWithMe />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="*"
            element={
              <section className="mx-auto max-w-4xl px-6 py-24">
                <h1 className="display-heading">Page not found.</h1>
                <Link to="/" className="mt-6 inline-block underline">
                  Back to home
                </Link>
              </section>
            }
          />
        </Routes>}
      </main>
      <Footer />
    </div>
  );
}
