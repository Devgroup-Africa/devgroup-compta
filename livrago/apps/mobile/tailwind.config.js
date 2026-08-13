/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#16A34A",
        primaryDark: "#15803D",
        secondary: "#0F172A",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        muted: "#64748B",
        border: "#E2E8F0",
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
        info: "#2563EB"
      }
    }
  },
  plugins: []
};
