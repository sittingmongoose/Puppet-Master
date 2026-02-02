import { describe, it, expect } from 'vitest';
import { createControlsRoutes } from './controls.js';

describe('Controls Routes', () => {
  it('returns an Express Router', () => {
    const router = createControlsRoutes(null);
    expect(router).toBeDefined();
    expect(typeof router).toBe('function');
  });

  it('handles null orchestrator without throwing', () => {
    expect(() => createControlsRoutes(null)).not.toThrow();
  });
});
