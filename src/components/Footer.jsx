import { Link } from "react-router-dom";
import { useContent } from "../context/ContentContext.jsx";
export default function Footer() {
  const {content: {settings}} = useContent();
  return <footer className="m-footer"><span>© {new Date().getFullYear()} {(settings.siteName || "Mystic Mind").toUpperCase()}</span><div className="m-footer-links"><Link to="/privacy">Privacy Policy</Link>
    {settings.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg></a>}
    {settings.x && <a href={settings.x} target="_blank" rel="noopener noreferrer" aria-label="X"><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-7.3L5.6 22H2.5l7.4-8.5L.8 2h6.5l4.5 6.8L18.9 2zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20z"/></svg></a>}
    </div><span>Designed by Muzila Group</span></footer>;
}
