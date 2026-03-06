/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#eef2ff",
                    100: "#e0e7ff",
                    200: "#c7d2fe",
                    300: "#a5b4fc",
                    400: "#818cf8",
                    500: "#6366f1",   // primary indigo
                    600: "#4f46e5",
                    700: "#4338ca",
                    800: "#3730a3",
                    900: "#312e81",
                },
                surface: {
                    bg: "#f5f6fa",   // page background
                    panel: "#ffffff",   // card / panel
                    sidebar: "#ffffff",   // sidebar
                    border: "#e5e7eb",   // border gray-200
                    hover: "#f3f4f6",   // row hover
                },
                ink: {
                    heading: "#111827",  // gray-900
                    body: "#374151",  // gray-700
                    muted: "#6b7280",  // gray-500
                    faint: "#9ca3af",  // gray-400
                    line: "#e5e7eb",  // divider
                }
            },
            boxShadow: {
                card: '0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
                panel: '0 4px 20px -4px rgba(0, 0, 0, 0.05), 0 1px 4px -2px rgba(0, 0, 0, 0.02)',
                glass: '0 8px 32px 0 rgba(99, 102, 241, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
                'brand-glow': '0 0 20px 4px rgba(99, 102, 241, 0.15)',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0) scale(1)' },
                    '50%': { transform: 'translateY(-20px) scale(1.05)' },
                },
                'pulse-subtle': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.8 },
                }
            },
            animation: {
                'float-slow': 'float 8s ease-in-out infinite',
                'float-medium': 'float 6s ease-in-out infinite',
                'pulse-subtle': 'pulse-subtle 4s ease-in-out infinite',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
