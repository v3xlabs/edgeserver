/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
    plugins: [import('tailwindcss-animate')],
    theme: {
        extend: {
            backgroundColor: {
                background: 'white',
                bg2: 'var(--background2)',
                muted: 'var(--muted)',
            },
            borderColor: {
                DEFAULT: 'var(--border)',
            },
            textColor: {
                text: 'var(--text)',
                link: 'var(--link)',
                secondary: 'var(--text-secondary)',
                primary: 'var(--text-primary)',
            },
        },
    },
};
