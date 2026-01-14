/**
 * WebSocket Event Streamer for RWM Puppet Master GUI
 * 
 * Handles real-time event streaming to connected WebSocket clients.
 * Supports client subscriptions, event filtering, and heartbeat management.
 */

import { WebSocketServer, WebSocket } from 'ws';
import type { EventBus, PuppetMasterEvent } from '../../logging/index.js';

/**
 * Client subscription interface.
 * Tracks a connected client with their event filters.
 */
export interface ClientSubscription {
  /** Unique client identifier */
  clientId: string;
  /** WebSocket connection */
  ws: WebSocket;
  /** Event type filters - empty array means receive all events */
  filters: PuppetMasterEvent['type'][];
  /** Last ping timestamp */
  lastPingTime?: number;
  /** Pong timeout timer */
  pongTimeout?: NodeJS.Timeout;
}

/**
 * WebSocket message interface.
 * Messages sent between client and server.
 */
export interface WebSocketMessage {
  /** Message type */
  type: 'event' | 'subscribe' | 'unsubscribe' | 'ping' | 'pong';
  /** Message payload */
  payload: unknown;
}

/**
 * Subscribe message payload.
 */
export interface SubscribePayload {
  /** Event types to subscribe to */
  events: PuppetMasterEvent['type'][];
}

/**
 * Unsubscribe message payload.
 */
export interface UnsubscribePayload {
  /** Event types to unsubscribe from */
  events: PuppetMasterEvent['type'][];
}

/**
 * EventStreamer class.
 * 
 * Manages WebSocket connections and streams events from EventBus to clients.
 * Supports per-client event filtering and heartbeat management.
 */
export class EventStreamer {
  private readonly wss: WebSocketServer;
  private readonly eventBus: EventBus;
  private readonly clients: Map<string, ClientSubscription> = new Map();
  private eventSubscriptionId: string | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly PING_INTERVAL_MS = 30000; // 30 seconds
  private readonly PONG_TIMEOUT_MS = 10000; // 10 seconds
  private isStarted = false;

  constructor(wss: WebSocketServer, eventBus: EventBus) {
    this.wss = wss;
    this.eventBus = eventBus;
  }

  /**
   * Start the event streamer.
   * Subscribes to EventBus and sets up WebSocket connection handler.
   */
  start(): void {
    if (this.isStarted) {
      return;
    }

    // Subscribe to all EventBus events
    this.eventSubscriptionId = this.eventBus.subscribe('*', (event: PuppetMasterEvent) => {
      this.broadcast(event);
    });

    // Setup WebSocket connection handler
    this.wss.on('connection', (ws: WebSocket) => {
      this.handleConnection(ws);
    });

    // Start heartbeat
    this.startHeartbeat();

    this.isStarted = true;
  }

  /**
   * Stop the event streamer.
   * Unsubscribes from EventBus and closes all connections.
   */
  stop(): void {
    if (!this.isStarted) {
      return;
    }

    // Stop heartbeat
    this.stopHeartbeat();

    // Unsubscribe from EventBus
    if (this.eventSubscriptionId) {
      this.eventBus.unsubscribe(this.eventSubscriptionId);
      this.eventSubscriptionId = null;
    }

    // Close all client connections
    for (const [clientId, subscription] of this.clients.entries()) {
      this.cleanupClient(clientId, subscription);
    }
    this.clients.clear();

    this.isStarted = false;
  }

