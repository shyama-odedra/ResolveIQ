import { motion } from "framer-motion";
import { initials } from "../../utils/format";

export function Card({ children, className = "", hover = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -1, boxShadow: "0 2px 4px rgba(15,27,45,0.06), 0 12px 28px rgba(15,27,45,0.10)" } : undefined}
      className={`panel shadow-sm rounded-xl2 p-5 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ children, color = "#1F4FD1", className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium capitalize tracking-tight ${className}`}
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
      className="rounded-full bg-blush/60 border border-blush flex items-center justify-center text-xs font-semibold text-primary shrink-0"
    >
      {initials(name)}
    </div>
  );
}
