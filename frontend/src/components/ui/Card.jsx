import { motion } from "framer-motion";
import { initials } from "../../utils/format";

export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.4)" } : undefined}
      className={`glass-panel rounded-xl2 p-5 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ children, color = "#8B5CF6", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}1A`,
        color,
        border: `1px solid ${color}33`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

export function Avatar({ name, src, size = 36 }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover border border-border"
      />
    );
  }
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-semibold text-white shrink-0"
    >
      {initials(name)}
    </div>
  );
}
