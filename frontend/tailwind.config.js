/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Sora'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dce8ff",
          200: "#b8d0ff",
          300: "#8eb3ff",
          400: "#5a8bff",
          500: "#2f63ff",
          600: "#1e46e0",
          700: "#1834ad",
          800: "#152b85",
          900: "#13245f",
        },
        accent: {
          mint: "#3ee8b5",
          violet: "#8b5cf6",
          coral: "#ff6b6b",
        },
        surface: {
          light: "#f6f8fc",
          dark: "#0b0e17",
          darkCard: "#131826",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(15, 23, 42, 0.12)",
        glow: "0 0 40px rgba(47, 99, 255, 0.25)",
      },
      backgroundImage: {
        "grad-primary": "linear-gradient(135deg, #2f63ff 0%, #8b5cf6 100%)",
        "grad-mint": "linear-gradient(135deg, #3ee8b5 0%, #2f63ff 100%)",
        "grad-dark": "linear-gradient(135deg, #0b0e17 0%, #13245f 100%)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
