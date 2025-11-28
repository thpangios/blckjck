/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Muted Dark Mode (2025 trend - softer than pure black)
        dark: {
          900: '#0A0A0A',  // Almost black
          800: '#121212',  // Main bg
          700: '#1A1A1A',  // Card bg
          600: '#242424',  // Hover states
          500: '#2E2E2E',  // Borders
        },
        
        // Casino Green (felt table)
        casino: {
          900: '#0A3D2C',
          800: '#0F5132',
          700: '#146C43',
          600: '#198754',
          500: '#20C997',
        },
        
        // Gold/Yellow (premium accents)
        gold: {
          900: '#8B6914',
          800: '#B8860B',
          700: '#DAA520',
          600: '#FFD700',
          500: '#FFED4E',
        },
        
        // Vibrant Accents (2025 trend)
        electric: {
          cyan: '#00F5FF',
          purple: '#B026FF',
          pink: '#FF0080',
          green: '#00FF87',
        },
        
        // Semantic colors
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706',
        },
        info: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
      },
      
      // Enhanced shadows (elevation system)
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-strong': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.5)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
        'neon': '0 0 5px theme("colors.gold.600"), 0 0 20px theme("colors.gold.600")',
      },
      
      // Border radius scale
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      
      // Backdrop blur for glassmorphism
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      
      // Animation durations
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
      },
      
      // Custom animations
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 30px rgba(255, 215, 0, 0.4)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'card-flip': {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        'card-deal': {
          '0%': { transform: 'translateY(-100px) scale(0.5)', opacity: '0' },
          '60%': { transform: 'translateY(10px) scale(1.05)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'chip-toss': {
          '0%': { transform: 'translateY(0) rotate(0deg) scale(1)' },
          '50%': { transform: 'translateY(-30px) rotate(180deg) scale(1.2)' },
          '100%': { transform: 'translateY(0) rotate(360deg) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'fade-in-down': 'fade-in-down 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
        'wiggle': 'wiggle 0.5s ease-in-out infinite',
        'card-flip': 'card-flip 0.6s ease-in-out',
        'card-deal': 'card-deal 0.5s ease-out',
        'chip-toss': 'chip-toss 0.6s ease-out',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
