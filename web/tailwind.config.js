/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
    plugins: [require('tailwindcss-animate')],
    theme: {
        extend: {
            backgroundColor: {
                default: 'var(--bg-primary)',
                secondary: 'var(--bg-secondary)',
                muted: 'var(--bg-muted)',
                hover: 'var(--bg-hover)',
            },
            borderColor: {
                DEFAULT: 'var(--border)',
            },
            outlineColor: {
                DEFAULT: 'var(--border)',
            },
            textColor: {
                link: 'var(--link)',
                muted: 'var(--text-muted)',
                secondary: 'var(--text-secondary)',
                default: 'var(--text-primary)',
            },
        },
    },
};
