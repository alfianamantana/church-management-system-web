/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        container: {
            center: true,
        },
        extend: {
            colors: {
                background: 'hsl(var(--background) / <alpha-value>)',
                foreground: 'hsl(var(--foreground) / <alpha-value>)',
                card: 'hsl(var(--card) / <alpha-value>)',
                'card-foreground': 'hsl(var(--foreground) / <alpha-value>)',
                popover: 'hsl(var(--card) / <alpha-value>)',
                'popover-foreground': 'hsl(var(--foreground) / <alpha-value>)',
                primary: 'hsl(var(--primary) / <alpha-value>)',
                'primary-foreground': 'hsl(var(--primary-foreground) / <alpha-value>)',
                secondary: 'hsl(var(--secondary) / <alpha-value>)',
                'secondary-foreground': 'hsl(var(--secondary-foreground) / <alpha-value>)',
                muted: 'hsl(var(--muted) / <alpha-value>)',
                'muted-foreground': 'hsl(var(--muted-foreground) / <alpha-value>)',
                accent: 'hsl(var(--accent) / <alpha-value>)',
                'accent-foreground': 'hsl(var(--accent-foreground) / <alpha-value>)',
                destructive: 'hsl(var(--destructive) / <alpha-value>)',
                border: 'hsl(var(--border) / <alpha-value>)',
                input: 'hsl(var(--input) / <alpha-value>)',
                ring: 'hsl(var(--ring) / <alpha-value>)',
                sidebar: 'hsl(var(--sidebar) / <alpha-value>)',
                'sidebar-foreground': 'hsl(var(--sidebar-foreground) / <alpha-value>)',
                'sidebar-accent': 'hsl(var(--sidebar-accent) / <alpha-value>)',
                'sidebar-accent-foreground': 'hsl(var(--sidebar-accent-foreground) / <alpha-value>)',
                'sidebar-border': 'hsl(var(--sidebar-border) / <alpha-value>)',
                'sidebar-ring': 'hsl(var(--ring) / <alpha-value>)',
                success: 'hsl(var(--success) / <alpha-value>)',
                warning: 'hsl(var(--primary) / <alpha-value>)',
                info: 'hsl(217 91% 60% / <alpha-value>)',
                dark: 'hsl(217 33% 17% / <alpha-value>)',
            },
            fontFamily: {
                nunito: ['Nunito', 'sans-serif'],
            },
            spacing: {
                4.5: '18px',
            },
            boxShadow: {
                '3xl': '0 2px 2px rgb(224 230 237 / 46%), 1px 6px 7px rgb(224 230 237 / 46%)',
            },
            typography: ({ theme }) => ({
                DEFAULT: {
                    css: {
                        '--tw-prose-invert-headings': theme('colors.white.dark'),
                        '--tw-prose-invert-links': theme('colors.white.dark'),
                        h1: { fontSize: '40px', marginBottom: '0.5rem', marginTop: 0 },
                        h2: { fontSize: '32px', marginBottom: '0.5rem', marginTop: 0 },
                        h3: { fontSize: '28px', marginBottom: '0.5rem', marginTop: 0 },
                        h4: { fontSize: '24px', marginBottom: '0.5rem', marginTop: 0 },
                        h5: { fontSize: '20px', marginBottom: '0.5rem', marginTop: 0 },
                        h6: { fontSize: '16px', marginBottom: '0.5rem', marginTop: 0 },
                        p: { marginBottom: '0.5rem' },
                        li: { margin: 0 },
                        img: { margin: 0 },
                    },
                },
            }),
        },
        screens: {
            sm: '320px',
            md: '768px',
            lg: '976px',
            xl: '1440px',
        },
    },
    plugins: [
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
        require('@tailwindcss/typography'),
    ],
};
