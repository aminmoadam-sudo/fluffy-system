import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          950: "#052e16",
          900: "#14532d",
          800: "#166534",
          700: "#15803d",
          600: "#16a34a",
          500: "#22c55e",
          400: "#4ade80",
          300: "#86efac",
        },
      },
      backgroundImage: {
        "green-glow":
          "radial-gradient(ellipse at center, rgba(22,163,74,0.15) 0%, transparent 70%)",
      },
      boxShadow: {
        "green-sm": "0 0 8px rgba(22,163,74,0.2)",
        "green-md": "0 0 20px rgba(22,163,74,0.2)",
        "green-lg": "0 0 40px rgba(22,163,74,0.25)",
        "green-glow": "0 0 60px rgba(22,163,74,0.15)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
