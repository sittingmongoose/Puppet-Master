import { describe, it, expect } from 'vitest';
import { createEventsRoutes } from './events.js';

describe('Events Routes', () => {
  it('returns an Express Router', () => {
    const eventBus = {
      subscribe: () => 'sub-id',
      unsubscribe: () => undefined,
    };
    const router = createEventsRoutes(eventBus as never);
    expect(router).toBeDefined();
    expect(typeof router).toBe('function');
  });
});
