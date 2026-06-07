const neutral = {
  50: "#FAFAFA",
  100: "#F5F5F5",
  150: "#ECECEC",
  200: "#E5E5E5",
  300: "#D4D4D4",
  400: "#A3A3A3",
  500: "#737373",
  600: "#525252",
  700: "#404040",
  800: "#262626",
  900: "#171717",
  950: "#0A0A0A",
};

const config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neutral,
        accent: {
          DEFAULT: "#000000",
          foreground: "#FFFFFF",
          muted: "#171717",
        },
        success: {
          DEFAULT: "#22C55E",
          bg: "#F0FDF4",
          border: "#BBF7D0",
        },
        warning: {
          DEFAULT: "#F59E0B",
          bg: "#FFFBEB",
          border: "#FDE68A",
        },
        error: {
          DEFAULT: "#EF4444",
          bg: "#FEF2F2",
          border: "#FECACA",
        },
        info: {
          DEFAULT: "#3B82F6",
          bg: "#EFF6FF",
          border: "#BFDBFE",
        },
        purple: {
          DEFAULT: "#8B5CF6",
          bg: "#F5F3FF",
          border: "#DDD6FE",
        },
        orange: {
          DEFAULT: "#F97316",
          bg: "#FFF7ED",
          border: "#FED7AA",
        },
        page: "#FAFAFA",
        card: "#FFFFFF",
        soft: "#F5F5F5",
        line: "#ECECEC",
        "success-bg": "#F0FDF4",
        "warning-bg": "#FFFBEB",
        "error-bg": "#FEF2F2",
        "info-bg": "#EFF6FF",
        "purple-bg": "#F5F3FF",
        primary: {
          DEFAULT: neutral[900],
          50: neutral[50],
          100: neutral[100],
          200: neutral[200],
          300: neutral[300],
          400: neutral[400],
          500: neutral[500],
          600: neutral[700],
          700: neutral[800],
          800: neutral[900],
          900: neutral[950],
        },
        gray: neutral,
      },
      backgroundColor: {
        page: "#FAFAFA",
        card: "#FFFFFF",
        soft: "#F5F5F5",
        main: "#FAFAFA",
        sub: "#FFFFFF",
      },
      textColor: {
        main: neutral[900],
        secondary: neutral[600],
        muted: neutral[400],
      },
      borderColor: {
        DEFAULT: neutral[200],
        border: neutral[200],
        line: neutral[150],
      },
      fontFamily: {
        sans: [
          "Inter",
          "Noto Sans SC",
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
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      fontSize: {
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["12px", { lineHeight: "18px" }],
        base: ["13px", { lineHeight: "20px" }],
        md: ["14px", { lineHeight: "22px" }],
        lg: ["16px", { lineHeight: "24px" }],
        xl: ["18px", { lineHeight: "28px" }],
        "2xl": ["22px", { lineHeight: "32px" }],
        "3xl": ["28px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "44px" }],
        "5xl": ["48px", { lineHeight: "56px" }],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "10px",
        xl: "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0, 0, 0, 0.04), 0 0 0 0.5px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.08), 0 0 0 0.5px rgba(0, 0, 0, 0.08)",
        popover: "0 12px 32px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(0, 0, 0, 0.08)",
        modal: "0 24px 64px rgba(0, 0, 0, 0.18), 0 0 0 0.5px rgba(0, 0, 0, 0.08)",
        btn: "0 1px 1px rgba(0, 0, 0, 0.08)",
        glow: "0 0 0 1px rgba(255, 255, 255, 0.12), 0 24px 80px rgba(0, 0, 0, 0.24)",
        soft: "0 4px 16px rgba(0, 0, 0, 0.06)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0,0,0,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.035) 1px, transparent 1px)",
        "dot-pattern": "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.12) 1px, transparent 0)",
        "auth-gradient":
          "radial-gradient(circle at top left, rgba(255,255,255,0.92), transparent 34%), linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 45%, #E5E5E5 100%)",
        "hero-gradient":
          "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.28), transparent 28%), linear-gradient(180deg, #0A0A0A 0%, #171717 58%, #262626 100%)",
      },
      backgroundSize: {
        grid: "20px 20px",
        dots: "18px 18px",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "apple-out": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        skeleton: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.42" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        skeleton: "skeleton 1.5s ease-in-out infinite",
        "fade-in": "fade-in 160ms cubic-bezier(0.25, 0.1, 0.25, 1)",
        "scale-in": "scale-in 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
