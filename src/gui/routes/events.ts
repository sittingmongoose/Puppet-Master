/**
 * SSE (Server-Sent Events) routes for RWM Puppet Master GUI
 *
 * Streams all EventBus events to the browser as `text/event-stream` without polling.
 * Endpoint: GET /api/events/stream
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import type { EventBus, PuppetMasterEvent } from '../../logging/index.js';
import { translateEventForGui } from '../translate-event-for-gui.js';

/**
 * Create events routes.
 *
 * @param eventBus - Global EventBus instance used by orchestrator and GUI server
 */
export function createEventsRoutes(eventBus: EventBus): Router {
  const router = createRouter();

  /**
   * GET /api/events/stream
   * Streams GUI events as SSE frames:
   *   event: <type>
   *   data: <json>
   *
   * Keepalive comments are sent periodically to avoid proxy timeouts.
   */
  router.get('/events/stream', (req: Request, res: Response) => {
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Help when running behind reverse proxies (nginx) that buffer responses.
    res.setHeader('X-Accel-Buffering', 'no');

    // Flush headers immediately so the client receives the stream promptly.
    res.flushHeaders?.();

    // Initial comment to confirm connection.
    res.write(`: connected\n\n`);

    const writeGuiEvent = (event: PuppetMasterEvent): void => {
      const guiEvent = translateEventForGui(event);
      const eventType = typeof guiEvent.type === 'string' ? guiEvent.type : 'message';

      try {
        res.write(`event: ${eventType}\n`);
        res.write(`data: ${JSON.stringify(guiEvent)}\n\n`);
      } catch (error) {
        // If we fail to write to the response (e.g., socket closed), we rely on `close` cleanup.
        console.error('[SSE] Failed to write event:', error);
      }
    };

    const subscriptionId = eventBus.subscribe('*', writeGuiEvent);

    // Keepalive comment to prevent idle timeouts.
    const keepaliveInterval = setInterval(() => {
      try {
        res.write(`: keepalive\n\n`);
      } catch {
        // Ignore; close handler will run shortly.
      }
    }, 25_000);

    const cleanup = (): void => {
      clearInterval(keepaliveInterval);
      eventBus.unsubscribe(subscriptionId);
    };

    req.on('close', () => {
      cleanup();
    });
  });

  return router;
}

