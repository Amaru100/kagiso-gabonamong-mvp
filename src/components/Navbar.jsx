import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const links = [["Home","/"],["Writings","/writings"],["Books","/books"],["Recommended Books","/recommended-books"],["Resources","/resources"],["Events","/events"],["About","/about"],["Work With Me","/work-with-me"],["Contact","/contact"]];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  return <header className="m-header" onKeyDown={(event) => {
    if (event.key === "Escape" && open) {
      setOpen(false);
      trigger.current?.focus();
    }
  }}>
    <Link className="m-logo" to="/">MYSTIC MIND</Link>
    <nav aria-label="Main navigation" className="m-nav">
      {links.filter(([name]) => ["Writings","Resources","About"].includes(name)).map(([name,path]) => <NavLink key={path} to={path}>{name}</NavLink>)}
      <button ref={trigger} type="button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(!open)}>Menu</button>
      <div className="m-menu" id="site-menu" hidden={!open}>{links.map(([name,path]) => <NavLink key={path} to={path} onClick={() => {setOpen(false); trigger.current?.focus();}}>{name}</NavLink>)}</div>
    </nav>
  </header>;
}
