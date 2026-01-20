import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2d4a2b',
          dark: '#1f3520',
          light: '#3d5a3b',
        },
        military: {
          900: '#0f1410',
          800: '#1a2318',
          700: '#253120',
          600: '#2d4a2b',
          500: '#3d5a3b',
          400: '#4d6a4b',
          300: '#5d7a5b',
        },
        accent: {
          green: '#4ade80',
          yellow: '#fbbf24',
          red: '#ef4444',
          blue: '#3b82f6',
        }
      },
    },
  },
  plugins: [],
};
export default config;
