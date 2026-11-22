import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Served from GitHub Pages at karls.design/mui-theme-builder/
  base: '/mui-theme-builder/',
  plugins: [react()],
});
