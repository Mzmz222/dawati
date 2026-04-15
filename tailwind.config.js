/** @type {import('tailwindcss').Config} */
export default {
  "./app/**/*.{js,ts,jsx,tsx}",
  "./components/**/*.{js,ts,jsx,tsx}",
  "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
        "primary": "#6A0DAD",
        "brand-purple": "#6A0DAD",
        "primary-container": "#e8ddff",
        "on-primary": "#ffffff",
        "on-primary-container": "#1d0061",
        "secondary": "#006d2f",
        "secondary-container": "#5dfd8a",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#002109",
        "tertiary": "#3d2755",
        "tertiary-container": "#efdbff",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#26103e",
        "surface": "#f8f9fa",
        "surface-variant": "#e1e3e4",
        "on-surface": "#191c1d",
        "on-surface-variant": "#494553",
        "outline": "#7a7584",
        "outline-variant": "#cbc3d5",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f5",
        "surface-container": "#edeeef",
        "surface-container-high": "#e7e8e9",
        "surface-container-highest": "#e1e3e4",
        "deeppurple": {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        }
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "1rem",
        "full": "9999px"
      },
      "fontFamily": {
        "headline": ["Plus Jakarta Sans", "Noto Serif", "Almarai"],
        "body": ["Manrope", "Almarai"],
        "label": ["Plus Jakarta Sans", "Almarai"]
      }
    },
  },
  plugins: [],
}
