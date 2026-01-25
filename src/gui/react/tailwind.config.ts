import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS Configuration
 * 
 * IMPORTANT: All values are extracted EXACTLY from src/gui/public/css/styles.css
 * DO NOT change these values - they must match the existing design exactly.
 */
const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      // ===========================================
      // COLORS - Exact values from styles.css :root
      // ===========================================
      colors: {
        // Paper & Ink (light mode values)
        paper: {
          cream: '#FAF6F1',
          // Dark mode paper color
          dark: '#1a1a1a',
          // Lined paper background (from styles.css --paper-lined)
          lined: '#E8E4D9',
        },
        ink: {
          black: '#1A1A1A',
          // Dark mode ink color (inverted)
          light: '#e0e0e0',
          faded: '#666666',
          'faded-dark': '#888888',
        },
        
        // Vibrant Accents
        electric: {
          blue: '#0047AB',
        },
        hot: {
          magenta: '#FF1493',
        },
        acid: {
          lime: '#00FF41',
        },
        safety: {
          orange: '#FF7F27',
        },
        
        // Neon Colors
        neon: {
          blue: '#00F0FF',
          pink: '#FF00FF',
          green: '#00FF41',
          cyan: '#00FFFF',
        },
        
        // Status Colors (use the accent colors)
        status: {
          running: '#0047AB',    // electric-blue
          paused: '#FF7F27',     // safety-orange
          error: '#FF1493',      // hot-magenta
          complete: '#00FF41',   // acid-lime
          idle: '#666666',
          'idle-dark': '#888888',
        },
      },
      
      // ===========================================
      // FONTS - Exact values from styles.css
      // ===========================================
      fontFamily: {
        // --font-geometric: 'Orbitron', 'Rajdhani', sans-serif
        display: ['Orbitron', 'Rajdhani', 'sans-serif'],
        geometric: ['Orbitron', 'Rajdhani', 'sans-serif'],
        // UI text uses Rajdhani
        ui: ['Rajdhani', 'sans-serif'],
        // --font-monospace: 'Courier New', 'Consolas', 'Monaco', monospace
        mono: ['Courier New', 'Consolas', 'Monaco', 'monospace'],
      },
      
      // ===========================================
      // SPACING - Exact values from styles.css
      // ===========================================
      spacing: {
        // --spacing-xs: 4px
        'xs': '4px',
        // --spacing-sm: 8px
        'sm': '8px',
        // --spacing-md: 16px
        'md': '16px',
        // --spacing-lg: 24px
        'lg': '24px',
        // --spacing-xl: 32px
        'xl': '32px',
      },
      
      // ===========================================
      // BORDER WIDTH - Exact values from styles.css
      // ===========================================
      borderWidth: {
        // --border-thick: 3px
        'thick': '3px',
        // --border-medium: 2px
        'medium': '2px',
        // --border-thin: 1px
        'thin': '1px',
      },
      
      // ===========================================
      // BOX SHADOW - Panel drop shadow from styles.css
      // ===========================================
      boxShadow: {
        // Technical drafting flourishes - cross-hatched drop shadow
        'panel': '4px 4px 0 0 #1A1A1A, 3px 3px 0 0 #1A1A1A, 2px 2px 0 0 #1A1A1A',
        'panel-dark': '4px 4px 0 0 #e0e0e0, 3px 3px 0 0 #e0e0e0, 2px 2px 0 0 #e0e0e0',
      },
      
      // ===========================================
      // ANIMATION - From styles.css
      // ===========================================
      animation: {
        'pulse-status': 'pulse 2s ease-in-out infinite',
        'scan-line': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      
      // ===========================================
      // TYPOGRAPHY - Font sizes from styles.css
      // ===========================================
      fontSize: {
        // Monospace text: 0.9em
        'mono': '0.9em',
      },
    },
  },
  plugins: [],
};

export default config;
