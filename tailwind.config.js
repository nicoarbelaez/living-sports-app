/** @type {import('tailwindcss').Config} */
const config = {
  // NativeWind v5 preset - includes dark mode support via prefers-color-scheme
  presets: [require('nativewind/preset')],
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
};

module.exports = config;