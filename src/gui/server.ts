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
import { existsSync } from 'fs';
import express, { type Express } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import type { EventBus, PuppetMasterEvent } from '../logging/index.js';
import type { OrchestratorState } from '../types/state.js';
import type { TierStateManager } from '../core/tier-state-manager.js';
import type { OrchestratorStateMachine } from '../core/orchestrator-state-machine.js';
import type { Orchestrator } from '../core/orchestrator.js';
import type { ProgressManager } from '../memory/progress-manager.js';
import type { AgentsManager } from '../memory/agents-manager.js';
import { createStateRoutes } from './routes/state.js';
import { createProjectsRoutes } from './routes/projects.js';
import { createWizardRoutes } from './routes/wizard.js';
import { createConfigRoutes } from './routes/config.js';
import { createEvidenceRoutes } from './routes/evidence.js';
import { createControlsRoutes } from './routes/controls.js';
import { createDoctorRoutes } from './routes/doctor.js';

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
  private orchestratorInstance: Orchestrator | null = null;
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
    // setupRoutes is now async, but we can't await in constructor
    // Routes will be set up synchronously, path resolution happens at request time
    this.setupRoutesSync();
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
   * Register orchestrator instance for controls and projects API routes.
   */
  registerOrchestratorInstance(orchestrator: Orchestrator): void {
    this.orchestratorInstance = orchestrator;
    this.app.use('/api', createControlsRoutes(this.orchestratorInstance));
    this.app.use('/api', createProjectsRoutes(this.orchestratorInstance));
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
   * Get public directory path (handles both dev and production)
   */
  private getPublicPath(): string {
    // Calculate the server.ts file's directory using fileURLToPath for reliable ESM path resolution
    const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
    
    // For dist path: resolve relative to server.ts location (absolute path)
    const distPath = path.resolve(currentFileDir, 'public');
    
    // For source path: resolve from project root (absolute path)
    const sourcePath = path.resolve(process.cwd(), 'src', 'gui', 'public');
    
    // Check if dist path exists (production/compiled)
    if (existsSync(distPath)) {
      return distPath;
    }
    // Check if source path exists (development with tsx)
    if (existsSync(sourcePath)) {
      return sourcePath;
    }
    // Fallback to source path for development
    return sourcePath;
  }

  /**
   * Setup HTTP routes.
   */
  private setupRoutesSync(): void {
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

    // Control endpoints will be registered via registerOrchestratorInstance()
    // If no orchestrator instance is registered, controls routes will return 503
    this.app.use('/api', createControlsRoutes(null));

    // Projects routes (will be updated when orchestrator is registered)
    this.app.use('/api', createProjectsRoutes(null));

    // Wizard routes
    this.app.use('/api', createWizardRoutes());

    // Config routes
    this.app.use('/api', createConfigRoutes());

    // Evidence routes
    this.app.use('/api', createEvidenceRoutes());

    // Doctor routes
    this.app.use('/api', createDoctorRoutes());

    // Get public path
    const publicPath = this.getPublicPath();

    // Route handlers for specific pages (BEFORE static middleware to ensure they're matched)
    this.app.get('/', (_req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });

    this.app.get('/projects', (_req, res) => {
      res.sendFile(path.join(publicPath, 'projects.html'));
    });

    this.app.get('/wizard', (_req, res) => {
      res.sendFile(path.join(publicPath, 'wizard.html'));
    });

    this.app.get('/tiers', (_req, res) => {
      res.sendFile(path.join(publicPath, 'tiers.html'));
    });

    this.app.get('/config', (_req, res) => {
      res.sendFile(path.join(publicPath, 'config.html'));
    });

    this.app.get('/evidence', (_req, res) => {
      res.sendFile(path.join(publicPath, 'evidence.html'));
    });

    this.app.get('/doctor', (_req, res) => {
      res.sendFile(path.join(publicPath, 'doctor.html'));
    });

    // Serve static files from public directory (AFTER specific routes)
    this.app.use(express.static(publicPath));
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
