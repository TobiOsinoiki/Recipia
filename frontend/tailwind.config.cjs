/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        recipia: {
          red: "#c0392b",
          redDark: "#922b21",
          olive: "#3c540d",
          cream: "#fffdf5",
          yellow: "#fde047",
        },
      },
    },
  },
  plugins: [],
};