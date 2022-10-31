const theme = require('@edgelabs/core-ui/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [theme.defaultTheme],
    darkMode: 'class',
    content: ['./src/**/*.{html,js,ts,jsx,tsx}', theme.componentsInclude],

    plugins: [],
};
