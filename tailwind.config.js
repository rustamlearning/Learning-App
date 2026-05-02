export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        galaxy: {
          surface: '#F8F7FF',
          lavender: '#F3E8FF',
          purple: '#7C3AED',
          deep: '#4C1D95',
          indigo: '#1E1B4B',
          navy: '#0F172A',
          cyan: '#22D3EE',
          teal: '#14B8A6',
          mint: '#CCFBF1',
          coral: '#FB7185',
          orange: '#F97316',
          gold: '#FACC15',
          magenta: '#E879F9',
          violet: '#A855F7',
        },
      },
      boxShadow: {
        glow: '0 22px 60px rgba(124, 58, 237, 0.22)',
        ocean: '0 20px 48px rgba(20, 184, 166, 0.18)',
        coral: '0 18px 42px rgba(251, 113, 133, 0.16)',
        soft: '0 18px 48px rgba(15, 23, 42, 0.08)',
      },
      backgroundImage: {
        'galaxy-primary': 'linear-gradient(135deg, #1E1B4B, #7C3AED, #E879F9)',
        'galaxy-deep': 'linear-gradient(135deg, #0F172A, #1E1B4B, #4C1D95)',
        'galaxy-action': 'linear-gradient(135deg, #4C1D95, #A855F7, #22D3EE)',
        'archipelago': 'linear-gradient(135deg, #7C3AED, #14B8A6 52%, #22D3EE)',
      },
    },
  },
  plugins: [],
}
