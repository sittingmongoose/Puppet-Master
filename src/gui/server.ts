/**
 * GUI Server for RWM Puppet Master - Vibrant Technical (Ink & Paper) Design
 * 
 * Provides HTTP endpoints and WebSocket server for the browser-based GUI.
 * Handles real-time event streaming via WebSocket connections.
 * Port: 3847 (standard)
 */

import type { IncomingMessage } from 'http';
import type { Server as HTTPServer } from 'http';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { type Express } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import type { EventBus, PuppetMasterEvent } from '../logging/index.js';
import type { OrchestratorState } from '../types/state.js';
import type { TierStateManager } from '../core/tier-state-manager.js';
import type { OrchestratorStateMachine } from '../core/orchestrator-state-machine.js';
import type { ProgressManager } from '../memory/progress-manager.js';
import type { AgentsManager } from '../memory/agents-manager.js';
import { createStateRoutes } from './routes/state.js';

// Get __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Server configuration interface.
 */
export interface ServerConfig {
  /** Port to listen on (default: 3847) */
  port?: number;
  /** Host to bind to (default: 'localhost') */
  host?: string;
  /** CORS allowed origins */
  corsOrigins?: string[];
}

/**
 * GUI Server class.
 * 
 * Manages Express HTTP server and WebSocket server for real-time updates.
 */
export class GuiServer {
  private readonly app: Express;
  private server: HTTPServer | null = null;
  private wss: WebSocketServer | null = null;
  private readonly clients: Set<WebSocket> = new Set();
  private readonly config: Required<ServerConfig>;
  private readonly eventBus: EventBus;
  private tierManager: TierStateManager | null = null;
  private orchestrator: OrchestratorStateMachine | null = null;
  private progressManager: ProgressManager | null = null;
  private agentsManager: AgentsManager | null = null;

  constructor(config: ServerConfig, eventBus: EventBus) {
    this.config = {
      port: config.port ?? 3847,
      host: config.host ?? 'localhost',
      corsOrigins: config.corsOrigins ?? ['http://localhost:3847'],
    };
    this.eventBus = eventBus;
    this.app = express();

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Register state management dependencies and enable state API routes.
   */
  registerStateDependencies(
    tierManager: TierStateManager,
    orchestrator: OrchestratorStateMachine,
    progressManager: ProgressManager,
    agentsManager: AgentsManager
  ): void {
    this.tierManager = tierManager;
    this.orchestrator = orchestrator;
    this.progressManager = progressManager;
    this.agentsManager = agentsManager;

    if (this.tierManager && this.orchestrator && this.progressManager && this.agentsManager) {
      this.app.use('/api', createStateRoutes(
        this.tierManager,
        this.orchestrator,
        this.progressManager,
        this.agentsManager
      ));
    }
  }

  /**
   * Setup Express middleware.
   */
  private setupMiddleware(): void {
    // CORS configuration
    this.app.use(cors({
      origin: (origin, callback) => {
        if (!origin || this.config.corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }));

    // JSON body parsing
    this.app.use(express.json());
  }

  /**
   * Setup HTTP routes.
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        version: '0.1.0',
      });
    });

    // Status endpoint
    this.app.get('/api/status', (_req, res) => {
      res.json({
        state: 'idle' as OrchestratorState,
        version: '0.1.0',
      });
    });

    // Control endpoints (mock for now)
    this.app.post('/api/controls/start', (_req, res) => {
      res.json({ success: true, sessionId: `PM-${Date.now()}` });
    });

    this.app.post('/api/controls/pause', (_req, res) => {
      res.json({ success: true });
    });

    this.app.post('/api/controls/resume', (_req, res) => {
      res.json({ success: true });
    });

    this.app.post('/api/controls/stop', (_req, res) => {
      res.json({ success: true });
    });

    this.app.post('/api/controls/retry', (_req, res) => {
      res.json({ success: true });
    });

    // Serve static files from public directory
    const publicPath = path.join(__dirname, 'public');
    this.app.use(express.static(publicPath));

    // Fallback to index.html
    this.app.get('/', (_req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  /**
   * Setup WebSocket server and EventBus integration.
   */
  private setupWebSocket(): void {
    if (!this.server) {
      throw new Error('HTTP server must be started before WebSocket server');
    }

    this.wss = new WebSocketServer({
      server: this.server,
      path: '/events',
    });

    this.wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
      this.clients.add(ws);

      // Subscribe to all EventBus events and forward to this client
      const subscriptionId = this.eventBus.subscribe('*', (event: PuppetMasterEvent) => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify(event));
          } catch (error) {
            console.error('Error sending WebSocket message:', error);
          }
        }
      });

      // Store subscription ID on the WebSocket object for cleanup
      (ws as WebSocket & { _subscriptionId?: string })._subscriptionId = subscriptionId;

      // Handle client disconnect
      ws.on('close', () => {
        this.clients.delete(ws);
        const subId = (ws as WebSocket & { _subscriptionId?: string })._subscriptionId;
        if (subId) {
          this.eventBus.unsubscribe(subId);
        }
      });

      // Handle WebSocket errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
        const subId = (ws as WebSocket & { _subscriptionId?: string })._subscriptionId;
        if (subId) {
          this.eventBus.unsubscribe(subId);
        }
      });
    });
  }

  /**
   * Start the HTTP and WebSocket servers.
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = http.createServer(this.app);
        this.setupWebSocket();

        this.server.listen(this.config.port, this.config.host, () => {
          resolve();
        });

        this.server.on('error', (error) => {
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the servers and close all connections.
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      for (const client of this.clients) {
        const subId = (client as WebSocket & { _subscriptionId?: string })._subscriptionId;
        if (subId) {
          this.eventBus.unsubscribe(subId);
        }
        if (client.readyState === WebSocket.OPEN || client.readyState === WebSocket.CONNECTING) {
          client.close();
        }
      }
      this.clients.clear();

      if (this.wss) {
        this.wss.close(() => {
          if (this.server) {
            this.server.close(() => {
              this.server = null;
              this.wss = null;
              resolve();
            });
          } else {
            resolve();
          }
        });
      } else if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Broadcast an event to all connected WebSocket clients.
   */
  broadcast(event: PuppetMasterEvent): void {
    const message = JSON.stringify(event);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (error) {
          console.error('Error broadcasting to client:', error);
        }
      }
    }
  }

  /**
   * Get the server URL.
   */
  getUrl(): string {
    return `http://${this.config.host}:${this.config.port}`;
  }
}
