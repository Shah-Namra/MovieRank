import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        manrope: ["var(--font-manrope)"],
      },
    },
  },
  plugins: [],
};

export default config;
