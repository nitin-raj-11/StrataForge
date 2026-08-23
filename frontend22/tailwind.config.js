/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          bg: '#0B0E14',
          panel: '#10141C',
          card: '#151A24',
          border: '#232938',
          borderMuted: '#1B212D',
        },
        ink: {
          primary: '#E7EAF0',
          muted: '#8890A0',
          faint: '#5A6172',
        },
        accent: {
          amber: '#E3A008',
          amberDim: '#8A650F',
        },
        gain: {
          DEFAULT: '#34D399',
          dim: '#1F5E48',
          bg: 'rgba(52, 211, 153, 0.08)',
        },
        loss: {
          DEFAULT: '#F0554B',
          dim: '#6B2622',
          bg: 'rgba(240, 85, 75, 0.08)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
      },
      animation: {
        scan: 'scan 3.5s ease-in-out infinite',
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
