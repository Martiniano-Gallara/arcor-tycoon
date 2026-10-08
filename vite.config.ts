import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 5175,
    host: true,
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 4096,
  }
});
