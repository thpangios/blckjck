/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // === PROFESSIONAL COLOR PALETTE ===
      colors: {
        // Primary: Deep blacks and grays
        'casino-black': {
          DEFAULT: '#0B0B0C',
          light: '#1A1A1C',
          lighter: '#2A2A2C',
        },
        // Accent: Gold (use sparingly!)
        'casino-gold': {
          100: '#FFF9E6',
          200: '#FFE9B3',
          300: '#FFD980',
          400: '#FFC94D',
          500: '#FFB400', // Primary gold
          600: '#D4AF37', // Muted gold
          700: '#B8941E',
          800: '#8B7014',
          900: '#5E4A0A',
        },
        // Neutrals: Subtle grays
        'casino-gray': {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Semantic colors
        'casino-green': '#0A4D2E',
        'casino-red': '#8B0000',
        'casino-blue': '#1E3A8A',
      },

      // === TYPOGRAPHY SCALE ===
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
        '8xl': ['6rem', { lineHeight: '1' }],           // 96px
      },

      // === FONT FAMILIES ===
      fontFamily: {
        'display': ['Cinzel', 'serif'],           // Luxury headings
        'heading': ['Bebas Neue', 'sans-serif'],  // Bold titles
        'body': ['Montserrat', 'sans-serif'],     // Body text
        'elegant': ['Playfair Display', 'serif'], // Elegant accents
        'tech': ['Orbitron', 'monospace'],        // Numbers/tech
      },

      // === SPACING SCALE (4px increments) ===
      spacing: {
        '0': '0',
        '1': '0.25rem',  // 4px
        '2': '0.5rem',   // 8px
        '3': '0.75rem',  // 12px
        '4': '1rem',     // 16px
        '5': '1.25rem',  // 20px
        '6': '1.5rem',   // 24px
        '8': '2rem',     // 32px
        '10': '2.5rem',  // 40px
        '12': '3rem',    // 48px
        '16': '4rem',    // 64px
        '20': '5rem',    // 80px
        '24': '6rem',    // 96px
        '32': '8rem',    // 128px
      },

      // === BORDER RADIUS SCALE ===
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',   // 4px
        'md': '0.5rem',    // 8px
        'lg': '0.75rem',   // 12px
        'xl': '1rem',      // 16px
        '2xl': '1.5rem',   // 24px
        '3xl': '2rem',     // 32px
        'full': '9999px',
      },

      // === SHADOW SCALE ===
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 2px 8px 0 rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 16px 0 rgba(0, 0, 0, 0.15)',
        'hard': '0 8px 24px 0 rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px 0 rgba(255, 180, 0, 0.3)',
        'glow-strong': '0 0 40px 0 rgba(255, 180, 0, 0.5)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'none': 'none',
      },

      // === ANIMATION TIMING ===
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
      },

      // === BACKDROP BLUR ===
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '20px',
        'xl': '40px',
      },

      // === Z-INDEX SCALE ===
      zIndex: {
        'base': 0,
        'dropdown': 1000,
        'sticky': 1100,
        'modal': 1300,
        'popover': 1400,
        'tooltip': 1500,
      },
    },
  },
  plugins: [],
}
