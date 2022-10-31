/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('@edgelabs/core-ui/theme').defaultTheme],
    darkMode: 'class',
    content: ['./src/**/*.{html,js,ts,jsx,tsx}', './index.html'],

    plugins: [],
};
