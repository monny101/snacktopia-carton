
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mondoBlue: '#0055b7',
        mondoYellow: '#ffd700',
        sidebar: {
          background: "#0055b7",
          foreground: "#ffffff",
          border: "rgb(30, 58, 138)",
          accent: {
            DEFAULT: "#ffd700",
            foreground: "#0055b7"
          },
          ring: "rgb(30, 58, 138)"
        }
      },
    },
  },
  plugins: [],
}
