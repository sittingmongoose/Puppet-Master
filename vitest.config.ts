import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    // P0-G07: Add timeouts to prevent hanging tests
    testTimeout: 30000, // 30 seconds default timeout
    hookTimeout: 30000, // 30 seconds for before/after hooks
    teardownTimeout: 10000, // 10 seconds for teardown
    // Ensure tests don't hang on open handles
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
