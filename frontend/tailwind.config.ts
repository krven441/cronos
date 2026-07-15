import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg0: "#09090B",
        bg1: "#111114",
        bg2: "#16161A",
        gold: "#E6C16A",
        silver: "#D5D7DD",
        success: "#5CE58F",
        danger: "#FF6A6A",
      },
    },
  },
  plugins: [],
};
export default config;
