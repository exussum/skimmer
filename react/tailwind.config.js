/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite-react/**/*.js",
  ],
  theme: {
    colors: {
      wallpaper: "#22092C",
      content: "#872341",
      menu: "#BE3144",
      popup: "#F05941"
    }
  },
  plugins: [require("flowbite/plugin")],
};
