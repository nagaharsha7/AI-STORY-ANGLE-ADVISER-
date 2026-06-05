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
          light: '#ff8a50',
          DEFAULT: '#ff5722', // Telangana Today primary orange
          dark: '#e64a19',
          accent: '#ff9800'
        },
        darkbg: {
          deep: '#0a0a0c',    // Pure black/dark for background
          card: '#16161f',    // Glassmorphism card default
          border: '#2a2a35',  // Subtle border lines
          hover: '#22222e'    // Hover effect for list items
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-orange': '0 8px 32px 0 rgba(255, 87, 34, 0.15)'
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
