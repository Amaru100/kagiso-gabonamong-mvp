import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const links = [["Resources","/resources"],["Writings","/writings"],["Recommended Books","/recommended-books"],["About","/about"],["Mission","/mission"],["Testimonials","/testimonials"],["Work with me","/work-with-me"],["Contact","/contact"]];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const header = useRef(null);
  const trigger = useRef(null);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const node = header.current;
    let timer;
    const reveal = () => {
      setVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!open && !node.matches(":hover, :focus-within")) setVisible(false);
      }, 5000);
    };
    const pointer = (event) => { if (event.clientY <= 24) reveal(); };
    reveal();
    for (const event of ["scroll", "touchstart", "keydown"]) window.addEventListener(event, reveal, {passive:true});
    window.addEventListener("pointermove", pointer, {passive:true});
    node.addEventListener("pointerleave", reveal);
    node.addEventListener("focusout", reveal);
    return () => {
      clearTimeout(timer);
      for (const event of ["scroll", "touchstart", "keydown"]) window.removeEventListener(event, reveal);
      window.removeEventListener("pointermove", pointer);
      node.removeEventListener("pointerleave", reveal);
      node.removeEventListener("focusout", reveal);
    };
  }, [open, pathname]);
  return <><div className="m-header-slot"><header ref={header} data-visible={visible} onFocus={() => setVisible(true)} className="m-header" onKeyDown={(event) => {
    if (event.key === "Escape" && open) {
      setOpen(false);
      trigger.current?.focus();
    }
  }}>
    <Link className="m-logo" to="/" aria-label="Mystic Mind home"><img src="/brand/logo-white.svg" alt="Mystic Mind" /></Link>
    <nav aria-label="Main navigation" className="m-nav">
      {links.filter(([name]) => !["Mission","Contact"].includes(name)).map(([name,path]) => <NavLink key={path} to={path}>{name}</NavLink>)}
      <button ref={trigger} type="button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(!open)}>Menu</button>
      <div className="m-menu" id="site-menu" hidden={!open}>{links.map(([name,path]) => <NavLink key={path} to={path} onClick={() => {setOpen(false); trigger.current?.focus();}}>{name}</NavLink>)}</div>
    </nav>
  </header></div>{!visible && <button className="m-reveal" onClick={() => {setVisible(true); trigger.current?.focus();}}>Show navigation</button>}</>;
}
