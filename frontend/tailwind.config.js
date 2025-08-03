/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'retro-black': '#0a0a0a',
        'dark-purple': '#1a0b2e',
        'neon-pink': '#ff2a6d',
        'neon-blue': '#05d9e8',
        'neon-purple': '#d442f8',
        'neon-green': '#39ff14',
        'neon-red': '#ff3131',
        'neon-yellow': '#ffff00',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'arcade': ['"Silkscreen"', 'cursive'],
      },
      boxShadow: {
        'neon-pink': '0 0 5px #FF00FF, 0 0 10px #FF00FF, 0 0 15px #FF00FF',
        'neon-blue': '0 0 5px #00F0FF, 0 0 10px #00F0FF, 0 0 15px #00F0FF',
        'neon-green': '0 0 5px #00FF00, 0 0 10px #00FF00, 0 0 15px #00FF00',
      },
      animation: {
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glitch': 'text-glitch 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'text-glitch': {
          '0%': { 
            'text-shadow': '0.05em 0 0 rgba(255, 0, 128, 0.75), -0.05em -0.025em 0 rgba(102, 236, 255, 0.75)' 
          },
          '14%': { 
            'text-shadow': '0.05em 0 0 rgba(255, 0, 128, 0.75), -0.05em -0.025em 0 rgba(102, 236, 255, 0.75)' 
          },
          '15%': { 
            'text-shadow': '-0.05em -0.025em 0 rgba(255, 0, 128, 0.75), 0.025em 0.025em 0 rgba(102, 236, 255, 0.75)' 
          },
          '49%': { 
            'text-shadow': '-0.05em -0.025em 0 rgba(255, 0, 128, 0.75), 0.025em 0.025em 0 rgba(102, 236, 255, 0.75)' 
          },
          '50%': { 
            'text-shadow': '0.025em 0.05em 0 rgba(255, 0, 128, 0.75), 0.05em 0 0 rgba(102, 236, 255, 0.75)' 
          },
          '99%': { 
            'text-shadow': '0.025em 0.05em 0 rgba(255, 0, 128, 0.75), 0.05em 0 0 rgba(102, 236, 255, 0.75)' 
          },
          '100%': { 
            'text-shadow': '0.05em 0 0 rgba(255, 0, 128, 0.75), -0.05em -0.025em 0 rgba(102, 236, 255, 0.75)' 
          },
        }
      },
    },
  },
  plugins: [],
} 