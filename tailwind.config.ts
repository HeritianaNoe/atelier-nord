import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F1F2EE",
        mist: "#E4E7DF",
        line: "#CDD2C6",
        ink: "#14232A",
        slate: "#5B6B70",
        cobalt: "#2D46D8",
        "cobalt-dark": "#2236AE",
        danger: "#B3261E",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
