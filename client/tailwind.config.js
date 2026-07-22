/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10202b",
        mint: "#dff8ef",
        teal: "#167d7f",
        coral: "#f46d55",
        gold: "#f6c85f"
      }
    }
  },
  plugins: []
};
