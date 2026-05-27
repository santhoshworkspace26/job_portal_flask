import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        register: resolve(__dirname, 'register.html'),
        jobs: resolve(__dirname, 'jobs.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        apply: resolve(__dirname, 'apply.html'),
        contact: resolve(__dirname, 'contact.html'),
      },
    },
  },
});
