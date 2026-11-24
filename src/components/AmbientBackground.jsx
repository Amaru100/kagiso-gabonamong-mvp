import { useEffect, useRef } from "react";

export default function AmbientBackground() {
  const light = useRef(null);
  useEffect(() => {
    let frame = 0;
    let x, y;
    const pointer = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const move = (event) => {
      if (!pointer.matches || reduced.matches || event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        light.current.style.setProperty("--mx", x + "px");
        light.current.style.setProperty("--my", y + "px");
        frame = 0;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div className="ambient" aria-hidden="true"><div className="ambient-light" ref={light} /></div>;
}
