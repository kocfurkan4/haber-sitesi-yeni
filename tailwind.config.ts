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
          DEFAULT: '#3d5a3b',
          dark: '#2d4a2b',
          light: '#4d6a4b',
        },
        military: {
          900: '#e8f0e8',
          800: '#d4e4d4',
          700: '#b8d4b8',
          600: '#9cbf9c',
          500: '#7ea87e',
          400: '#5d8a5d',
          300: '#4d6a4b',
        },
        accent: {
          green: '#16a34a',
          yellow: '#f59e0b',
          red: '#dc2626',
          blue: '#2563eb',
        }
      },
    },
  },
  plugins: [],
};
export default config;