  /**
   * Handle a new WebSocket connection.
   */
  private handleConnection(ws: WebSocket): void {
    const clientId = this.generateClientId();
    const subscription: ClientSubscription = {
      clientId,
      ws,
      filters: [], // Empty filters = receive all events
    };

    this.clients.set(clientId, subscription);

    // Setup message handler
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        this.handleMessage(clientId, message);
      } catch (error) {
        console.error(`Error parsing message from client ${clientId}:`, error);
      }
    });

    // Setup close handler
    ws.on('close', () => {
      this.cleanupClient(clientId, subscription);
    });

    // Setup error handler
    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.cleanupClient(clientId, subscription);
    });
  }

  /**
   * Handle a message from a client.
   */
  private handleMessage(clientId: string, message: WebSocketMessage): void {
    const subscription = this.clients.get(clientId);
    if (!subscription) {
      return;
    }

    switch (message.type) {
      case 'subscribe': {
        const payload = message.payload as SubscribePayload;
        if (payload?.events && Array.isArray(payload.events)) {
          // Add new event types to filters (avoid duplicates)
          for (const eventType of payload.events) {
            if (!subscription.filters.includes(eventType)) {
              subscription.filters.push(eventType);
            }
          }
        }
        break;
      }

      case 'unsubscribe': {
        const payload = message.payload as UnsubscribePayload;
        if (payload?.events && Array.isArray(payload.events)) {
          // Remove event types from filters
          subscription.filters = subscription.filters.filter(
            (filter) => !payload.events.includes(filter)
          );
        }
        break;
      }

      case 'ping': {
        // Respond to client ping
        this.sendToClient(clientId, { type: 'pong', payload: null });
        break;
      }

      case 'pong': {
        // Client responded to our ping - clear timeout
        if (subscription.pongTimeout) {
          clearTimeout(subscription.pongTimeout);
          subscription.pongTimeout = undefined;
        }
        subscription.lastPingTime = Date.now();
        break;
      }

      default:
        console.warn(`Unknown message type from client ${clientId}: ${message.type}`);
    }
  }

  /**
   * Broadcast an event to all subscribed clients.
   */
  broadcast(event: PuppetMasterEvent): void {
    for (const [clientId, subscription] of this.clients.entries()) {
      // Check if client should receive this event
      if (this.shouldSendEvent(subscription, event)) {
        this.sendToClient(clientId, {
          type: 'event',
          payload: event,
        });
      }
    }
  }

  /**
   * Send a message to a specific client.
   */
  sendToClient(clientId: string, message: WebSocketMessage): void {
    const subscription = this.clients.get(clientId);
    if (!subscription) {
      return;
    }

    if (subscription.ws.readyState === WebSocket.OPEN) {
      try {
        subscription.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Error sending message to client ${clientId}:`, error);
        this.cleanupClient(clientId, subscription);
      }
    }
  }

  /**
   * Check if an event should be sent to a client based on their filters.
   */
  private shouldSendEvent(subscription: ClientSubscription, event: PuppetMasterEvent): boolean {
    // Empty filters = receive all events
    if (subscription.filters.length === 0) {
      return true;
    }

    // Check if event type is in filters
    return subscription.filters.includes(event.type);
  }

  /**
   * Start heartbeat mechanism.
   * Sends ping to all clients every 30 seconds.
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      for (const [clientId, subscription] of this.clients.entries()) {
        if (subscription.ws.readyState === WebSocket.OPEN) {
          // Send ping
          this.sendToClient(clientId, { type: 'ping', payload: null });

          // Set timeout for pong response
          subscription.pongTimeout = setTimeout(() => {
            // No pong received - close connection
            console.warn(`Client ${clientId} did not respond to ping - closing connection`);
            this.cleanupClient(clientId, subscription);
          }, this.PONG_TIMEOUT_MS);

          subscription.lastPingTime = now;
        }
      }
    }, this.PING_INTERVAL_MS);
  }

  /**
   * Stop heartbeat mechanism.
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    // Clear all pong timeouts
    for (const subscription of this.clients.values()) {
      if (subscription.pongTimeout) {
        clearTimeout(subscription.pongTimeout);
        subscription.pongTimeout = undefined;
      }
    }
  }

  /**
   * Cleanup a client connection.
   */
  private cleanupClient(clientId: string, subscription: ClientSubscription): void {
    // Clear pong timeout
    if (subscription.pongTimeout) {
      clearTimeout(subscription.pongTimeout);
    }

    // Close WebSocket if still open
    if (
      subscription.ws.readyState === WebSocket.OPEN ||
      subscription.ws.readyState === WebSocket.CONNECTING
    ) {
      subscription.ws.close();
    }

    // Remove from clients map
    this.clients.delete(clientId);
  }

  /**
   * Generate a unique client ID.
   */
  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Get the number of connected clients.
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get client subscription info (for testing/debugging).
   */
  getClientSubscription(clientId: string): ClientSubscription | undefined {
    return this.clients.get(clientId);
  }
}
