import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/stores': resolve(__dirname, './src/stores'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/types': resolve(__dirname, './src/types'),
      '@/pages': resolve(__dirname, './src/pages'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [resolve(__dirname, './src/test/setup.ts')],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Vitest 4: coverage.include is now required to include uncovered files
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
    },
  },
});
