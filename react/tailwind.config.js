/** @type {import('tailwindcss').Config} */
const svgToDataUri = require('mini-svg-data-uri')

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite-react/**/*.js",
  ],
  theme: {
    colors: {
      wallpaper: "#aec3b0",
      content: "#01161e",
      menu: "#124559",
      popup: "#598392",
    },
  },
};
