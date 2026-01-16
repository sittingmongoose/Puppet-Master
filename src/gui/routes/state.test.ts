/**
 * State routes tests
 * 
 * Tests for state API endpoints.
 * Note: HTTP tests with supertest can be added when supertest is installed.
 */

import { describe, it, expect } from 'vitest';
import { createStateRoutes } from './state.js';

describe('State Routes', () => {
  describe('createStateRoutes', () => {
    it('returns an Express Router', () => {
      const router = createStateRoutes(null, null, null, null);
      expect(router).toBeDefined();
      expect(typeof router).toBe('function');
    });

    it('handles null dependencies gracefully', () => {
      // Should not throw when dependencies are null
      expect(() => {
        createStateRoutes(null, null, null, null);
      }).not.toThrow();
    });
  });

  // TODO: Add HTTP endpoint tests when supertest is installed
  // Tests should verify:
  // - GET /api/state returns orchestrator state
  // - GET /api/tiers returns tier hierarchy
  // - GET /api/tiers/:id returns 404 for non-existent tier
  // - GET /api/progress validates limit parameter
  // - GET /api/agents returns agents document
});
