/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './contexts/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        admin: {
          background: '#09070C',
          panel: 'rgba(19,16,24,0.96)',
          panelAlt: 'rgba(255,255,255,0.03)',
          border: 'rgba(255,255,255,0.06)',
          text: '#FFFFFF',
          muted: '#9CA3AF',
          subtle: '#6B7280',
          primary: '#6D28D9',
          primaryLight: '#8B5CF6',
          accent: '#A78BFA',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      borderRadius: {
        '4xl': '32px',
      },
      fontFamily: {
        cairo: ['Cairo_400Regular'],
        'cairo-bold': ['Cairo_700Bold'],
      },
      boxShadow: {
        glow: '0px 16px 30px rgba(139, 92, 246, 0.26)',
      },
    },
  },
  plugins: [],
};
