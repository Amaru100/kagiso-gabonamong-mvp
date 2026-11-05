import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useContent } from "../context/ContentContext.jsx";
import MonogramLogo from "./MonogramLogo.jsx";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Writings", "/writings"],
  ["Resources", "/resources"],
  ["Guides", "/premium-store"],
  ["Events", "/events"],
  ["Work With Me", "/work-with-me"],
  ["Contact", "/contact"],
];

export default function Navbar() {
  const {
    content: { settings },
  } = useContent();
  const [open, setOpen] = useState(false);
  const navClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-[#8dc6a7]/14 text-[#8dc6a7]" : "text-[#f0f4ef] hover:bg-white/5"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090e0b]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <MonogramLogo size="sm" />
          <span className="hidden text-xs font-bold uppercase tracking-[0.12em] text-[#f0f4ef] sm:block">
            {settings.authorName}
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 xl:flex">
          {links.map(([label, href]) => (
            <NavLink key={href} to={href} className={navClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          className="grid h-11 w-11 place-items-center rounded-md border border-white/15 xl:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-navigation"
          className="border-t border-white/10 px-4 pb-4 xl:hidden"
        >
          <div className="grid gap-2">
            {links.map(([label, href]) => (
              <NavLink
                key={href}
                to={href}
                className={navClass}
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
