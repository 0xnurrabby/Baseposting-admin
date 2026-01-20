import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0c0f14",
        cloud: "#f6f7fb",
        mist: "#e7ebf3",
        accent: "#4f7cff"
      },
      boxShadow: {
        "soft-lg": "0 24px 60px rgba(15, 23, 42, 0.12)",
        "soft-md": "0 16px 30px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
