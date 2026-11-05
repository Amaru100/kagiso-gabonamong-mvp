import { Link } from "react-router-dom";

const styles = {
  primary: "bg-[#06402B] text-white hover:bg-[#0b5a3d]",
  secondary: "border border-[#56866b]/60 text-[#f0f4ef] hover:bg-[#06402B]/40",
  ghost: "text-[#8dc6a7] hover:bg-[#8dc6a7]/10",
};

export default function Button({
  children,
  to,
  type = "button",
  variant = "primary",
  className = "",
  onClick,
  ...props
}) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-bold transition ${styles[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  );
}
