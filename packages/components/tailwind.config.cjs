/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('@edgelabs/core-ui/defaultTheme')], // Only for this package, others use package/defaultTheme
    darkMode: 'class',
    content: ['./src/**/*.{html,js,ts,jsx,tsx}'],

    plugins: [],
};
