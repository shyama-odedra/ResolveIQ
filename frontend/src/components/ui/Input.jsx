export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="text-sm text-text-secondary mb-1.5 block">{label}</span>}
      <input
        className={`w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-text-primary placeholder:text-text-secondary/60 focus:border-primary/60 focus:bg-white/[0.07] outline-none transition-colors ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger mt-1 block">{error}</span>}
    </label>
  );
}

export function Textarea({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="text-sm text-text-secondary mb-1.5 block">{label}</span>}
      <textarea
        className={`w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-text-primary placeholder:text-text-secondary/60 focus:border-primary/60 focus:bg-white/[0.07] outline-none transition-colors resize-none ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-danger mt-1 block">{error}</span>}
    </label>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="text-sm text-text-secondary mb-1.5 block">{label}</span>}
      <select
        className={`w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-text-primary focus:border-primary/60 outline-none transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-danger mt-1 block">{error}</span>}
    </label>
  );
}
