import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This allows you to use '@' to refer to the root folder
      '@': path.resolve(__dirname, './'),
    },
  },
});