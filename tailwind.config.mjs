/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        panel: '#0e0e10',
        ink: '#ffffff',
        mute: '#a7a7ad',
        line: '#2a2a2e',
        combat: {
          red: '#e0161d',
          red2: '#ff3b30',
          darkred: '#8f0c12',
          wine: '#5c0a0e',
        },
      },
      fontFamily: {
        anton: ['Anton', 'Impact', 'Arial Narrow', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
        barlow: ['Barlow', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
