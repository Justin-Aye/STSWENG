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
      fontFamily: {
      'sans': ['Poppins', 'ui-sans-serif', 'system-ui'],
      'serif': ['Merryweather', 'ui-sans-serif', 'system-ui'],
      'logo': ['Righteous', 'ui-sans-serif'],
      },
      colors:{
        'card_bg': 'white',
        'nav_bg': '#50C5B7',
        'nav_bg_dark': '#3AA1A3',
        'doc_bg': '#ECF9FF',
        'feed_bg': '#D0DBE5',
        'icon_color': '#583A71', 
        'card_comment': '#F2F2F2'
      },
      backgroundImage: {
        'signup_page': "url('/images/signup_bg.png')",
        'login_page': "url('/images/login_bg.png')",
      },
    },
  },
  plugins: [],
}
