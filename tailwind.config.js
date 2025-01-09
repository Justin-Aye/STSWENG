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
        'nav-bg': '#50C5B7',
        'nav-bg-dark': '#3AA1A3',
        'doc-bg': '#ECF9FF',
        'feed-bg': '#D0DBE5',
        'icon-color': '#583A71', 
        'card-comment': '#F2F2F2'
      },
      backgroundImage: {
        'signup-page': "url('/images/signup_bg.png')",
        'login-page': "url('/images/login_bg.png')",
      },
    },
  },
  plugins: [],
}
