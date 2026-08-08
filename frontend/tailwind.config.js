/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#09090B",
        card: "#111827",
        glass: "rgba(255,255,255,0.06)",
        border: "rgba(255,255,255,0.08)",
        primary: "#8B5CF6",
        secondary: "#6366F1",
        accent: "#06B6D4",
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Cal Sans", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(139, 92, 246, 0.15)",
        soft: "0 8px 30px rgba(0,0,0,0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
