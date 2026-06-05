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
        // 核心色板
        primary: {
          DEFAULT: "#2962FF",
          50: "#EEF3FF",
          100: "#DCE5FF",
          200: "#B8CCFF",
          300: "#8AA9FF",
          400: "#5B85FF",
          500: "#2962FF",
          600: "#1E4FE0",
          700: "#1640B8",
          800: "#0F308F",
          900: "#0A2166",
        },
        gray: {
          50: "#FAFBFC",
          100: "#F0F4F8",
          200: "#E4E9F0",
          300: "#D0D7E2",
          400: "#A8B3C2",
          500: "#8A9BA8",
          600: "#6B7C8A",
          700: "#4F5D6B",
          800: "#2E3744",
          900: "#1A1D21",
        },
        success: "#4CAF50",
        warning: "#FFC107",
        purple: "#9C27B0",
        orange: "#FF9800",
        info: "#03A9F4",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.04)",
        soft: "0 2px 8px 0 rgba(41, 98, 255, 0.08)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "20px 20px",
      },
    },
  },
  plugins: [],
};

export default config;
