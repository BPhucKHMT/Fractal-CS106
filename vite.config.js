import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: 'src',
  server: {
    open: true,
    port: 3000
  },
  build: {
    outDir: '../resources',
    emptyOutDir: true
  }
});
