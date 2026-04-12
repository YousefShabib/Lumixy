/** @type {import('tailwindcss').Config} */
module.exports = {
<<<<<<< HEAD
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './contexts/**/*.{ts,tsx}'],
=======
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
>>>>>>> origin/feature/waleedarman-auth
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
<<<<<<< HEAD
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
=======
        background: '#0B010E',
        surface: '#150A1D',
        surfaceSecondary: '#241433',
        primary: '#6D28D9',
        primaryLight: '#8B5CF6',
        accent: '#A78BFA',
        text: '#FFFFFF',
        textSecondary: '#9CA3AF',
        textMuted: '#6B7280',
        border: '#2D1B44',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
>>>>>>> origin/feature/waleedarman-auth
      },
      fontFamily: {
        cairo: ['Cairo_400Regular'],
        'cairo-bold': ['Cairo_700Bold'],
      },
<<<<<<< HEAD
      boxShadow: {
        glow: '0px 16px 30px rgba(139, 92, 246, 0.26)',
      },
=======
>>>>>>> origin/feature/waleedarman-auth
    },
  },
  plugins: [],
};
