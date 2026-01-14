/**
 * Tests for EventBus
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from './event-bus.js';
import type { PuppetMasterEvent } from './event-bus.js';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('subscribe', () => {
    it('should subscribe to specific event type and receive events', () => {
      const receivedEvents: PuppetMasterEvent[] = [];
      
      eventBus.subscribe('state_changed', (event) => {
        receivedEvents.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };

      eventBus.emit(event);

      expect(receivedEvents).toHaveLength(1);
      expect(receivedEvents[0]).toEqual(event);
    });

    it('should return subscription ID', () => {
      const id = eventBus.subscribe('state_changed', () => {});
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('should support multiple subscribers for same event type', () => {
      const received1: PuppetMasterEvent[] = [];
      const received2: PuppetMasterEvent[] = [];

      eventBus.subscribe('state_changed', (event) => {
        received1.push(event);
      });
      eventBus.subscribe('state_changed', (event) => {
        received2.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };

      eventBus.emit(event);

      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(1);
      expect(received1[0]).toEqual(event);
      expect(received2[0]).toEqual(event);
    });

    it('should not call subscribers for different event types', () => {
      const received: PuppetMasterEvent[] = [];

      eventBus.subscribe('state_changed', (event) => {
        received.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'tier_changed',
        tierId: 'task-1',
        from: 'pending',
        to: 'running',
      };

      eventBus.emit(event);

      expect(received).toHaveLength(0);
    });
  });

  describe('wildcard subscription', () => {
    it('should receive all events with wildcard subscription', () => {
      const receivedEvents: PuppetMasterEvent[] = [];

      eventBus.subscribe('*', (event) => {
        receivedEvents.push(event);
      });

      const events: PuppetMasterEvent[] = [
        { type: 'state_changed', from: 'idle', to: 'planning' },
        { type: 'tier_changed', tierId: 'task-1', from: 'pending', to: 'running' },
        { type: 'iteration_started', subtaskId: 'subtask-1', iterationNumber: 1 },
        { type: 'error', error: 'Test error' },
      ];

      for (const event of events) {
        eventBus.emit(event);
      }

      expect(receivedEvents).toHaveLength(4);
      expect(receivedEvents).toEqual(events);
    });

    it('should combine wildcard and specific subscriptions', () => {
      const wildcardReceived: PuppetMasterEvent[] = [];
      const specificReceived: PuppetMasterEvent[] = [];

      eventBus.subscribe('*', (event) => {
        wildcardReceived.push(event);
      });
      eventBus.subscribe('state_changed', (event) => {
        specificReceived.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };

      eventBus.emit(event);

      expect(wildcardReceived).toHaveLength(1);
      expect(specificReceived).toHaveLength(1);
      // Wildcard subscriber should receive it once, specific subscriber once
      expect(wildcardReceived[0]).toEqual(event);
      expect(specificReceived[0]).toEqual(event);
    });
  });

  describe('unsubscribe', () => {
    it('should remove subscription by ID', () => {
      const received: PuppetMasterEvent[] = [];

      const id = eventBus.subscribe('state_changed', (event) => {
        received.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };

      eventBus.emit(event);
      expect(received).toHaveLength(1);

      const removed = eventBus.unsubscribe(id);
      expect(removed).toBe(true);

      eventBus.emit(event);
      expect(received).toHaveLength(1); // Should not increase
    });

    it('should return false for invalid subscription ID', () => {
      const removed = eventBus.unsubscribe('invalid-id');
      expect(removed).toBe(false);
    });

    it('should allow unsubscribing multiple times safely', () => {
      const id = eventBus.subscribe('state_changed', () => {});

      expect(eventBus.unsubscribe(id)).toBe(true);
      expect(eventBus.unsubscribe(id)).toBe(false);
      expect(eventBus.unsubscribe(id)).toBe(false);
    });
  });

  describe('once', () => {
    it('should call callback only once', () => {
      const received: PuppetMasterEvent[] = [];

      eventBus.once('state_changed', (event) => {
        received.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };

      eventBus.emit(event);
      expect(received).toHaveLength(1);

      eventBus.emit(event);
      expect(received).toHaveLength(1); // Should not increase
    });

    it('should return subscription ID', () => {
      const id = eventBus.once('state_changed', () => {});
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });

    it('should allow manual unsubscribe before event fires', () => {
      const received: PuppetMasterEvent[] = [];

      const id = eventBus.once('state_changed', (event) => {
        received.push(event);
      });

      eventBus.unsubscribe(id);

      const event: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };

      eventBus.emit(event);
      expect(received).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should remove all subscriptions', () => {
      const received1: PuppetMasterEvent[] = [];
      const received2: PuppetMasterEvent[] = [];

      eventBus.subscribe('state_changed', (event) => {
        received1.push(event);
      });
      eventBus.subscribe('tier_changed', (event) => {
        received2.push(event);
      });

      expect(eventBus.getSubscriptionCount()).toBe(2);

      eventBus.clear();

      expect(eventBus.getSubscriptionCount()).toBe(0);

      eventBus.emit({ type: 'state_changed', from: 'idle', to: 'planning' });
      eventBus.emit({ type: 'tier_changed', tierId: 'task-1', from: 'pending', to: 'running' });

      expect(received1).toHaveLength(0);
      expect(received2).toHaveLength(0);
    });
  });

  describe('getSubscriptionCount', () => {
    it('should return 0 for new EventBus', () => {
      expect(eventBus.getSubscriptionCount()).toBe(0);
    });

    it('should return correct count after subscriptions', () => {
      eventBus.subscribe('state_changed', () => {});
      expect(eventBus.getSubscriptionCount()).toBe(1);

      eventBus.subscribe('tier_changed', () => {});
      expect(eventBus.getSubscriptionCount()).toBe(2);

      eventBus.subscribe('*', () => {});
      expect(eventBus.getSubscriptionCount()).toBe(3);
    });

    it('should decrease count after unsubscribe', () => {
      const id1 = eventBus.subscribe('state_changed', () => {});
      const id2 = eventBus.subscribe('tier_changed', () => {});

      expect(eventBus.getSubscriptionCount()).toBe(2);

      eventBus.unsubscribe(id1);
      expect(eventBus.getSubscriptionCount()).toBe(1);

      eventBus.unsubscribe(id2);
      expect(eventBus.getSubscriptionCount()).toBe(0);
    });

    it('should decrease count after once subscription fires', () => {
      eventBus.once('state_changed', () => {});
      expect(eventBus.getSubscriptionCount()).toBe(1);

      eventBus.emit({ type: 'state_changed', from: 'idle', to: 'planning' });
      expect(eventBus.getSubscriptionCount()).toBe(0);
    });
  });

  describe('event types', () => {
    it('should handle state_changed events', () => {
      const received: PuppetMasterEvent[] = [];
      eventBus.subscribe('state_changed', (event) => {
        received.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };

      eventBus.emit(event);
      expect(received[0]).toEqual(event);
    });

    it('should handle tier_changed events', () => {
      const received: PuppetMasterEvent[] = [];
      eventBus.subscribe('tier_changed', (event) => {
        received.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'tier_changed',
        tierId: 'task-1',
        from: 'pending',
        to: 'running',
      };

      eventBus.emit(event);
      expect(received[0]).toEqual(event);
    });

    it('should handle iteration_started events', () => {
      const received: PuppetMasterEvent[] = [];
      eventBus.subscribe('iteration_started', (event) => {
        received.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'iteration_started',
        subtaskId: 'subtask-1',
        iterationNumber: 5,
      };

      eventBus.emit(event);
      expect(received[0]).toEqual(event);
    });

    it('should handle iteration_completed events', () => {
      const received: PuppetMasterEvent[] = [];
      eventBus.subscribe('iteration_completed', (event) => {
        received.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'iteration_completed',
        subtaskId: 'subtask-1',
        passed: true,
      };

      eventBus.emit(event);
      expect(received[0]).toEqual(event);
    });

    it('should handle output_chunk events', () => {
      const received: PuppetMasterEvent[] = [];
      eventBus.subscribe('output_chunk', (event) => {
        received.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'output_chunk',
        subtaskId: 'subtask-1',
        chunk: 'Test output',
      };

      eventBus.emit(event);
      expect(received[0]).toEqual(event);
    });

    it('should handle error events', () => {
      const received: PuppetMasterEvent[] = [];
      eventBus.subscribe('error', (event) => {
        received.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'error',
        error: 'Test error',
        context: { itemId: 'task-1' },
      };

      eventBus.emit(event);
      expect(received[0]).toEqual(event);
    });

    it('should handle log events', () => {
      const received: PuppetMasterEvent[] = [];
      eventBus.subscribe('log', (event) => {
        received.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'log',
        level: 'info',
        message: 'Test log message',
      };

      eventBus.emit(event);
      expect(received[0]).toEqual(event);
    });
  });

  describe('error handling', () => {
    it('should continue emitting to other subscribers if one throws', () => {
      const received1: PuppetMasterEvent[] = [];
      const received2: PuppetMasterEvent[] = [];

      eventBus.subscribe('state_changed', () => {
        throw new Error('Test error');
      });
      eventBus.subscribe('state_changed', (event) => {
        received1.push(event);
      });
      eventBus.subscribe('*', (event) => {
        received2.push(event);
      });

      const event: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };

      // Should not throw
      expect(() => eventBus.emit(event)).not.toThrow();

      // Other subscribers should still receive the event
      expect(received1).toHaveLength(1);
      expect(received2).toHaveLength(1);
    });
  });

  describe('type safety', () => {
    it('should maintain type safety for event payloads', () => {
      const stateChangedEvents: Array<{ from: string; to: string }> = [];
      const tierChangedEvents: Array<{ tierId: string; from: string; to: string }> = [];

      eventBus.subscribe('state_changed', (event) => {
        // TypeScript should infer event.type === 'state_changed'
        if (event.type === 'state_changed') {
          stateChangedEvents.push({ from: event.from, to: event.to });
        }
      });

      eventBus.subscribe('tier_changed', (event) => {
        // TypeScript should infer event.type === 'tier_changed'
        if (event.type === 'tier_changed') {
          tierChangedEvents.push({
            tierId: event.tierId,
            from: event.from,
            to: event.to,
          });
        }
      });

      eventBus.emit({ type: 'state_changed', from: 'idle', to: 'planning' });
      eventBus.emit({ type: 'tier_changed', tierId: 'task-1', from: 'pending', to: 'running' });

      expect(stateChangedEvents).toHaveLength(1);
      expect(tierChangedEvents).toHaveLength(1);
      expect(stateChangedEvents[0]).toEqual({ from: 'idle', to: 'planning' });
      expect(tierChangedEvents[0]).toEqual({
        tierId: 'task-1',
        from: 'pending',
        to: 'running',
      });
    });
  });
});
