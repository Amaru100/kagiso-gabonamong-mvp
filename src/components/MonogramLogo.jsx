const sizes = {
  sm: 'h-10 w-14 text-4xl',
  md: 'h-12 w-16 text-5xl',
  lg: 'h-24 w-32 text-8xl',
}

export default function MonogramLogo({ size = 'md', className = '', light = false }) {
  return (
    <span className={`kg-monogram relative inline-block ${sizes[size]} ${className}`} role="img" aria-label="KG monogram">
      <span className={`absolute left-0 top-1/2 -translate-y-1/2 ${light ? 'text-[#f8f4e8]' : 'text-[#d6b15e]'}`}>K</span>
      <span className="absolute left-[0.42em] top-1/2 -translate-y-[47%] text-[#d6b15e]">G</span>
    </span>
  )
}
