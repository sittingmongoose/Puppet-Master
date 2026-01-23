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
import { createWizardRoutes, type WizardDependencies } from './routes/wizard.js';
import { createConfigRoutes } from './routes/config.js';
import { createEvidenceRoutes } from './routes/evidence.js';
import { createCoverageRoutes } from './routes/coverage.js';
import { createControlsRoutes } from './routes/controls.js';
import { createDoctorRoutes } from './routes/doctor.js';
import { createHistoryRoutes } from './routes/history.js';
import { createSettingsRoutes } from './routes/settings.js';

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
  /** Base directory for project discovery (projects + wizard fallbacks) */
  baseDirectory?: string;
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
  private wizardRouter: ReturnType<typeof createWizardRoutes> | null = null;

  constructor(config: ServerConfig, eventBus: EventBus) {
    this.config = {
      port: config.port ?? 3847,
      host: config.host ?? 'localhost',
      corsOrigins: config.corsOrigins ?? ['http://localhost:3847'],
      // NOTE: This is a discovery/default base directory, not an implicit “current project”.
      baseDirectory: config.baseDirectory ?? process.cwd(),
    };
    this.eventBus = eventBus;
    this.app = express();

    this.setupMiddleware();
    // setupRoutes is now async, but we can't await in constructor
    // Routes will be set up synchronously, path resolution happens at request time
    this.setupRoutesSync();
  }

  /**
   * Translate backend EventBus events into the GUI's expected WebSocket message
   * names and shapes.
   *
   * The browser code (dashboard/tiers/wizard) expects a `type` string that may
   * differ from the backend EventBus discriminant, and for Dashboard it expects
   * a `payload` envelope.
   *
   * We keep original root fields (when safe) to avoid breaking any existing
   * consumers, but we always provide `payload` for GUI handlers.
   */
  private translateEventForGui(event: PuppetMasterEvent): Record<string, unknown> {
    switch (event.type) {
      case 'state_changed': {
        return {
          ...event,
          type: 'state_change',
          payload: {
            state: event.to,
            previousState: event.from,
          },
        };
      }

      case 'output_chunk': {
        return {
          ...event,
          type: 'output',
          payload: {
            subtaskId: event.subtaskId,
            line: event.chunk,
            type: 'stdout',
          },
        };
      }

      case 'iteration_started': {
        return {
          ...event,
          type: 'iteration_start',
          // Used by tiers view for highlighting.
          itemId: event.subtaskId,
          payload: {
            id: event.subtaskId,
            iteration: { current: event.iterationNumber },
          },
        };
      }

      case 'iteration_completed': {
        return {
          ...event,
          type: 'iteration_complete',
          itemId: event.subtaskId,
          payload: {
            id: event.subtaskId,
            passed: event.passed,
            status: event.passed ? 'complete' : 'failed',
          },
        };
      }

      case 'progress': {
        return {
          ...event,
          payload: {
            phases: { current: event.phasesComplete, total: event.phasesTotal },
            tasks: { current: event.tasksComplete, total: event.tasksTotal },
            subtasks: { current: event.subtasksComplete, total: event.subtasksTotal },
          },
        };
      }

      case 'commit': {
        return {
          ...event,
          payload: {
            sha: event.sha,
            message: event.message,
            files: event.files,
            timestamp: event.timestamp,
          },
        };
      }

      case 'gate_start': {
        return {
          ...event,
          payload: {
            token: event.verifierType,
            tierId: event.tierId,
            tierType: event.tierType,
            verifierType: event.verifierType,
            target: event.target,
          },
        };
      }

      case 'gate_complete': {
        return {
          ...event,
          payload: {
            // gate_complete events currently do not include verifierType/target.
            // Provide a stable token that won't collide with real verifier tokens.
            token: `gate:${event.tierId}`,
            tierId: event.tierId,
            tierType: event.tierType,
            passed: event.passed,
            evidence: event.evidence,
          },
        };
      }

      case 'budget_update': {
        return {
          ...event,
          payload: {
            [event.platform]: { current: event.used, limit: event.limit, cooldownUntil: event.cooldownUntil },
          },
        };
      }

      case 'error': {
        return {
          ...event,
          payload: {
            timestamp: new Date().toISOString(),
            severity: 'error',
            message: event.error,
            context: event.context,
          },
        };
      }

      case 'start_chain_step': {
        return {
          ...event,
          payload: {
            step: event.step,
            status: event.status,
            timestamp: event.timestamp,
          },
        };
      }

      case 'start_chain_complete': {
        return {
          ...event,
          payload: {
            projectPath: event.projectPath,
            artifacts: event.artifacts,
            timestamp: event.timestamp,
          },
        };
      }

      default: {
        return { ...event, payload: event };
      }
    }
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
    this.app.use('/api', createProjectsRoutes(this.orchestratorInstance, this.config.baseDirectory));
  }

  /**
   * Register start chain dependencies for wizard routes.
   * Enables AI-powered PRD and architecture generation.
   * Uses mutable dependency injection to update the existing wizard router.
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

    // Update wizard router dependencies using the mutable dependency holder
    // This avoids the issue of re-registering routes which would cause the old routes to match first
    if (this.wizardRouter) {
      this.wizardRouter.setDependencies({
        config: this.startChainConfig,
        platformRegistry: this.platformRegistry,
        quotaManager: this.quotaManager,
        usageTracker: this.usageTracker,
        eventBus: this.eventBus,
      });
    }
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
    this.app.use('/api', createProjectsRoutes(null, this.config.baseDirectory));

    // Wizard routes - using mutable dependency holder pattern
    // Dependencies will be injected via registerStartChainDependencies()
    this.wizardRouter = createWizardRoutes(this.config.baseDirectory);
    this.app.use('/api', this.wizardRouter);

    // Config routes
    this.app.use('/api', createConfigRoutes());

    // Settings routes
    this.app.use('/api', createSettingsRoutes());

    // Evidence routes
    this.app.use('/api', createEvidenceRoutes());

    // Coverage routes
    this.app.use('/api', createCoverageRoutes(this.config.baseDirectory));

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

    this.app.get('/settings', (_req, res) => {
      res.sendFile(path.join(publicPath, 'settings.html'));
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

    this.app.get('/coverage', (_req, res) => {
      res.sendFile(path.join(publicPath, 'coverage.html'));
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
            ws.send(JSON.stringify(this.translateEventForGui(event)));
          } catch (error) {
            console.error('Error sending WebSocket message:', error);
          }
        }
      });

      // Store subscription ID on the WebSocket object for cleanup
      (ws as WebSocket & { _subscriptionId?: string })._subscriptionId = subscriptionId;

      // Handle client messages (simple heartbeat compatibility)
      ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString()) as { type?: unknown };
          if (parsed && parsed.type === 'ping' && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch {
          // Ignore non-JSON messages.
        }
      });

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
