import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(30 25% 88%)",
        input: "hsl(30 25% 88%)",
        ring: "hsl(24 95% 58%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(20 30% 15%)",
        muted: {
          DEFAULT: "hsl(30 40% 96%)",
          foreground: "hsl(20 15% 45%)"
        },
        primary: {
          DEFAULT: "hsl(24 95% 58%)",
          foreground: "hsl(0 0% 100%)"
        },
        secondary: {
          DEFAULT: "hsl(172 60% 40%)",
          foreground: "hsl(0 0% 100%)"
        },
        success: {
          DEFAULT: "hsl(142 65% 42%)",
          foreground: "hsl(0 0% 100%)"
        },
        danger: {
          DEFAULT: "hsl(0 72% 55%)",
          foreground: "hsl(0 0% 100%)"
        }
      }
    }
  },
  plugins: [],
};

export default config;
