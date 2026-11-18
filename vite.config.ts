
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      // Allow Render host
      allowedHosts: [
        'bismillah-apartment.onrender.com',
      ],

      // HMR configuration
      hmr: process.env.DISABLE_HMR !== 'true',

      // File watching configuration
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {
              ignored: [
                '**/data/**',
                '**/uploads/**',
                '**/dist/**',
                '**/.git/**',
                '**/server/data/**',
              ],
            },
    },
  };
});
