/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chess: {
          bg: '#312e2b',
          darkBg: '#312e2b',
          card: '#262421',
          cardHover: '#302e2b',
          cardBorder: '#383531',
          borderSubtle: '#383531',
          sidebar: '#161512',
          panel: '#262421',
          accent: '#81b64c',
          accentHover: '#95c95f',
          accentDark: '#457524',
          shadow3d: '#457524',
          amberGlow: '#ff7a00',
          yellow: '#f1c40f',
          bulletGold: '#e67e22',
          boardLight: '#ebecd0',
          boardDark: '#739552',
          textMain: '#ffffff',
          textMuted: '#bab8b6',
          textNeutral: '#bab8b6',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
        'glass-glow': '0 0 25px rgba(129, 182, 76, 0.25), 0 10px 30px rgba(0, 0, 0, 0.6)',
        'amber-glow': '0 0 25px rgba(255, 122, 0, 0.3)',
        'btn-3d': '0 5px 0 #457524',
      }
    },
  },
  plugins: [],
}
