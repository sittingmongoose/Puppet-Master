/**
 * Tests for EventStreamer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketServer, WebSocket } from 'ws';
import { EventStreamer } from './event-streamer.js';
import { EventBus } from '../../logging/event-bus.js';
import type { PuppetMasterEvent } from '../../logging/event-bus.js';

describe('EventStreamer', () => {
  let eventBus: EventBus;
  let wss: WebSocketServer;
  let streamer: EventStreamer;
  let testPort: number;

  beforeEach(() => {
    eventBus = new EventBus();
    testPort = 3849; // Use different port to avoid conflicts
    wss = new WebSocketServer({ port: testPort, path: '/events' });
    streamer = new EventStreamer(wss, eventBus);
  });

  afterEach(async () => {
    streamer.stop();
    await new Promise<void>((resolve) => {
      wss.close(() => {
        resolve();
      });
    });
  });

  describe('lifecycle', () => {
    it('should start and subscribe to EventBus', () => {
      streamer.start();
      expect(eventBus.getSubscriptionCount()).toBeGreaterThan(0);
    });

    it('should stop and unsubscribe from EventBus', () => {
      streamer.start();
      const initialCount = eventBus.getSubscriptionCount();
      streamer.stop();
      expect(eventBus.getSubscriptionCount()).toBeLessThan(initialCount);
    });

    it('should be idempotent when starting multiple times', () => {
      streamer.start();
      const count1 = eventBus.getSubscriptionCount();
      streamer.start();
      const count2 = eventBus.getSubscriptionCount();
      expect(count1).toBe(count2);
    });

    it('should be idempotent when stopping multiple times', () => {
      streamer.start();
      streamer.stop();
      const count1 = eventBus.getSubscriptionCount();
      streamer.stop();
      const count2 = eventBus.getSubscriptionCount();
      expect(count1).toBe(count2);
    });
  });

  describe('client connection', () => {
    beforeEach(() => {
      streamer.start();
    });

    it('should accept WebSocket connections', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);

      await new Promise<void>((resolve, reject) => {
        ws.on('open', () => {
          expect(streamer.getClientCount()).toBe(1);
          ws.close();
          resolve();
        });
        ws.on('error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
    });

    it('should track multiple clients', async () => {
      const ws1 = new WebSocket(`ws://localhost:${testPort}/events`);
      const ws2 = new WebSocket(`ws://localhost:${testPort}/events`);

      await Promise.all([
        new Promise<void>((resolve) => {
          ws1.on('open', () => resolve());
        }),
        new Promise<void>((resolve) => {
          ws2.on('open', () => resolve());
        }),
      ]);

      expect(streamer.getClientCount()).toBe(2);

      ws1.close();
      ws2.close();
    });

    it('should cleanup client on disconnect', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);

      await new Promise<void>((resolve) => {
        ws.on('open', () => {
          expect(streamer.getClientCount()).toBe(1);
          ws.close();
          resolve();
        });
      });

      // Wait for cleanup
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(streamer.getClientCount()).toBe(0);
          resolve();
        }, 100);
      });
    });
  });

  describe('event broadcasting', () => {
    beforeEach(() => {
      streamer.start();
    });

    it('should broadcast events to all connected clients', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);

      await new Promise<void>((resolve) => {
        ws.on('open', () => resolve());
      });

      const receivedMessages: unknown[] = [];
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'event') {
          receivedMessages.push(message.payload);
        }
      });

      const testEvent: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };
      eventBus.emit(testEvent);

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(receivedMessages).toHaveLength(1);
          expect(receivedMessages[0]).toEqual(testEvent);
          ws.close();
          resolve();
        }, 100);
      });
    });

    it('should broadcast to multiple clients', async () => {
      const ws1 = new WebSocket(`ws://localhost:${testPort}/events`);
      const ws2 = new WebSocket(`ws://localhost:${testPort}/events`);

      await Promise.all([
        new Promise<void>((resolve) => {
          ws1.on('open', () => resolve());
        }),
        new Promise<void>((resolve) => {
          ws2.on('open', () => resolve());
        }),
      ]);

      const received1: PuppetMasterEvent[] = [];
      const received2: PuppetMasterEvent[] = [];

      ws1.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'event') {
          received1.push(message.payload as PuppetMasterEvent);
        }
      });

      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'event') {
          received2.push(message.payload as PuppetMasterEvent);
        }
      });

      const testEvent: PuppetMasterEvent = {
        type: 'iteration_started',
        subtaskId: 'ST-001',
        iterationNumber: 1,
      };
      eventBus.emit(testEvent);

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(received1).toHaveLength(1);
          expect(received2).toHaveLength(1);
          expect(received1[0]).toEqual(testEvent);
          expect(received2[0]).toEqual(testEvent);
          ws1.close();
          ws2.close();
          resolve();
        }, 100);
      });
    });
  });

  describe('event filtering', () => {
    beforeEach(() => {
      streamer.start();
    });

    it('should send all events when client has no filters', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);

      await new Promise<void>((resolve) => {
        ws.on('open', () => resolve());
      });

      const received: PuppetMasterEvent[] = [];
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'event') {
          received.push(message.payload as PuppetMasterEvent);
        }
      });

      const event1: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };
      const event2: PuppetMasterEvent = {
        type: 'iteration_started',
        subtaskId: 'ST-001',
        iterationNumber: 1,
      };

      eventBus.emit(event1);
      eventBus.emit(event2);

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(received).toHaveLength(2);
          ws.close();
          resolve();
        }, 100);
      });
    });

    it('should filter events based on subscription', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);

      await new Promise<void>((resolve) => {
        ws.on('open', () => resolve());
      });

      // Wait a bit for connection to be fully established
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      });

      // Subscribe to only state_changed events
      ws.send(
        JSON.stringify({
          type: 'subscribe',
          payload: { events: ['state_changed'] },
        })
      );

      // Wait for subscription to be processed
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      });

      const received: PuppetMasterEvent[] = [];
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'event') {
          received.push(message.payload as PuppetMasterEvent);
        }
      });

      const event1: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };
      const event2: PuppetMasterEvent = {
        type: 'iteration_started',
        subtaskId: 'ST-001',
        iterationNumber: 1,
      };

      eventBus.emit(event1);
      eventBus.emit(event2);

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(received).toHaveLength(1);
          expect(received[0].type).toBe('state_changed');
          ws.close();
          resolve();
        }, 100);
      });
    });

    it('should handle unsubscribe', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);

      await new Promise<void>((resolve) => {
        ws.on('open', () => resolve());
      });

      // Wait for connection to be established
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      });

      // Subscribe to multiple event types
      ws.send(
        JSON.stringify({
          type: 'subscribe',
          payload: { events: ['state_changed', 'iteration_started'] },
        })
      );

      // Wait for subscription to be processed
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      });

      const received: PuppetMasterEvent[] = [];
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'event') {
          received.push(message.payload as PuppetMasterEvent);
        }
      });

      // Unsubscribe from iteration_started
      ws.send(
        JSON.stringify({
          type: 'unsubscribe',
          payload: { events: ['iteration_started'] },
        })
      );

      // Wait for unsubscribe to be processed
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      });

      const event1: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };
      const event2: PuppetMasterEvent = {
        type: 'iteration_started',
        subtaskId: 'ST-001',
        iterationNumber: 1,
      };

      eventBus.emit(event1);
      eventBus.emit(event2);

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(received).toHaveLength(1);
          expect(received[0].type).toBe('state_changed');
          ws.close();
          resolve();
        }, 100);
      });
    });

    it('should handle multiple clients with different filters', async () => {
      const ws1 = new WebSocket(`ws://localhost:${testPort}/events`);
      const ws2 = new WebSocket(`ws://localhost:${testPort}/events`);

      await Promise.all([
        new Promise<void>((resolve) => {
          ws1.on('open', () => resolve());
        }),
        new Promise<void>((resolve) => {
          ws2.on('open', () => resolve());
        }),
      ]);

      // Wait for connections to be fully established
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      });

      // Client 1 subscribes to state_changed
      ws1.send(
        JSON.stringify({
          type: 'subscribe',
          payload: { events: ['state_changed'] },
        })
      );

      // Client 2 subscribes to iteration_started
      ws2.send(
        JSON.stringify({
          type: 'subscribe',
          payload: { events: ['iteration_started'] },
        })
      );

      // Wait for subscriptions to be processed
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      });

      const received1: PuppetMasterEvent[] = [];
      const received2: PuppetMasterEvent[] = [];

      ws1.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'event') {
          received1.push(message.payload as PuppetMasterEvent);
        }
      });

      ws2.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'event') {
          received2.push(message.payload as PuppetMasterEvent);
        }
      });

      const event1: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };
      const event2: PuppetMasterEvent = {
        type: 'iteration_started',
        subtaskId: 'ST-001',
        iterationNumber: 1,
      };

      eventBus.emit(event1);
      eventBus.emit(event2);

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(received1).toHaveLength(1);
          expect(received1[0].type).toBe('state_changed');
          expect(received2).toHaveLength(1);
          expect(received2[0].type).toBe('iteration_started');
          ws1.close();
          ws2.close();
          resolve();
        }, 100);
      });
    });
  });

  describe('ping/pong heartbeat', () => {
    beforeEach(() => {
      streamer.start();
    });

    it('should respond to client ping with pong', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);

      await new Promise<void>((resolve) => {
        ws.on('open', () => resolve());
      });

      const receivedMessages: unknown[] = [];
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        receivedMessages.push(message);
      });

      // Send ping from client
      ws.send(JSON.stringify({ type: 'ping', payload: null }));

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          const pongMessage = receivedMessages.find(
            (msg: unknown) => (msg as { type: string }).type === 'pong'
          );
          expect(pongMessage).toBeDefined();
          ws.close();
          resolve();
        }, 100);
      });
    });

    it('should send ping to clients periodically', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);

      await new Promise<void>((resolve) => {
        ws.on('open', () => resolve());
      });

      const receivedPings: unknown[] = [];
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'ping') {
          receivedPings.push(message);
          // Respond with pong
          ws.send(JSON.stringify({ type: 'pong', payload: null }));
        }
      });

      // Wait for ping to be sent (30 seconds + small buffer)
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(receivedPings.length).toBeGreaterThan(0);
          ws.close();
          resolve();
        }, 31000);
      });
    }, 35000);

    it('should close connection if no pong received', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);

      await new Promise<void>((resolve) => {
        ws.on('open', () => resolve());
      });

      let closed = false;
      ws.on('close', () => {
        closed = true;
      });

      // Don't respond to pings - just receive them
      ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === 'ping') {
          // Don't send pong - let timeout occur
        }
      });

      // Wait for ping (30s) + timeout (10s) + buffer
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(closed).toBe(true);
          expect(streamer.getClientCount()).toBe(0);
          resolve();
        }, 41000);
      });
    }, 45000);
  });

  describe('error handling', () => {
    beforeEach(() => {
      streamer.start();
    });

    it('should handle invalid JSON messages gracefully', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);

      await new Promise<void>((resolve) => {
        ws.on('open', () => resolve());
      });

      // Wait for connection to be established
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      });

      // Send invalid JSON
      ws.send('invalid json');

      // Should not crash - wait a bit to ensure no errors
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(streamer.getClientCount()).toBe(1);
          ws.close();
          resolve();
        }, 100);
      });
    });

    it('should handle invalid message structure', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);

      await new Promise<void>((resolve) => {
        ws.on('open', () => resolve());
      });

      // Wait for connection to be established
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      });

      // Send message without type
      ws.send(JSON.stringify({ payload: 'test' }));

      // Should not crash
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(streamer.getClientCount()).toBe(1);
          ws.close();
          resolve();
        }, 100);
      });
    });

    it('should handle WebSocket send errors', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);

      await new Promise<void>((resolve) => {
        ws.on('open', () => resolve());
      });

      // Wait for connection to be established
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      });

      // Close connection before sending
      ws.close();

      // Wait for close to be processed
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      });

      // Try to broadcast - should handle gracefully
      const testEvent: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };
      eventBus.emit(testEvent);

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          // Client should be cleaned up
          expect(streamer.getClientCount()).toBe(0);
          resolve();
        }, 100);
      });
    });
  });

  describe('getClientCount', () => {
    beforeEach(() => {
      streamer.start();
    });

    it('should return 0 when no clients connected', () => {
      expect(streamer.getClientCount()).toBe(0);
    });

    it('should return correct count of connected clients', async () => {
      const ws1 = new WebSocket(`ws://localhost:${testPort}/events`);
      const ws2 = new WebSocket(`ws://localhost:${testPort}/events`);

      await Promise.all([
        new Promise<void>((resolve) => {
          ws1.on('open', () => resolve());
        }),
        new Promise<void>((resolve) => {
          ws2.on('open', () => resolve());
        }),
      ]);

      expect(streamer.getClientCount()).toBe(2);

      ws1.close();
      ws2.close();
    });
  });
});
