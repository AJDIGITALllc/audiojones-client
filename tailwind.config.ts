import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF4500",
          50: "#FFE5DB",
          100: "#FFCDB8",
          200: "#FF9C70",
          300: "#FF6B29",
          400: "#FF4500",
          500: "#E03E00",
          600: "#C23600",
          700: "#A32E00",
          800: "#852600",
          900: "#661E00",
        },
        accent: {
          DEFAULT: "#FFD700",
          50: "#FFFDF0",
          100: "#FFF9D6",
          200: "#FFF3AD",
          300: "#FFED85",
          400: "#FFE75C",
          500: "#FFD700",
          600: "#D6B400",
          700: "#AD9100",
          800: "#856F00",
          900: "#5C4D00",
        },
        support: {
          DEFAULT: "#008080",
          50: "#E0F2F2",
          100: "#B3E0E0",
          200: "#80CCCC",
          300: "#4DB8B8",
          400: "#26A8A8",
          500: "#008080",
          600: "#007373",
          700: "#006363",
          800: "#005454",
          900: "#003737",
        },
        background: {
          DEFAULT: "#0A0A0A",
          card: "#1E1E1E",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
