import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:brightness-110",
  ghost: "bg-white/5 text-text-primary hover:bg-white/10 border border-border",
  danger: "bg-danger/90 text-white hover:bg-danger",
  outline: "bg-transparent border border-border text-text-primary hover:bg-white/5",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  disabled,
  loading,
  icon: Icon,
  size = "md",
  ...props
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      disabled={disabled || loading}
      className={`relative overflow-hidden rounded-xl font-medium inline-flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      ) : (
        <>
          {Icon && <Icon size={16} />}
          {children}
        </>
      )}
    </motion.button>
  );
}
