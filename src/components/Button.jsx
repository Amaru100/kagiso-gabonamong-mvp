import { Link } from 'react-router-dom'

const styles = {
  primary: 'bg-[#d6b15e] text-[#070707] hover:bg-[#f0cf7a]',
  secondary: 'border border-[#d6b15e]/45 text-[#f8f4e8] hover:bg-[#d6b15e]/10',
  ghost: 'text-[#d6b15e] hover:bg-[#d6b15e]/10',
}

export default function Button({ children, to, type = 'button', variant = 'primary', className = '', onClick, ...props }) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-bold transition ${styles[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  )
}
