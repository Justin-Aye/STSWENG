/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'card_bg': 'white',
        'nav_bg': '#6096B4',
        'doc_bg': '#ECF9FF',
        'card_comment': '#F2F2F2'
      },
    },
  },
  plugins: [],
}
