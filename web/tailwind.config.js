/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
    plugins: [import('tailwindcss-animate')],
    theme: {
        extend: {
            backgroundColor: {
                background: 'white',
            },
        },
    },
};
