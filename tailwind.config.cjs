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
                background: 'oklch(var(--background) / <alpha-value>)',
                foreground: 'oklch(var(--foreground) / <alpha-value>)',
                card: 'oklch(var(--card) / <alpha-value>)',
                'card-foreground': 'oklch(var(--card-foreground) / <alpha-value>)',
                popover: 'oklch(var(--popover))',
                'popover-foreground': 'oklch(var(--popover-foreground))',
                primary: 'oklch(var(--primary) / <alpha-value>)',
                'primary-foreground': 'oklch(var(--primary-foreground))',
                secondary: 'oklch(var(--secondary))',
                'secondary-foreground': 'oklch(var(--secondary-foreground))',
                muted: 'oklch(var(--muted))',
                'muted-foreground': 'oklch(var(--muted-foreground))',
                accent: 'oklch(var(--accent) / <alpha-value>)',
                'accent-foreground': 'oklch(var(--accent-foreground) / <alpha-value>)',
                destructive: 'oklch(var(--destructive))',
                border: 'oklch(var(--border))',
                input: 'oklch(var(--input))',
                ring: 'oklch(var(--ring))',
                'ring-color': 'oklch(var(--ring))',
                dark: {
                    DEFAULT: 'hsl(var(--dark))',
                    light: 'hsl(210 20% 95%)',
                }, danger: 'hsl(var(--danger))',
                success: 'hsl(160 100% 37%)',
                warning: 'hsl(39 100% 50%)',
                info: 'hsl(207 90% 54%)',
                white: {
                    DEFAULT: 'hsl(0 0% 100%)',
                    light: 'hsl(210 20% 90%)',
                    dark: 'hsl(210 10% 50%)',
                }, chart: {
                    1: 'oklch(var(--chart-1))',
                    2: 'oklch(var(--chart-2))',
                    3: 'oklch(var(--chart-3))',
                    4: 'oklch(var(--chart-4))',
                    5: 'oklch(var(--chart-5))',
                },
                sidebar: 'oklch(var(--sidebar))',
                'sidebar-foreground': 'oklch(var(--sidebar-foreground))',
                'sidebar-primary': 'oklch(var(--sidebar-primary))',
                'sidebar-primary-foreground': 'oklch(var(--sidebar-primary-foreground))',
                'sidebar-accent': 'oklch(var(--sidebar-accent))',
                'sidebar-accent-foreground': 'oklch(var(--sidebar-accent-foreground))',
                'sidebar-border': 'oklch(var(--sidebar-border))',
                'sidebar-ring': 'oklch(var(--sidebar-ring))',
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
