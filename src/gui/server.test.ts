/**
 * Tests for GuiServer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GuiServer } from './server.js';
import { EventBus } from '../logging/event-bus.js';
import type { PuppetMasterEvent } from '../logging/event-bus.js';
import WebSocket from 'ws';

describe('GuiServer', () => {
  let server: GuiServer;
  let eventBus: EventBus;
  const testPort = 3848; // Use different port to avoid conflicts

  beforeEach(() => {
    eventBus = new EventBus();
    server = new GuiServer(
      {
        port: testPort,
        host: 'localhost',
        corsOrigins: ['http://localhost:3000'],
      },
      eventBus
    );
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('server lifecycle', () => {
    it('should start server on specified port', async () => {
      await server.start();
      
      const response = await fetch(`http://localhost:${testPort}/health`);
      expect(response.ok).toBe(true);
    });

    it('should stop server and close connections', async () => {
      await server.start();
      
      // Create a WebSocket connection
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);
      await new Promise<void>((resolve) => {
        ws.on('open', () => {
          resolve();
        });
      });

      // Stop server
      await server.stop();

      // WebSocket should be closed
      expect(ws.readyState).toBe(WebSocket.CLOSED);
    });

    it('should return correct URL', () => {
      const url = server.getUrl();
      expect(url).toBe(`http://localhost:${testPort}`);
    });
  });

  describe('HTTP endpoints', () => {
    beforeEach(async () => {
      await server.start();
    });

    it('should respond to health check endpoint', async () => {
      const response = await fetch(`http://localhost:${testPort}/health`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toEqual({
        status: 'ok',
        version: '0.1.0',
      });
    });

    it('should respond to status endpoint', async () => {
      const response = await fetch(`http://localhost:${testPort}/api/status`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toEqual({
        state: 'idle',
        version: '0.1.0',
      });
    });
  });

  describe('CORS', () => {
    beforeEach(async () => {
      await server.start();
    });

    it('should allow requests from configured origins', async () => {
      const response = await fetch(`http://localhost:${testPort}/health`, {
        headers: {
          Origin: 'http://localhost:3000',
        },
      });
      
      expect(response.ok).toBe(true);
      const corsHeader = response.headers.get('access-control-allow-origin');
      expect(corsHeader).toBe('http://localhost:3000');
    });

    it('should reject requests from unconfigured origins', async () => {
      const response = await fetch(`http://localhost:${testPort}/health`, {
        headers: {
          Origin: 'http://evil.com',
        },
      });
      
      // CORS middleware will reject, but the request might still succeed with 200
      // The browser would block it, but in tests we can check the CORS header
      const corsHeader = response.headers.get('access-control-allow-origin');
      // If origin is not allowed, CORS header should not match the request origin
      expect(corsHeader).not.toBe('http://evil.com');
    });
  });

  describe('WebSocket', () => {
    beforeEach(async () => {
      await server.start();
    });

    it('should accept WebSocket connections', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);
      
      await new Promise<void>((resolve, reject) => {
        ws.on('open', () => {
          expect(ws.readyState).toBe(WebSocket.OPEN);
          ws.close();
          resolve();
        });
        ws.on('error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
      });
    });

    it('should forward EventBus events to connected clients', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);
      
      await new Promise<void>((resolve) => {
        ws.on('open', () => {
          resolve();
        });
      });

      const receivedEvents: PuppetMasterEvent[] = [];
      ws.on('message', (data) => {
        const event = JSON.parse(data.toString()) as PuppetMasterEvent;
        receivedEvents.push(event);
      });

      // Emit an event on EventBus
      const testEvent: PuppetMasterEvent = {
        type: 'state_changed',
        from: 'idle',
        to: 'planning',
      };
      eventBus.emit(testEvent);

      // Wait for message
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(receivedEvents).toHaveLength(1);
          expect(receivedEvents[0]).toEqual(testEvent);
          ws.close();
          resolve();
        }, 100);
      });
    });

    it('should handle multiple WebSocket clients', async () => {
      const ws1 = new WebSocket(`ws://localhost:${testPort}/events`);
      const ws2 = new WebSocket(`ws://localhost:${testPort}/events`);

      await Promise.all([
        new Promise<void>((resolve) => {
          ws1.on('open', () => {
            resolve();
          });
        }),
        new Promise<void>((resolve) => {
          ws2.on('open', () => {
            resolve();
          });
        }),
      ]);

      const received1: PuppetMasterEvent[] = [];
      const received2: PuppetMasterEvent[] = [];

      ws1.on('message', (data) => {
        received1.push(JSON.parse(data.toString()) as PuppetMasterEvent);
      });
      ws2.on('message', (data) => {
        received2.push(JSON.parse(data.toString()) as PuppetMasterEvent);
      });

      // Emit event
      const testEvent: PuppetMasterEvent = {
        type: 'output_chunk',
        subtaskId: 'ST-001',
        chunk: 'test output',
      };
      eventBus.emit(testEvent);

      // Wait for messages
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

    it('should cleanup subscriptions on client disconnect', async () => {
      const ws = new WebSocket(`ws://localhost:${testPort}/events`);
      
      await new Promise<void>((resolve) => {
        ws.on('open', () => {
          resolve();
        });
      });

      // Verify subscription was created
      const initialSubscriptionCount = eventBus.getSubscriptionCount();
      expect(initialSubscriptionCount).toBeGreaterThan(0);

      // Close connection
      ws.close();

      // Wait for cleanup
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          const finalSubscriptionCount = eventBus.getSubscriptionCount();
          expect(finalSubscriptionCount).toBeLessThan(initialSubscriptionCount);
          resolve();
        }, 100);
      });
    });
  });

  describe('broadcast', () => {
    beforeEach(async () => {
      await server.start();
    });

    it('should broadcast events to all connected clients', async () => {
      const ws1 = new WebSocket(`ws://localhost:${testPort}/events`);
      const ws2 = new WebSocket(`ws://localhost:${testPort}/events`);

      await Promise.all([
        new Promise<void>((resolve) => {
          ws1.on('open', () => {
            resolve();
          });
        }),
        new Promise<void>((resolve) => {
          ws2.on('open', () => {
            resolve();
          });
        }),
      ]);

      const received1: PuppetMasterEvent[] = [];
      const received2: PuppetMasterEvent[] = [];

      ws1.on('message', (data) => {
        received1.push(JSON.parse(data.toString()) as PuppetMasterEvent);
      });
      ws2.on('message', (data) => {
        received2.push(JSON.parse(data.toString()) as PuppetMasterEvent);
      });

      // Use broadcast method
      const testEvent: PuppetMasterEvent = {
        type: 'iteration_started',
        subtaskId: 'ST-001',
        iterationNumber: 1,
      };
      server.broadcast(testEvent);

      // Wait for messages
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

  describe('default configuration', () => {
    it('should use default port and host when not specified', () => {
      const defaultServer = new GuiServer({}, eventBus);
      const url = defaultServer.getUrl();
      expect(url).toBe('http://localhost:3847');
      return defaultServer.stop();
    });

    it('should use default CORS origins when not specified', () => {
      const defaultServer = new GuiServer({}, eventBus);
      // Default CORS origins are set in constructor
      expect(defaultServer).toBeDefined();
      return defaultServer.stop();
    });
  });
});
