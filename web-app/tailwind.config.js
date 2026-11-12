/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0B1120',
          card: '#0F172A',
          cardHover: '#1E293B',
          border: '#1E293B',
          accent: '#06B6D4',
          muted: '#64748B'
        },
        risk: {
          safe: '#10B981',
          low: '#3B82F6',
          medium: '#F59E0B',
          high: '#EF4444'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite'
      }
    },
  },
  plugins: [],
};

