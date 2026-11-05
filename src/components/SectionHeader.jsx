import { motion, useReducedMotion } from "framer-motion";

export default function SectionHeader({ eyebrow, title, text }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 1, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.45 }}
      className="mx-auto mb-10 max-w-3xl text-center"
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#8dc6a7]">
          {eyebrow}
        </p>
      )}
      <h2 className="section-title text-[#f0f4ef]">{title}</h2>
      {text && (
        <p className="mt-4 text-base leading-7 text-[#bbc6bf]">{text}</p>
      )}
    </motion.div>
  );
}
