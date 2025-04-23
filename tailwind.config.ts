import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        'britti-sans': ['var(--font-britti-sans)', 'sans-serif'],
        serif: ['var(--font-dm-serif)']
      },
      colors: {
        background: {
          DEFAULT: '#111827',
          secondary: '#1F2937',
        },
        primary: {
          DEFAULT: '#6D28D9',
          hover: '#5B21B6',
          dark: '#4C1D95',
          light: '#8B5CF6',
        },
        accent: {
          DEFAULT: '#EC4899',
          hover: '#DB2777',
          dark: '#BE185D',
          light: '#F472B6',
        },
        'mood-purple': {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#8b5cf6',
          700: '#6d28d9',
          900: '#4c1d95',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
