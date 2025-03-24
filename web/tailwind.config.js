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
                accent: 'var(--link)',
                muted: 'var(--bg-muted)',
                hover: 'var(--bg-hover)',
            },
            borderColor: {
                DEFAULT: 'var(--border)',
            },
            outlineColor: {
                DEFAULT: 'var(--border)',
                default: 'var(--border)',
            },
            textColor: {
                link: 'var(--link)',
                muted: 'var(--text-muted)',
                secondary: 'var(--text-secondary)',
                default: 'var(--text-primary)',
            },
            keyframes: {
                'collapsible-down': {
                    from: { height: 0 },
                    to: { height: 'var(--radix-collapsible-content-height)' },
                },
                'collapsible-up': {
                    from: { height: 'var(--radix-collapsible-content-height)' },
                    to: { height: 0 },
                },
            },
            animation: {
                'collapsible-down': 'collapsible-down 0.2s ease-out',
                'collapsible-up': 'collapsible-up 0.2s ease-out',
            },
        },
    },
};
