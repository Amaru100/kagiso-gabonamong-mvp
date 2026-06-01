import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Writings from './pages/Writings.jsx'
import Resources from './pages/Resources.jsx'
import PremiumStore from './pages/PremiumStore.jsx'
import Events from './pages/Events.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import ThankYou from './pages/ThankYou.jsx'
import EmailPreview from './pages/EmailPreview.jsx'
import WorkWithMe from './pages/WorkWithMe.jsx'
import Contact from './pages/Contact.jsx'

export default function App() {
  return (
    <div className="min-h-screen text-[#f8f4e8]">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/writings" element={<Writings />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/premium-store" element={<PremiumStore />} />
          <Route path="/events" element={<Events />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/email-preview" element={<EmailPreview />} />
          <Route path="/work-with-me" element={<WorkWithMe />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
