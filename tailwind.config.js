/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",     // Next.js App Router
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",   // Pages Router fallback
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",     // General /src directory
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwindcss-animate"),       // Enables animation utilities
  ],
}
