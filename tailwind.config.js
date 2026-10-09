/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jev: {
          void: '#0a0b0e',
          terminal: '#0d1117',
          null: '#ef4444',
          choice: '#f59e0b',
          radiant: '#06b6d4',
          radiantGold: '#eab308',
          phosphor: '#22c55e',
          amber: '#fbbf24',
          cyan: '#38bdf8',
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        display: ['"Cinzel Decorative"', '"Press Start 2P"', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.45)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.45)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.45)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.45)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 0.15s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
