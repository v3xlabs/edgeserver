/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require(__dirname + '/static/defaultTheme.cjs')], // Only for this package, others use package/defaultTheme
    darkMode: 'class',
    content: ['./src/**/*.{html,js,ts,jsx,tsx}'],

    plugins: [],
};
