/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Noto Sans'", "sans-serif"],
        devanagari: ["'Noto Sans Devanagari'", "sans-serif"],
        kruti: ["'KrutiDev010'", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3ccff",
          300: "#80abff",
          400: "#4d80ff",
          500: "#2657f5",
          600: "#1a3fd1",
          700: "#1730a6",
          800: "#152a82",
          900: "#132568",
        },
        finger: {
          "left-pinky": "#f97316",
          "left-ring": "#eab308",
          "left-middle": "#22c55e",
          "left-index": "#06b6d4",
          "left-thumb": "#94a3b8",
          "right-thumb": "#94a3b8",
          "right-index": "#8b5cf6",
          "right-middle": "#ec4899",
          "right-ring": "#f43f5e",
          "right-pinky": "#0ea5e9",
        },
      },
    },
  },
  plugins: [],
};
