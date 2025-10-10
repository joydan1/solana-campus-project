/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        Purple: "#9945FF",
        Pink: "#DC1FFF",
        Green: "#00FFA3",
        Dark: "#0A0B0D",
      },
    },
  },
  plugins: [],
};
