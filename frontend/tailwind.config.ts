import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary accent colors
                primary: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#2563eb", // Electric Blue
                    600: "#1d4ed8",
                    700: "#1e40af",
                    800: "#1e3a8a",
                    900: "#1e3a8a",
                },
                accent: {
                    50: "#ecfeff",
                    100: "#cffafe",
                    200: "#a5f3fc",
                    300: "#67e8f9",
                    400: "#22d3ee",
                    500: "#06b6d4", // Teal/Cyan
                    600: "#0891b2",
                    700: "#0e7490",
                    800: "#155e75",
                    900: "#164e63",
                },
                // Dark theme colors
                dark: {
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                    300: "#cbd5e1",
                    400: "#94a3b8",
                    500: "#64748b",
                    600: "#475569",
                    700: "#334155",
                    800: "#1e293b",
                    900: "#0f172a",
                    950: "#020617",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "Fira Code", "monospace"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-glow":
                    "radial-gradient(ellipse at center, var(--tw-gradient-stops))",
                "mesh-gradient":
                    "linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(37, 99, 235, 0.1) 50%, rgba(124, 58, 237, 0.1) 100%)",
            },
            boxShadow: {
                glow: "0 0 20px rgba(6, 182, 212, 0.3)",
                "glow-lg": "0 0 40px rgba(6, 182, 212, 0.4)",
                "glow-primary": "0 0 20px rgba(37, 99, 235, 0.3)",
                glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
            },
            backdropBlur: {
                xs: "2px",
            },
            animation: {
                "slide-in": "slideIn 0.3s ease-out",
                "fade-in": "fadeIn 0.3s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "typing": "typing 1.5s steps(3) infinite",
                "glow-pulse": "glowPulse 2s ease-in-out infinite",
            },
            keyframes: {
                slideIn: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                typing: {
                    "0%, 100%": { opacity: "1" },
                    "50%": { opacity: "0.5" },
                },
                glowPulse: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(6, 182, 212, 0.3)" },
                    "50%": { boxShadow: "0 0 40px rgba(6, 182, 212, 0.5)" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
