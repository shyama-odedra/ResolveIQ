/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // ResolveIQ palette: warm paper, navy ink, cobalt actions, amber/red severities.
        ink: "#0F1B2D",
        sidebar: "#0F1B2D",
        cream: "#F7F5F0",
        blush: "#ECE8E0",
        bg: "#F6F4EF",
        card: "#FFFFFF",
        border: "#E3DED4",
        primary: "#1F4FD1",
        "primary-dark": "#183FA8",
        secondary: "#475569",
        accent: "#475569",
        success: "#1E7A4F",
        warning: "#B45309",
        danger: "#B42318",
        critical: "#B42318",
        high: "#C2410C",
        medium: "#1F4FD1",
        low: "#64748B",
        "text-primary": "#0F1B2D",
        "text-secondary": "#5B6472",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        display: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,27,45,0.06), 0 6px 16px rgba(15,27,45,0.06)",
        sm: "0 1px 2px rgba(15,27,45,0.05)",
        lift: "0 2px 4px rgba(15,27,45,0.06), 0 12px 28px rgba(15,27,45,0.10)",
      },
      borderRadius: {
        xl: "0.5rem",
        "2xl": "0.625rem",
        xl2: "0.5rem",
      },
    },
  },
  plugins: [],
};
