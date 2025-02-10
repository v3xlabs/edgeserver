/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
    plugins: [import('tailwindcss-animate')],
    theme: {
        extend: {
            backgroundColor: {
                default: 'var(--bg-primary)',
                secondary: 'var(--bg-secondary)',
                muted: 'var(--bg-muted)',
                hover: 'var(--bg-hover)',
            },
            borderColor: {
                default: 'var(--border)',
            },
            outlineColor: {
                default: 'var(--border)',
            },
            textColor: {
                link: 'var(--link)',
                secondary: 'var(--text-secondary)',
                default: 'var(--text-primary)',
            },
        },
    },
};
