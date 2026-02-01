/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto"],
      },
      colors: {
        ink: "var(--ink)",
        muted: "var(--muted)",
        border: "var(--border)",
        surface: "var(--surface)",
        surfaceAlt: "var(--surface-muted)",
        accent: "var(--accent)",
      },
    },
  },
  plugins: [],
};
