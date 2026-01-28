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
    // Vitest 4: poolOptions removed, use top-level maxWorkers and isolate
    // Default behavior (multiple workers, isolated) is fine, so we can omit these
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Vitest 4: coverage.include is now required to include uncovered files
      include: ['src/**/*.ts', 'tests/**/*.ts'],
    },
  },
});
