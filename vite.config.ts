import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Keep the optional Spline runtime and the animation library out of the critical path.
        manualChunks(id) {
          if (id.includes('@splinetool')) return 'spline';
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) return 'motion';
        },
      },
    },
  },
});
