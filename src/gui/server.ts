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
import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import type { EventBus, PuppetMasterEvent } from '../logging/index.js';
import type { OrchestratorState } from '../types/state.js';
import type { TierStateManager } from '../core/tier-state-manager.js';
import type { OrchestratorStateMachine } from '../core/orchestrator-state-machine.js';
import type { Orchestrator } from '../core/orchestrator.js';
import type { ProgressManager } from '../memory/progress-manager.js';
import type { AgentsManager } from '../memory/agents-manager.js';
import type { PlatformRegistry } from '../platforms/registry.js';
import type { QuotaManager } from '../platforms/quota-manager.js';
import type { UsageTracker } from '../memory/usage-tracker.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { SessionTracker } from '../core/session-tracker.js';
import { createStateRoutes } from './routes/state.js';
import { createProjectsRoutes } from './routes/projects.js';
import { createWizardRoutes } from './routes/wizard.js';
import { createConfigRoutes } from './routes/config.js';
import { createEvidenceRoutes } from './routes/evidence.js';
import { createControlsRoutes } from './routes/controls.js';
import { createDoctorRoutes } from './routes/doctor.js';
import { createHistoryRoutes } from './routes/history.js';

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
  private startChainConfig: PuppetMasterConfig | null = null;
  private platformRegistry: PlatformRegistry | null = null;
  private quotaManager: QuotaManager | null = null;
  private usageTracker: UsageTracker | null = null;
  private sessionTracker: SessionTracker | null = null;

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
    
    // Get TierStateManager from orchestrator
    const orchestratorTierManager = orchestrator.getTierStateManager();
    
    // Update tierManager reference to use orchestrator's instance
    if (orchestratorTierManager) {
      this.tierManager = orchestratorTierManager;
      
      // Re-register state routes with orchestrator's TierStateManager
      if (this.orchestrator && this.progressManager && this.agentsManager) {
        this.app.use('/api', createStateRoutes(
          this.tierManager,
          this.orchestrator,
          this.progressManager,
          this.agentsManager
        ));
      }
    }
    
    this.app.use('/api', createControlsRoutes(this.orchestratorInstance));
    this.app.use('/api', createProjectsRoutes(this.orchestratorInstance));
  }

  /**
   * Register start chain dependencies for wizard routes.
   * Enables AI-powered PRD and architecture generation.
   */
  registerStartChainDependencies(
    config: PuppetMasterConfig,
    platformRegistry: PlatformRegistry,
    quotaManager: QuotaManager,
    usageTracker: UsageTracker
  ): void {
    this.startChainConfig = config;
    this.platformRegistry = platformRegistry;
    this.quotaManager = quotaManager;
    this.usageTracker = usageTracker;

    // Re-register wizard routes with dependencies
    this.app.use('/api', createWizardRoutes(
      undefined, // baseDirectory (uses process.cwd() by default)
      this.startChainConfig,
      this.platformRegistry,
      this.quotaManager,
      this.usageTracker,
      this.eventBus
    ));
  }

  /**
   * Register SessionTracker for history tracking.
   * Enables execution session history API.
   */
  registerSessionTracker(sessionTracker: SessionTracker): void {
    this.sessionTracker = sessionTracker;

    // Re-register history routes with SessionTracker
    this.app.use('/api', createHistoryRoutes(this.sessionTracker));
  }

  /**
   * Setup Express middleware.
   */
  private setupMiddleware(): void {
    // CORS configuration
    // Allow requests from same origin, localhost variants, and configured origins
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (same-origin, mobile apps, Postman, etc.)
        if (!origin) {
          callback(null, true);
          return;
        }
        
        // Check if origin is in configured list
        if (this.config.corsOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        
        // Allow localhost variants (http://localhost:*, http://127.0.0.1:*, http://0.0.0.0:*)
        // Also allow IP addresses in the local network range
        const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)(:\d+)?$/;
        if (localhostPattern.test(origin)) {
          callback(null, true);
          return;
        }
        
        // For development: allow any origin on common development ports (3000-9999)
        // This helps when accessing via IP address or different hostnames
        const devPortPattern = /^https?:\/\/[^:]+:(3\d{3}|[4-9]\d{3})$/;
        if (devPortPattern.test(origin)) {
          console.log(`[CORS] Allowing development origin: ${origin}`);
          callback(null, true);
          return;
        }
        
        // Also allow any local IP address (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        const localIPPattern = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+)(:\d+)?$/;
        if (localIPPattern.test(origin)) {
          console.log(`[CORS] Allowing local IP origin: ${origin}`);
          callback(null, true);
          return;
        }
        
        // Log rejected origin for debugging
        console.warn(`[CORS] Rejected origin: ${origin}`);
        console.warn(`[CORS] Allowed origins: ${JSON.stringify(this.config.corsOrigins)}`);
        
        // Deny other origins
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // JSON body parsing
    // Increase limit to 50MB to support large file uploads (base64 encoded files can be ~33% larger)
    this.app.use(express.json({ limit: '50mb' }));
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

    // Wizard routes (will be updated when start chain dependencies are registered)
    this.app.use('/api', createWizardRoutes());

    // Config routes
    this.app.use('/api', createConfigRoutes());

    // Evidence routes
    this.app.use('/api', createEvidenceRoutes());

    // Doctor routes
    this.app.use('/api', createDoctorRoutes());

    // History routes (will be updated when SessionTracker is registered)
    this.app.use('/api', createHistoryRoutes(null));

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

    this.app.get('/history', (_req, res) => {
      res.sendFile(path.join(publicPath, 'history.html'));
    });

    // Serve static files from public directory (AFTER specific routes)
    this.app.use(express.static(publicPath));

    // Error handler middleware - must be last
    // Ensures all errors return JSON responses
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error('[Server] Unhandled error:', err);
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      });
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
