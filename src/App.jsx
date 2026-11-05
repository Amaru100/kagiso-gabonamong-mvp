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
import Admin from "./pages/Admin.jsx";
import AuthorSection from "./components/AuthorSection.jsx";
import WorkWithMe from "./pages/WorkWithMe.jsx";
import Contact from "./pages/Contact.jsx";

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  if (pathname === "/admin") return <Admin />;
  return (
    <div className="min-h-screen text-[#f0f4ef]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/writings" element={<Writings />} />
          <Route path="/writings/:id" element={<Writing />} />
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
        </Routes>
      </main>
      <AuthorSection />
      <Footer />
    </div>
  );
}
