import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        white: "#FFFFFF",
        black: "#000000",
        neutral: {
          "50": "#FAFAF9",
          "100": "#F5F5F4",
          "200": "#E7E5E4",
          "300": "#D6D3D1",
          "400": "#A8A29E",
          "500": "#78716C",
          "600": "#57534E",
          "700": "#44403C",
          "800": "#292524",
          "900": "#171717",
          "950": "#0C0A09",
          DEFAULT: "var(--bls-neutral)",
          foreground: "var(--bls-neutral-foreground)",
          backing: "var(--bls-neutral-backing)",
          minor: "var(--bls-neutral-minor)",
        },
        primary: {
          DEFAULT: "hsl(var(--bls-primary))",
          backing: "var(--bls-primary-backing)",
          outline: "var(--bls-primary-outline)",
        },
        secondary: {
          DEFAULT: "hsl(var(--bls-secondary))",
          backing: "var(--bls-secondary-backing)",
        },
        success: {
          DEFAULT: "hsl(var(--bls-success))",
          backing: "var(--bls-success-backing)",
        },
        warning: {
          DEFAULT: "hsl(var(--bls-warning))",
          backing: "var(--bls-warning-backing)",
        },
        danger: {
          DEFAULT: "hsl(var(--bls-danger))",
          backing: "var(--bls-danger-backing)",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      prefix: "bls",
      addCommonColors: true,
      defaultTheme: "light",
      defaultExtendTheme: "light",
      layout: {},
      themes: {
        light: {
          layout: {},
          colors: {
            background: "#FAFAF9",
            foreground: {
              "50": "#FAFAF9",
              "100": "#F5F5F4",
              "200": "#E7E5E4",
              "300": "#D6D3D1",
              "400": "#A8A29E",
              "500": "#78716C",
              "600": "#57534E",
              "700": "#44403C",
              "800": "#292524",
              "900": "#171717",
              DEFAULT: "#171717",
            },
            divider: "#D6D3D1",
            overlay: "#171717",
            focus: "#157A78",
            content1: "#FFFFFF",
            content2: "#E7E5E4",
            content3: "#D6D3D1",
            content4: "#A8A29E",
            primary: {
              "50": "#EBFDF9",
              "100": "#CFF4EE",
              "200": "#B2E7E0",
              "300": "#8ED3CC",
              "400": "#6EBFB8",
              "500": "#409A96",
              "600": "#157A78",
              "700": "#006361",
              "800": "#024644",
              "900": "#0E2625",
              DEFAULT: "#006361",
              foreground: "#EBFDF9",
            },
            secondary: {
              "50": "#FCF4E6",
              "100": "#F3E8D3",
              "200": "#ECD8B2",
              "300": "#D5B880",
              "400": "#C19F5C",
              "500": "#A9863E",
              "600": "#886821",
              "700": "#664B07",
              "800": "#493608",
              "900": "#2E2207",
              DEFAULT: "#886821",
              foreground: "#FCF4E6",
            },
            success: {
              DEFAULT: "#12A150",
              foreground: "#F0FDF4",
            },
            warning: {
              DEFAULT: "#D97706",
              foreground: "#FFFBEB",
            },
            danger: {
              DEFAULT: "#F31260",
              foreground: "#FEE7EF",
            },
          },
        },
        dark: {
          layout: {},
          colors: {},
        },
      },
    }),
  ],
};
export default config;
