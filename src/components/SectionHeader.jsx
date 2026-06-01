import { motion } from 'framer-motion'

export default function SectionHeader({ eyebrow, title, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.45 }}
      className="mx-auto mb-10 max-w-3xl text-center"
    >
      {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#d6b15e]">{eyebrow}</p>}
      <h2 className="text-3xl font-black text-[#f8f4e8] sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-7 text-[#cfc8b5]">{text}</p>}
    </motion.div>
  )
}
