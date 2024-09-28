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
        background: "#F5F7FA",
        "text-black": "#171A1F",
        "primary-blue": "#2196F3",
        "gray-background": "#C5C5C5",
        "text-gray": "#7A7A7A",
        "text-light-gray": "#B3B3B4"
      },
      backgroundImage: {
        "landing-page-bg": "url('/landing-page-bg.svg')"
      }
    },
  },
  plugins: [],
  mode: "jit"
};
export default config;
