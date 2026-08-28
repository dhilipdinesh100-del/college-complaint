import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Required because the app is hosted at:
  // https://dhilipdinesh100-del.github.io/college-complaint/
  base: '/college-complaint/',

  server: {
    port: 5173,
    host: true,
  },
});