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
import type { CapabilityDiscoveryService } from '../platforms/capability-discovery.js';
import { createStateRoutes } from './routes/state.js';
import { createProjectsRoutes } from './routes/projects.js';
import { createWizardRoutes } from './routes/wizard.js';
import { createConfigRoutes } from './routes/config.js';
import { createEvidenceRoutes } from './routes/evidence.js';
import { createCoverageRoutes } from './routes/coverage.js';
import { createMetricsRoutes } from './routes/metrics.js';
import { createControlsRoutes } from './routes/controls.js';
import { createDoctorRoutes } from './routes/doctor.js';
import { createHistoryRoutes } from './routes/history.js';
import { createSettingsRoutes } from './routes/settings.js';
import { createEventsRoutes } from './routes/events.js';
import { createPlatformRoutes } from './routes/platforms.js';
// Feature parity routes (CLI ↔ GUI)
import { createLedgerRoutes } from './routes/ledger.js';
import { createLoginRoutes } from './routes/login.js';
import { translateEventForGui } from './translate-event-for-gui.js';
import {
  createAuthMiddleware,
  createAuthStatusHandler,
  getOrCreateAuthToken,
  type AuthConfig,
} from './auth-middleware.js';

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
  /** P0-G07: Whether to require authentication (default: true) */
  authEnabled?: boolean;
  /** P0-G07: Path to auth token file (default: .puppet-master/gui-token.txt) */
  authTokenPath?: string;
  /** P0-G07: Whether to relax CORS for development (allows dev ports and LAN IPs) */
  corsRelaxed?: boolean;
  /** Whether to serve React SPA instead of vanilla HTML (default: false) */
  useReactGui?: boolean;
  /** Trust proxy headers (X-Forwarded-For, X-Forwarded-Proto, etc.) for reverse proxy setups (default: false) */
  trustProxy?: boolean;
  /** CORS allowed origins allowlist (overrides corsOrigins when specified) */
  allowedOrigins?: string[];
  /** Allow token exposure in /api/auth/status for non-loopback requests (default: false for security) */
  exposeTokenRemotely?: boolean;
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
  private readonly config: Required<ServerConfig> & { 
    authEnabled: boolean; 
    authTokenPath: string; 
    corsRelaxed: boolean; 
    useReactGui: boolean;
    trustProxy: boolean;
    allowedOrigins: string[];
    exposeTokenRemotely: boolean;
  };
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
  // P2-G13: Capability discovery service for detailed platform capabilities
  private capabilityDiscovery: CapabilityDiscoveryService | null = null;
  private wizardRouter: ReturnType<typeof createWizardRoutes> | null = null;
  // P0-G07: Authentication configuration
  private authConfig: AuthConfig | null = null;
  // P1-G17: Heartbeat interval for stale connection detection
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private static readonly HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds
  private static readonly HEARTBEAT_TIMEOUT_MS = 10000; // 10 seconds to respond

  constructor(config: ServerConfig, eventBus: EventBus) {
    this.config = {
      port: config.port ?? 3847,
      host: config.host ?? 'localhost',
      corsOrigins: config.corsOrigins ?? ['http://localhost:3847'],
      // NOTE: This is a discovery/default base directory, not an implicit “current project”.
      baseDirectory: config.baseDirectory ?? process.cwd(),
      // P0-G07: Auth defaults - enabled by default for security
      authEnabled: config.authEnabled ?? true,
      authTokenPath: config.authTokenPath ?? '.puppet-master/gui-token.txt',
      // P0-G07: CORS relaxed mode - disabled by default (secure)
      corsRelaxed: config.corsRelaxed ?? false,
      // React GUI: enabled by default (vanilla HTML available via --classic flag)
      useReactGui: config.useReactGui ?? true,
      // Reverse proxy support - disabled by default (secure)
      trustProxy: config.trustProxy ?? false,
      // Allow list for CORS origins - use allowedOrigins if provided, otherwise corsOrigins
      allowedOrigins: config.allowedOrigins ?? config.corsOrigins ?? ['http://localhost:3847'],
      // Token exposure - disabled by default for security (only loopback)
      exposeTokenRemotely: config.exposeTokenRemotely ?? false,
    };
    this.eventBus = eventBus;
    this.app = express();

    this.setupMiddleware();
    // setupRoutes is now async, but we can't await in constructor
    // Routes will be set up synchronously, path resolution happens at request time
    this.setupRoutesSync();
  }

  /**
   * P0-G07: Initialize authentication.
   * Must be called before start() when auth is enabled.
   * Returns the auth token for display to the user.
   */
  async initializeAuth(): Promise<string | undefined> {
    if (!this.config.authEnabled) {
      console.log('[Auth] Authentication disabled');
      return undefined;
    }

    const token = await getOrCreateAuthToken(this.config.authTokenPath);
    this.authConfig = {
      enabled: true,
      tokenPath: this.config.authTokenPath,
      token,
      exposeTokenRemotely: this.config.exposeTokenRemotely,
    };

    // Auth middleware is already registered in setupMiddleware() before routes
    // We just need to set authConfig so the middleware can use it
    // The middleware will now work because authConfig is set

    // Add auth status endpoint
    this.app.get('/api/auth/status', createAuthStatusHandler(this.authConfig));

    console.log('[Auth] Authentication initialized');
    console.log(`[Auth] Token file: ${this.config.authTokenPath}`);

    return token;
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
    // Routes are already registered in setupRoutesSync() - no need to re-register
    // The route handlers will use the updated dependency references
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
      
      // Routes are already registered in setupRoutesSync() - no need to re-register
      // The route handlers will use the updated this.tierManager reference
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
   * Register CapabilityDiscoveryService for detailed platform capabilities.
   * P2-G13: Exposes capability discovery data in the GUI.
   */
  registerCapabilityDiscovery(capabilityDiscovery: CapabilityDiscoveryService): void {
    this.capabilityDiscovery = capabilityDiscovery;
  }

  /**
   * Setup Express middleware.
   */
  private setupMiddleware(): void {
    // Configure trust proxy for reverse proxy support
    // When enabled, Express will trust X-Forwarded-* headers
    if (this.config.trustProxy) {
      this.app.set('trust proxy', true);
      console.log('[Server] Trust proxy enabled - will use X-Forwarded-* headers');
    }
    
    // P0-G07: Register auth middleware BEFORE routes if auth is enabled
    // This ensures routes are protected. The middleware checks this.authConfig
    // which will be set when initializeAuth() is called.
    if (this.config.authEnabled) {
      this.app.use((req, res, next) => {
        // Allow auth-related endpoints without authentication
        // P0-G07: Also allow /api/login/* routes (platform auth status, not GUI auth)
        if (req.path.startsWith('/api/auth/') || req.path.startsWith('/api/login/')) {
          return next();
        }
        
        // Allow non-API routes (static files, etc.)
        if (!req.path.startsWith('/api/')) {
          return next();
        }
        
        // If authConfig doesn't exist yet, auth hasn't been initialized
        // Return 401 to protect routes until initializeAuth() is called
        if (!this.authConfig) {
          res.status(401).json({
            error: 'Authentication not initialized',
            code: 'AUTH_NOT_INITIALIZED',
            hint: 'Server must call initializeAuth() before start()',
          });
          return;
        }
        
        // Use the actual auth middleware logic
        // createAuthMiddleware returns a handler that uses config.token
        const authMiddleware = createAuthMiddleware(this.authConfig);
        return authMiddleware(req, res, next);
      });
    }
    
    // CORS configuration
    // P0-G07: Secure by default - localhost only, with configurable dev mode
    const corsRelaxed = process.env.GUI_CORS_RELAXED === 'true' || 
                        process.env.GUI_CORS_RELAXED === '1' ||
                        this.config.corsRelaxed === true;
    
    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (same-origin, mobile apps, Postman, etc.)
        if (!origin) {
          callback(null, true);
          return;
        }
        
        // Check if origin is in configured allowlist (allowedOrigins takes precedence)
        if (this.config.allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        
        // Always allow localhost variants (http://localhost:*, http://127.0.0.1:*, http://0.0.0.0:*)
        const localhostPattern = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0|::1)(:\d+)?$/;
        if (localhostPattern.test(origin)) {
          callback(null, true);
          return;
        }
        
        // If CORS is relaxed (dev mode), allow additional origins
        if (corsRelaxed) {
          // Allow any origin on common development ports (3000-9999)
          const devPortPattern = /^https?:\/\/[^:]+:(3\d{3}|[4-9]\d{3})$/;
          if (devPortPattern.test(origin)) {
            console.log(`[CORS] Allowing development origin (relaxed mode): ${origin}`);
            callback(null, true);
            return;
          }
          
          // Allow local IP addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
          const localIPPattern = /^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[01])\.\d+\.\d+)(:\d+)?$/;
          if (localIPPattern.test(origin)) {
            console.log(`[CORS] Allowing local IP origin (relaxed mode): ${origin}`);
            callback(null, true);
            return;
          }
        }
        
        // Log rejected origin for debugging
        console.warn(`[CORS] Rejected origin: ${origin}`);
        if (corsRelaxed) {
          console.warn(`[CORS] Relaxed mode enabled but origin doesn't match dev/local patterns`);
        } else {
          console.warn(`[CORS] CORS restricted to localhost only. Set GUI_CORS_RELAXED=true for dev mode.`);
        }
        console.warn(`[CORS] Allowed origins: ${JSON.stringify(this.config.allowedOrigins)}`);
        
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
   * Get React SPA build directory path (for useReactGui mode)
   */
  private getReactBuildPath(): string {
    // Calculate the server.ts file's directory
    const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
    
    // React dist from compiled server location
    const distPath = path.resolve(currentFileDir, 'react', 'dist');
    
    // React dist from source (development)
    const sourcePath = path.resolve(process.cwd(), 'src', 'gui', 'react', 'dist');
    
    // Check if dist path exists (production)
    if (existsSync(distPath)) {
      return distPath;
    }
    // Check if source dist exists (development after build)
    if (existsSync(sourcePath)) {
      return sourcePath;
    }
    // Fallback
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

    // Status endpoint (P1-G08: Return actual orchestrator state)
    this.app.get('/api/status', (_req, res) => {
      if (this.orchestratorInstance) {
        const progress = this.orchestratorInstance.getProgress();
        res.json({
          state: progress.state,
          version: '0.1.0',
          currentPhase: progress.currentPhase,
          currentTask: progress.currentTask,
          currentSubtask: progress.currentSubtask,
          totalSubtasks: progress.totalSubtasks,
          completedSubtasks: progress.completedSubtasks,
          elapsedTime: progress.elapsedTime,
        });
      } else {
        res.json({
          state: 'idle' as OrchestratorState,
          version: '0.1.0',
          currentPhase: null,
          currentTask: null,
          currentSubtask: null,
          totalSubtasks: 0,
          completedSubtasks: 0,
          elapsedTime: 0,
        });
      }
    });

    // Platform health endpoint (P2-T07)
    this.app.get('/api/platforms/health', (_req, res) => {
      if (!this.orchestratorInstance) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        });
        return;
      }

      res.json(this.orchestratorInstance.getPlatformHealthSnapshot());
    });

    // P1-G08: Capabilities endpoint - returns platform capabilities
    // P2-G13: Enhanced to return detailed capability discovery data when available
    this.app.get('/api/capabilities', async (_req, res) => {
      if (!this.platformRegistry) {
        res.status(503).json({
          error: 'Platform registry not available',
          code: 'PLATFORM_REGISTRY_NOT_AVAILABLE',
        });
        return;
      }

      try {
        const available = this.platformRegistry.getAvailable();
        const allPlatforms: Array<'cursor' | 'codex' | 'claude' | 'gemini' | 'copilot'> = 
          ['cursor', 'codex', 'claude', 'gemini', 'copilot'];
        
        // P2-G13: If capability discovery service is available, return detailed info
        if (this.capabilityDiscovery) {
          const detailedCapabilities: Record<string, unknown> = {};
          
          for (const platform of allPlatforms) {
            try {
              // Try to get cached capabilities first
              const cached = await this.capabilityDiscovery.getCached(platform);
              if (cached) {
                detailedCapabilities[platform] = {
                  available: cached.runnable,
                  runnable: cached.runnable,
                  version: cached.version,
                  command: cached.command,
                  authStatus: cached.authStatus,
                  capabilities: cached.capabilities,
                  quotaInfo: cached.quotaInfo,
                  cooldownInfo: cached.cooldownInfo,
                  probeTimestamp: cached.probeTimestamp,
                  probedFrom: 'cache',
                };
              } else {
                // No cached data, just check if runner is registered
                const runner = this.platformRegistry.get(platform);
                detailedCapabilities[platform] = {
                  available: !!runner,
                  runnable: !!runner,
                  probedFrom: 'registry',
                };
              }
            } catch {
              detailedCapabilities[platform] = {
                available: false,
                runnable: false,
                error: 'Failed to get capabilities',
              };
            }
          }
          
          res.json({
            platforms: detailedCapabilities,
            discoveryAvailable: true,
          });
          return;
        }
        
        // Fallback: Basic capabilities from registry only
        const capabilities: Record<string, unknown> = {};
        
        for (const platform of available) {
          const runner = this.platformRegistry.get(platform);
          capabilities[platform] = {
            available: !!runner,
          };
        }
        
        // Add unavailable platforms
        for (const platform of allPlatforms) {
          if (!capabilities[platform]) {
            capabilities[platform] = { available: false };
          }
        }
        
        res.json({
          platforms: capabilities,
          discoveryAvailable: false,
        });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Failed to get capabilities',
        });
      }
    });

    // P2-G13: Detailed capabilities for a specific platform
    this.app.get('/api/capabilities/:platform', async (req, res) => {
      const platform = req.params.platform as 'cursor' | 'codex' | 'claude' | 'gemini' | 'copilot';
      const allPlatforms = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];
      
      if (!allPlatforms.includes(platform)) {
        res.status(400).json({
          error: `Invalid platform: ${platform}. Valid platforms: ${allPlatforms.join(', ')}`,
          code: 'INVALID_PLATFORM',
        });
        return;
      }

      if (!this.capabilityDiscovery) {
        res.status(503).json({
          error: 'Capability discovery service not available',
          code: 'CAPABILITY_DISCOVERY_NOT_AVAILABLE',
        });
        return;
      }

      try {
        // Check if we should probe fresh or use cache
        const forceProbe = req.query.probe === 'true';
        
        if (forceProbe) {
          const probed = await this.capabilityDiscovery.probe(platform);
          res.json({
            platform,
            capabilities: probed,
            probedAt: new Date().toISOString(),
            fromCache: false,
          });
        } else {
          const cached = await this.capabilityDiscovery.getCached(platform);
          if (cached) {
            res.json({
              platform,
              capabilities: cached,
              fromCache: true,
            });
          } else {
            // No cache, need to probe
            const probed = await this.capabilityDiscovery.probe(platform);
            res.json({
              platform,
              capabilities: probed,
              probedAt: new Date().toISOString(),
              fromCache: false,
            });
          }
        }
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Failed to get capabilities',
        });
      }
    });

    // P1-G08: Budgets endpoint - returns quota/budget information
    this.app.get('/api/budgets', async (_req, res) => {
      if (!this.quotaManager) {
        res.status(503).json({
          error: 'Quota manager not available',
          code: 'QUOTA_MANAGER_NOT_AVAILABLE',
        });
        return;
      }

      try {
        const allPlatforms: Array<'cursor' | 'codex' | 'claude' | 'gemini' | 'copilot'> = 
          ['cursor', 'codex', 'claude', 'gemini', 'copilot'];
        const budgets: Record<string, unknown> = {};
        
        for (const platform of allPlatforms) {
          try {
            const quotaInfo = await this.quotaManager.checkQuota(platform);
            budgets[platform] = quotaInfo;
          } catch (error) {
            // QuotaExhaustedError means quota is at 0
            budgets[platform] = {
              remaining: 0,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        }
        
        res.json(budgets);
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Failed to get budgets',
        });
      }
    });

    // P1-G08: Logs endpoint - returns iteration logs
    this.app.get('/api/logs', async (req, res) => {
      try {
        const { iterationId, sessionId, limit = '50' } = req.query;
        const logsDir = path.join(this.config.baseDirectory, '.puppet-master', 'logs', 'iterations');
        
        // Check if logs directory exists
        const { existsSync, readdirSync, readFileSync } = await import('fs');
        if (!existsSync(logsDir)) {
          res.json({ logs: [] });
          return;
        }
        
        // Get log files
        let logFiles = readdirSync(logsDir).filter(f => f.endsWith('.log'));
        
        // Filter by iterationId or sessionId if provided
        if (iterationId) {
          logFiles = logFiles.filter(f => f.includes(String(iterationId)));
        }
        if (sessionId) {
          logFiles = logFiles.filter(f => f.includes(String(sessionId)));
        }
        
        // Sort by name (which includes timestamp) descending
        logFiles.sort().reverse();
        
        // Limit results
        const limitNum = Math.min(parseInt(String(limit), 10) || 50, 100);
        logFiles = logFiles.slice(0, limitNum);
        
        // Read log contents
        const logs = logFiles.map(file => {
          const content = readFileSync(path.join(logsDir, file), 'utf-8');
          return {
            filename: file,
            content: content.slice(0, 10000), // Limit content size
            truncated: content.length > 10000,
          };
        });
        
        res.json({ logs });
      } catch (error) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Failed to get logs',
        });
      }
    });

    // State routes - always register with dependency getters
    // Route handlers will return 503 or empty responses if dependencies aren't available
    this.app.use('/api', createStateRoutes({
      getTierManager: () => this.tierManager,
      getOrchestrator: () => this.orchestrator,
      getProgressManager: () => this.progressManager,
      getAgentsManager: () => this.agentsManager,
      getQuotaManager: () => this.quotaManager,
      getUsageTracker: () => this.usageTracker,
    }));

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

    // Metrics routes (P2-T08)
    this.app.use('/api', createMetricsRoutes(this.config.baseDirectory));

    // Doctor routes
    this.app.use('/api', createDoctorRoutes());

    // Platform routes
    this.app.use('/api', createPlatformRoutes());

    // History routes (will be updated when SessionTracker is registered)
    this.app.use('/api', createHistoryRoutes(null));

    // SSE event stream routes (P2-T10)
    this.app.use('/api', createEventsRoutes(this.eventBus));

    // Feature parity routes (CLI ↔ GUI)
    this.app.use('/api', createLedgerRoutes(this.config.baseDirectory));
    this.app.use('/api', createLoginRoutes());

    // Check if using React SPA or vanilla HTML
    if (this.config.useReactGui) {
      // React SPA mode - serve from react/dist
      const reactPath = this.getReactBuildPath();
      
      // Serve static assets from React build
      this.app.use(express.static(reactPath));
      
      // SPA fallback: all non-API routes serve index.html
      // React Router handles client-side routing
      this.app.get('*', (req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.join(reactPath, 'index.html'));
      });
    } else {
      // Vanilla HTML mode (legacy - old HTML files removed, React GUI is default)
      // Keep static file serving for any remaining assets (e.g., favicon.svg)
      const publicPath = this.getPublicPath();
      this.app.use(express.static(publicPath));
      
      // All routes now handled by React SPA catch-all above
      // Old HTML route handlers removed (Task 6.3)
    }

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

    // P1-G17: Extended WebSocket type for heartbeat tracking
    type ExtendedWebSocket = WebSocket & {
      _subscriptionId?: string;
      _isAlive?: boolean;
    };

    this.wss.on('connection', (ws: WebSocket, _req: IncomingMessage) => {
      const extWs = ws as ExtendedWebSocket;
      this.clients.add(ws);
      extWs._isAlive = true;

      // Subscribe to all EventBus events and forward to this client
      const subscriptionId = this.eventBus.subscribe('*', (event: PuppetMasterEvent) => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.send(JSON.stringify(translateEventForGui(event)));
          } catch (error) {
            console.error('Error sending WebSocket message:', error);
          }
        }
      });

      // Store subscription ID on the WebSocket object for cleanup
      extWs._subscriptionId = subscriptionId;

      // P1-G17: Handle WebSocket pong responses (native protocol level)
      ws.on('pong', () => {
        extWs._isAlive = true;
      });

      // Handle client messages (simple heartbeat compatibility)
      ws.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString()) as { type?: unknown };
          if (parsed && parsed.type === 'ping' && ws.readyState === WebSocket.OPEN) {
            extWs._isAlive = true; // P1-G17: Mark as alive on application-level ping too
            ws.send(JSON.stringify({ type: 'pong' }));
          }
        } catch {
          // Ignore non-JSON messages.
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.clients.delete(ws);
        const subId = extWs._subscriptionId;
        if (subId) {
          this.eventBus.unsubscribe(subId);
        }
      });

      // Handle WebSocket errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
        const subId = extWs._subscriptionId;
        if (subId) {
          this.eventBus.unsubscribe(subId);
        }
      });
    });

    // P1-G17: Start heartbeat interval to detect stale connections
    this.startHeartbeat();
  }

  /**
   * P1-G17: Start heartbeat interval to detect and clean up stale WebSocket connections.
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    type ExtendedWebSocket = WebSocket & {
      _subscriptionId?: string;
      _isAlive?: boolean;
    };

    this.heartbeatInterval = setInterval(() => {
      for (const client of this.clients) {
        const extClient = client as ExtendedWebSocket;

        if (extClient._isAlive === false) {
          // Client didn't respond to last ping - terminate
          console.warn('[WebSocket] Terminating stale connection');
          const subId = extClient._subscriptionId;
          if (subId) {
            this.eventBus.unsubscribe(subId);
          }
          this.clients.delete(client);
          client.terminate();
          continue;
        }

        // Mark as not alive and send ping
        extClient._isAlive = false;
        if (client.readyState === WebSocket.OPEN) {
          client.ping();
        }
      }
    }, GuiServer.HEARTBEAT_INTERVAL_MS);
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
    // P1-G17: Clear heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    return new Promise((resolve) => {
      // Close all WebSocket connections and unsubscribe from EventBus
      for (const client of this.clients) {
        const subId = (client as WebSocket & { _subscriptionId?: string })._subscriptionId;
        if (subId) {
          this.eventBus.unsubscribe(subId);
        }
        // Terminate connections immediately (don't wait for graceful close)
        if (client.readyState === WebSocket.OPEN || client.readyState === WebSocket.CONNECTING) {
          client.terminate(); // Use terminate() instead of close() for immediate cleanup
        }
      }
      this.clients.clear();

      // Close WebSocket server first
      if (this.wss) {
        this.wss.close(() => {
          // Then close HTTP server
          if (this.server) {
            this.server.close(() => {
              // Set to null after close to prevent reuse
              this.server = null;
              this.wss = null;
              // Small delay to ensure all cleanup completes
              setTimeout(() => resolve(), 50);
            });
          } else {
            this.wss = null;
            setTimeout(() => resolve(), 50);
          }
        });
      } else if (this.server) {
        this.server.close(() => {
          this.server = null;
          setTimeout(() => resolve(), 50);
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
