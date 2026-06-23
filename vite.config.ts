import { writeFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'netlify-spa-redirects',
      closeBundle() {
        writeFileSync('dist/_redirects', '/*    /index.html   200\n');
      },
    },
  ],
  server: {
    port: 5173,
  },
});
