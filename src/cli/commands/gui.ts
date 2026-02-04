/**
 * GUI command - Launch the web-based GUI server
 *
 * Implements the `puppet-master gui` command that:
 * - Loads configuration
 * - Creates EventBus and dependency injection container
 * - Initializes GuiServer
 * - Creates Orchestrator instance
 * - Wires orchestrator to GUI server
 * - Starts HTTP and WebSocket servers
 * - Opens browser automatically (unless --no-open flag is used)
 */

import { Command } from 'commander';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdirSync, appendFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import net from 'net';
import open from 'open';
import { ConfigManager } from '../../config/config-manager.js';
import { createContainer } from '../../core/container.js';
import { Orchestrator } from '../../core/orchestrator.js';
import { SessionTracker } from '../../core/session-tracker.js';
import { GuiServer } from '../../gui/server.js';
import { EventBus } from '../../logging/event-bus.js';
import { PlatformRegistry } from '../../platforms/registry.js';
import { PlatformRouter } from '../../core/platform-router.js';
import { QuotaManager } from '../../platforms/quota-manager.js';
import type { TierStateManager } from '../../core/tier-state-manager.js';
import { OrchestratorStateMachine } from '../../core/orchestrator-state-machine.js';
import type { ProgressManager, AgentsManager, UsageTracker } from '../../memory/index.js';
import { deriveProjectRootFromConfigPath } from '../../utils/project-paths.js';
import type { CommandModule } from './index.js';

/**
 * Options for the GUI command
 */
export interface GuiOptions {
  config?: string;
  port?: number;
  host?: string;
  open?: boolean;
  verbose?: boolean;
  /** P0-G07: Disable authentication (development only) */
  auth?: boolean;
  /** P0-G07: Relax CORS policy for development (allows dev ports and LAN IPs) */
  relaxedCors?: boolean;
  /** Use classic vanilla HTML GUI instead of React */
  classic?: boolean;
  /** Trust proxy headers (X-Forwarded-For, etc.) for reverse proxy setups */
  trustProxy?: boolean;
  /** Allowed origins for CORS (comma-separated) */
  allowedOrigins?: string;
  /** Allow token exposure for non-loopback requests (security risk, use with caution) */
  exposeTokenRemotely?: boolean;
}

/**
 * Get crash log path when running without TTY (GUI launch from desktop/shortcut).
 * Linux/macOS: ~/.puppet-master/logs/crash.log
 * Windows: %USERPROFILE%\.puppet-master\logs\crash.log
 */
function getCrashLogPath(): string | undefined {
  if (process.platform === 'win32') {
    const home = process.env.USERPROFILE || process.env.HOME || process.env.TEMP || 'C:\\tmp';
    return path.join(home, '.puppet-master', 'logs', 'crash.log');
  }
  const home = process.env.HOME || '/tmp';
  return path.join(home, '.puppet-master', 'logs', 'crash.log');
}

/**
 * Returns true when crash logging should be enabled: GUI launched without a TTY
 * (desktop shortcut, app menu, etc.) where stdout/stderr are not visible.
 */
function shouldEnableCrashLogging(): boolean {
  return !process.stdout.isTTY;
}

/**
 * Wrap a stream's write so that ERR_STREAM_DESTROYED is caught and ignored.
 * After the first destroyed write we replace with a no-op to avoid a CPU spin
 * if the caller (e.g. vscode-jsonrpc) retries writes in a tight loop.
 */
function wrapStreamWriteToIgnoreDestroyed(
  stream: NodeJS.WriteStream & { write: NodeJS.WriteStream['write'] }
): void {
  const origWrite = stream.write.bind(stream);
  let destroyed = false;

  function noopWrite(
    _chunk: string | Uint8Array,
    encodingOrCallback?: BufferEncoding | ((err?: Error | null) => void),
    callback?: (err?: Error | null) => void
  ): boolean {
    const cb = typeof encodingOrCallback === 'function' ? encodingOrCallback : callback;
    if (cb) setImmediate(cb, null);
    return false;
  }

  stream.write = function (
    chunk: string | Uint8Array,
    encodingOrCallback?: BufferEncoding | ((err?: Error | null) => void),
    callback?: (err?: Error | null) => void
  ): boolean {
    if (destroyed) {
      return noopWrite(chunk, encodingOrCallback, callback);
    }
    const cb = typeof encodingOrCallback === 'function' ? encodingOrCallback : callback;
    const enc = typeof encodingOrCallback === 'function' ? undefined : encodingOrCallback;
    const wrappedCb = cb
      ? (err?: Error | null) => {
          if (err && (err as NodeJS.ErrnoException).code === 'ERR_STREAM_DESTROYED') {
            destroyed = true;
            stream.write = noopWrite;
            cb(null);
            return;
          }
          cb(err);
        }
      : undefined;
    try {
      return origWrite(chunk, enc as BufferEncoding | undefined, wrappedCb);
    } catch (err) {
      const e = err as NodeJS.ErrnoException;
      if (e?.code === 'ERR_STREAM_DESTROYED') {
        destroyed = true;
        stream.write = noopWrite;
        if (cb) setImmediate(cb, null);
        return false;
      }
      throw err;
    }
  };
}

/**
 * Ensure crash log directory exists and write error to crash.log.
 * Used when running without TTY to capture failures for debugging.
 */
function writeToCrashLog(error: unknown): void {
  const crashPath = getCrashLogPath();
  if (!crashPath) return;
  try {
    const logDir = path.dirname(crashPath);
    mkdirSync(logDir, { recursive: true });
    const timestamp = new Date().toISOString();
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const entry = `[${timestamp}] Error: ${message}${stack ? `\n${stack}` : ''}\n\n`;
    appendFileSync(crashPath, entry, 'utf8');
  } catch {
    // Best-effort; ignore write failures
  }
}

/**
 * Install unhandled rejection handler when running without TTY.
 * Logs to crash.log before Node's default exit-on-rejection behavior.
 */
function installCrashHandlers(): void {
  const crashPath = getCrashLogPath();
  if (!crashPath) return;
  try {
    const logDir = path.dirname(crashPath);
    mkdirSync(logDir, { recursive: true });
  } catch {
    // Ignore
  }
  process.on('unhandledRejection', (reason: unknown) => {
    writeToCrashLog(reason instanceof Error ? reason : new Error(String(reason)));
    process.exit(1);
  });
  // Catch uncaught exceptions (e.g. ERR_STREAM_DESTROYED from vscode-jsonrpc when
  // launched from a desktop shortcut with no TTY). Log but do NOT exit for stream
  // errors since the GUI server can continue running without stdout/stderr.
  process.on('uncaughtException', (error: Error) => {
    const errno = error as NodeJS.ErrnoException;
    if (errno.code === 'ERR_STREAM_DESTROYED' || errno.code === 'EPIPE' || errno.code === 'ERR_STREAM_WRITE_AFTER_END') {
      writeToCrashLog(error);
      // Do NOT exit - the GUI server can continue without stdout/stderr
      return;
    }
    // For other uncaught exceptions, log and exit
    writeToCrashLog(error);
    process.exit(1);
  });
}

/**
 * Check if an existing Puppet Master instance is already running on the given port.
 * Makes a GET request to /health and verifies the response looks like our server.
 * Returns the server URL if a valid instance is found, undefined otherwise.
 */
async function checkExistingInstance(port: number, host: string): Promise<string | undefined> {
  const checkHost = host === 'localhost' ? '127.0.0.1' : host;
  const url = `http://${checkHost}:${port}/health`;
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: 2000 }, (res) => {
      let data = '';
      res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
      res.on('end', () => {
        try {
          const json = JSON.parse(data) as { status?: string };
          if (res.statusCode === 200 && json.status === 'ok') {
            // This is a running Puppet Master instance
            const resolvedHost = checkHost === '0.0.0.0' ? '127.0.0.1' : checkHost;
            resolve(`http://${resolvedHost}:${port}`);
          } else {
            resolve(undefined);
          }
        } catch {
          resolve(undefined);
        }
      });
    });
    req.on('error', () => resolve(undefined));
    req.on('timeout', () => {
      req.destroy();
      resolve(undefined);
    });
  });
}

/**
 * Wait for the local server to respond on /health, confirming it is ready to serve requests.
 * Retries up to maxAttempts times with a short delay between attempts.
 */
async function waitForServerReady(port: number, maxAttempts = 10, delayMs = 200): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await checkExistingInstance(port, '127.0.0.1');
    if (result) return true;
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

/**
 * Check if a port is available for binding
 */
async function checkPortAvailable(port: number, host: string): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

/**
 * Best-effort: resolve install root when running from an installed payload.
 * - Prefer env var set by installers.
 * - Fallback: derive from current module path (dist/cli/commands/*.js).
 */
function resolveInstallRoot(): string | undefined {
  const envRoot = process.env.PUPPET_MASTER_INSTALL_ROOT || process.env.PUPPET_MASTER_APP_ROOT;
  if (envRoot && existsSync(envRoot)) return envRoot;

  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const candidate = path.resolve(here, '../../../../');
    if (existsSync(path.join(candidate, 'bin')) && existsSync(path.join(candidate, 'app'))) {
      return candidate;
    }
  } catch {
    // ignore
  }

  return undefined;
}

function resolveTauriGuiBinary(installRoot: string | undefined): string | undefined {
  if (installRoot) {
    if (process.platform === 'win32') {
      const exe = path.join(installRoot, 'app', 'puppet-master-gui.exe');
      if (existsSync(exe)) return exe;
    } else {
      const bin = path.join(installRoot, 'bin', 'puppet-master-gui');
      if (existsSync(bin)) return bin;
    }
  }
  // Dev: look for Tauri binary in project (src-tauri/target/release/)
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const projectRoot = path.resolve(here, '../../../../');
    if (process.platform === 'win32') {
      const exe = path.join(projectRoot, 'src-tauri', 'target', 'release', 'puppet-master.exe');
      if (existsSync(exe)) return exe;
    } else {
      const bin = path.join(projectRoot, 'src-tauri', 'target', 'release', 'puppet-master');
      if (existsSync(bin)) return bin;
    }
  } catch {
    // ignore
  }
  return undefined;
}

/** Return type: child process when Tauri was launched (so caller can exit when it exits), or null. */
function launchTauriGui(
  tauriBin: string,
  serverUrl: string,
  verbose: boolean | undefined
): ReturnType<typeof spawn> | null {
  // On Linux, Tauri (GTK) aborts with SIGABRT if no display server is available.
  // Skip the native GUI and fall back to the browser when DISPLAY/WAYLAND_DISPLAY are unset.
  if (process.platform === 'linux' && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY) {
    if (verbose) {
      console.log('  No DISPLAY or WAYLAND_DISPLAY set — skipping Tauri GUI');
    }
    return null;
  }

  try {
    // Linux: WEBKIT_DISABLE_COMPOSITING_MODE=1 fixes blank screen with some WMs (bspwm, i3, etc.)
    const spawnEnv =
      process.platform === 'linux'
        ? { ...process.env, WEBKIT_DISABLE_COMPOSITING_MODE: '1' }
        : { ...process.env };
    // Do NOT use detached: true — keep Tauri as child so when user quits Tauri, we can exit Node
    // and avoid leaving the GUI server running in the background.
    const child = spawn(tauriBin, ['--server-url', serverUrl], {
      stdio: 'ignore',
      windowsHide: true,
      env: spawnEnv,
    });
    if (verbose) {
      console.log(`  Launched Tauri GUI: ${tauriBin} --server-url ${serverUrl}`);
    }
    return child;
  } catch (error) {
    console.warn('  Could not launch Tauri GUI, falling back to browser.');
    if (verbose) {
      console.warn(`  Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    return null;
  }
}

/**
 * Main action function for the GUI command
 */
export async function guiAction(options: GuiOptions): Promise<void> {
  // When launched from the desktop, process.stdout/stderr can be destroyed and any write
  // (e.g. from Copilot SDK / vscode-jsonrpc) throws ERR_STREAM_DESTROYED. process.stdout
  // and process.stderr are read-only in Node, so wrap their write methods to no-op on that error.
  wrapStreamWriteToIgnoreDestroyed(process.stdout as NodeJS.WriteStream & { write: NodeJS.WriteStream['write'] });
  wrapStreamWriteToIgnoreDestroyed(process.stderr as NodeJS.WriteStream & { write: NodeJS.WriteStream['write'] });

  // When running without TTY (desktop shortcut, app menu), install crash handlers for diagnostics
  const enableCrashLogging = shouldEnableCrashLogging();
  if (enableCrashLogging) {
    installCrashHandlers();
    const crashPath = getCrashLogPath();
    if (crashPath) {
      try {
        const logDir = path.dirname(crashPath);
        mkdirSync(logDir, { recursive: true });
        const startMsg = `[${new Date().toISOString()}] Puppet Master GUI starting (no terminal). If nothing opens, open http://127.0.0.1:${options.port ?? 3847} in your browser or check this log for errors.\n`;
        appendFileSync(crashPath, startMsg, 'utf8');
      } catch {
        // ignore
      }
    }
  }

  // Auth token path: use $HOME when from app bundle (macOS) or when crash logging enabled
  const isAppBundle = process.platform === 'darwin' && !!process.env.PUPPET_MASTER_APP_ROOT;

  try {
    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();
    const configPath = configManager.getConfigPath();
    const projectRoot = deriveProjectRootFromConfigPath(configPath);

    if (options.verbose) {
      console.log('Configuration loaded successfully');
      console.log(`Project: ${config.project.name}`);
      console.log(`Working directory: ${config.project.workingDirectory}`);
    }

    // Determine port and host
    const requestedPort = options.port || 3847;
    const host = options.host || 'localhost';

    // C4 fix: Before starting a new server, check if an existing Puppet Master
    // instance is already running on the requested port. If so, just open the
    // GUI to that instance and exit (avoids "bounces then disappears" on relaunch).
    if (options.verbose) {
      console.log(`Checking if port ${requestedPort} is available...`);
    }
    let port = requestedPort;
    let portAvailable = await checkPortAvailable(port, host);

    if (!portAvailable) {
      // Port is in use -- check if it's an existing Puppet Master instance
      const existingUrl = await checkExistingInstance(port, host);
      if (existingUrl) {
        console.log(`Puppet Master is already running at ${existingUrl}`);
        console.log('Opening existing instance...');

        const skipOpen = process.env.PUPPET_MASTER_NO_OPEN === '1' || process.env.PUPPET_MASTER_NO_OPEN === 'true';
        if (options.open !== false && !skipOpen) {
          const installRoot = resolveInstallRoot();
          const tauriBin = resolveTauriGuiBinary(installRoot);
          const launched = tauriBin ? launchTauriGui(tauriBin, existingUrl, options.verbose) : false;
          if (!launched) {
            try {
              await open(existingUrl);
            } catch {
              console.log(`  Open this URL in your browser: ${existingUrl}`);
            }
          }
        }
        // Exit cleanly -- the existing server is already handling requests
        process.exit(0);
      }
    }

    if (!portAvailable && !options.port) {
      // Only auto-retry if the user didn't explicitly choose a port
      const maxRetries = 10;
      for (let i = 1; i <= maxRetries && !portAvailable; i++) {
        port = requestedPort + i;
        portAvailable = await checkPortAvailable(port, host);
      }
      if (portAvailable) {
        console.log(`Default port ${requestedPort} is in use, using port ${port} instead.`);
      }
    }
    if (!portAvailable) {
      console.error(`Error: Port ${port} on ${host} is already in use.`);
      console.error(`Please choose a different port using --port <number>`);
      process.exit(1);
    }

    // Create EventBus
    const eventBus = new EventBus();

    // Create dependency injection container
    const container = createContainer(config, projectRoot, configPath);

    // When running from .app bundle or without TTY (desktop launch), use writable auth token path
    const useHomeForAuth = isAppBundle || enableCrashLogging;
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    const authTokenPath = useHomeForAuth && homeDir
      ? path.join(homeDir, '.puppet-master', 'gui-token.txt')
      : undefined; // server default: .puppet-master/gui-token.txt relative to cwd

    // Create GUI server
    const guiConfig = {
      port,
      host,
      baseDirectory: projectRoot,
      // P0-G07: Support --no-auth and --relaxed-cors flags
      authEnabled: options.auth !== false,
      corsRelaxed: options.relaxedCors === true,
      useReactGui: options.classic !== true,
      // Reverse proxy support
      trustProxy: options.trustProxy === true,
      // CORS allowed origins (parse from comma-separated string)
      ...(options.allowedOrigins && { 
        allowedOrigins: options.allowedOrigins.split(',').map(o => o.trim()) 
      }),
      // Token exposure (security-sensitive option)
      exposeTokenRemotely: options.exposeTokenRemotely === true,
      ...(authTokenPath !== undefined && { authTokenPath }),
    };
    const guiServer = new GuiServer(guiConfig, eventBus);

    // Register state dependencies
    const tierManager = container.resolve<TierStateManager>('tierStateManager');
    const orchestrator = new OrchestratorStateMachine();
    const progressManager = container.resolve<ProgressManager>('progressManager');
    const agentsManager = container.resolve<AgentsManager>('agentsManager');

    guiServer.registerStateDependencies(
      tierManager,
      orchestrator,
      progressManager,
      agentsManager
    );

    // Create Orchestrator instance for controls
    const orchestratorInstance = new Orchestrator({
      config,
      projectPath: projectRoot,
      eventBus, // Pass EventBus for real-time updates
    });

    // Initialize platform registry with runners if needed
    const platformRegistry = container.resolve<PlatformRegistry>('platformRegistry');
    if (platformRegistry.getAvailable().length === 0) {
      const defaultRegistry = PlatformRegistry.createDefault(config, projectRoot);
      // Copy runners from default registry
      for (const p of defaultRegistry.getAvailable()) {
        const runner = defaultRegistry.get(p);
        if (runner) {
          platformRegistry.register(p, runner);
        }
      }
    }

    // Create platform router
    const platformRouter = new PlatformRouter(config, platformRegistry);

    // Initialize orchestrator with dependencies from container
    await orchestratorInstance.initialize({
      configManager: container.resolve('configManager'),
      prdManager: container.resolve('prdManager'),
      progressManager: container.resolve('progressManager'),
      agentsManager: container.resolve('agentsManager'),
      evidenceStore: container.resolve('evidenceStore'),
      usageTracker: container.resolve('usageTracker'),
      gitManager: container.resolve('gitManager'),
      branchStrategy: container.resolve('branchStrategy'),
      commitFormatter: container.resolve('commitFormatter'),
      prManager: container.resolve('prManager'),
      platformRegistry,
      platformRouter,
      verificationIntegration: container.resolve('verificationIntegration'),
      // Memory auto-promotion dependencies
      promotionEngine: container.resolve('promotionEngine'),
      multiLevelLoader: container.resolve('multiLevelLoader'),
    });

    // Register orchestrator instance (this will now use orchestrator's TierStateManager)
    guiServer.registerOrchestratorInstance(orchestratorInstance);

    if (options.verbose) {
      console.log('Orchestrator instance registered with GUI server');
    }

    // Register start chain dependencies for wizard routes
    const usageTracker = container.resolve<UsageTracker>('usageTracker');
    const quotaManager = new QuotaManager(usageTracker, config.budgets, config.budgetEnforcement);
    
    guiServer.registerStartChainDependencies(
      config,
      platformRegistry,
      quotaManager,
      usageTracker
    );

    if (options.verbose) {
      console.log('Start chain dependencies registered with GUI server');
    }

    // Create and register SessionTracker for history tracking
    const sessionTracker = new SessionTracker(eventBus, projectRoot);
    sessionTracker.start();
    guiServer.registerSessionTracker(sessionTracker);

    if (options.verbose) {
      console.log('SessionTracker registered with GUI server');
    }

    // P0-G07: Initialize authentication before starting server
    const token = await guiServer.initializeAuth();
    if (token) {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║                    Authentication Enabled                  ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`  Token file: .puppet-master/gui-token.txt`);
      console.log(`  Include this header in API requests:`);
      console.log(`    Authorization: Bearer ${token}`);
      console.log('');
      
      // Warn if token exposure is enabled remotely
      if (options.exposeTokenRemotely) {
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║       ⚠️  SECURITY WARNING: Token Exposed Remotely       ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('  WARNING: Auth token is exposed to non-loopback requests!');
        console.log('  /api/auth/status will return the token to ANY client.');
        console.log('  This is a SECURITY RISK unless behind a trusted reverse proxy.');
        console.log('');
      }
    } else if (options.auth === false) {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║              ⚠️  Authentication DISABLED                   ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('  WARNING: Running without authentication (--no-auth flag)');
      console.log('  This should only be used for local development!');
      console.log('');
    }
    
    if (options.trustProxy) {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║           ℹ️  Trust Proxy Enabled                         ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('  INFO: Trusting X-Forwarded-* headers from proxy');
      console.log('  Make sure your reverse proxy is configured correctly!');
      console.log('');
    }
    
    if (options.relaxedCors) {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║              ⚠️  CORS Policy RELAXED                      ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('');
      console.log('  WARNING: CORS policy relaxed (--relaxed-cors flag)');
      console.log('  Allows dev ports (3000-9999) and LAN IPs');
      console.log('  This should only be used for local development!');
      console.log('');
    }

    // Setup signal handlers for graceful shutdown
    setupSignalHandlers(guiServer, orchestratorInstance);

    // Start GUI server
    console.log('Starting GUI server...');
    await guiServer.start();

    const url = guiServer.getUrl();
    const localUrl = `http://127.0.0.1:${port}`;
    const uiUrl = host === 'localhost' || host === '127.0.0.1' || host === '::1' ? url : localUrl;

    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║         RWM Puppet Master GUI Server Started             ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');
    if (options.classic) {
      console.log(`  🌐 Dashboard:     ${url} (Vanilla HTML mode)`);
      console.log(`  📁 Projects:      ${url}/projects`);
      console.log(`  🧙 Wizard:        ${url}/wizard`);
      console.log(`  ⚙️  Configuration: ${url}/config`);
      console.log(`  🏥 Doctor:        ${url}/doctor`);
      console.log(`  💡 Tip: Remove --classic flag to use React GUI`);
    } else {
      console.log(`  🌐 React GUI:     ${url} (React SPA mode)`);
      console.log(`  📝 Note: React GUI requires 'npm run gui:build' to be run first`);
    }
    if (uiUrl !== url) {
      console.log(`  🖥️  Local UI:      ${uiUrl} (for desktop apps / local browser)`);
    }
    console.log('');

    // C3 fix: Verify the server is actually responding before launching Tauri/browser.
    // Even though await guiServer.start() resolved, on macOS the listen callback can fire
    // before the server is fully ready to handle HTTP requests. This prevents a blank page.
    const serverReady = await waitForServerReady(port);
    if (!serverReady) {
      console.warn('  Warning: Server may not be fully ready. Launching GUI anyway.');
    } else if (options.verbose) {
      console.log('  Server readiness confirmed via /health endpoint');
    }

    // Launch desktop GUI if enabled (default: true, unless --no-open or PUPPET_MASTER_NO_OPEN)
    const skipOpen = process.env.PUPPET_MASTER_NO_OPEN === '1' || process.env.PUPPET_MASTER_NO_OPEN === 'true';
    if (options.open !== false && !skipOpen) {
      const installRoot = resolveInstallRoot();
      const tauriBin = resolveTauriGuiBinary(installRoot);

      const tauriChild = tauriBin ? launchTauriGui(tauriBin, uiUrl, options.verbose) : null;
      const launched = tauriChild !== null;

      // When user quits Tauri, exit this Node process so the server does not keep running in the background.
      if (tauriChild) {
        tauriChild.on('exit', (code, signal) => {
          const reason = signal ? `Tauri exited (${signal})` : `Tauri exited (code ${code})`;
          console.log(`\n${reason}, shutting down server...`);
          shutdownServer(guiServer, orchestratorInstance).catch((err) => {
            console.error('Shutdown error:', err);
            process.exit(1);
          });
        });
        tauriChild.on('error', (err) => {
          console.warn('Tauri process error:', err.message);
        });
      }

      if (!launched) {
        try {
          await open(uiUrl);
          if (options.verbose) {
            console.log(`  Browser opened to ${uiUrl}`);
          }
        } catch (error) {
          // Log warning but don't fail - browser opening is optional
          console.warn('  Could not open browser automatically. Please open manually.');
          if (options.verbose) {
            console.warn(`  Error: ${error instanceof Error ? error.message : String(error)}`);
          }
          // When no TTY, write URL to crash log so user knows what to open
          if (enableCrashLogging) {
            const crashPath = getCrashLogPath();
            if (crashPath) {
              try {
                appendFileSync(
                  crashPath,
                  `[${new Date().toISOString()}] GUI server is running. Open this URL in your browser: ${uiUrl}\n`,
                  'utf8'
                );
              } catch {
                // ignore
              }
            }
          }
        }
      }
    }

    console.log('  Press Ctrl+C to stop the server');
    console.log('');

    // Keep process alive
    await new Promise(() => {
      // Intentionally empty - wait forever until signal
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error starting GUI server:', errorMessage);
    if (options.verbose) {
      console.error(error);
    }
    if (enableCrashLogging) {
      writeToCrashLog(error);
      const crashPath = getCrashLogPath();
      if (crashPath) {
        try {
          const port = options.port ?? 3847;
          appendFileSync(
            crashPath,
            `[${new Date().toISOString()}] If the server is already running, open http://127.0.0.1:${port} in your browser.\n`,
            'utf8'
          );
        } catch {
          // ignore
        }
      }
    }
    process.exit(1);
  }
}

/**
 * Stop server and orchestrator, then exit. Used by signal handlers and when Tauri exits.
 */
async function shutdownServer(
  guiServer: GuiServer,
  orchestrator: Orchestrator
): Promise<void> {
  try {
    if (orchestrator && typeof orchestrator.stop === 'function') {
      await orchestrator.stop();
    }
    await guiServer.stop();
    console.log('Shutdown complete');
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error during shutdown:', errorMessage);
    process.exit(1);
  }
}

/**
 * Setup signal handlers for graceful shutdown
 */
function setupSignalHandlers(guiServer: GuiServer, orchestrator: Orchestrator): void {
  const onSignal = (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    shutdownServer(guiServer, orchestrator).catch((err) => {
      console.error('Shutdown error:', err);
      process.exit(1);
    });
  };

  process.on('SIGINT', () => onSignal('SIGINT'));
  process.on('SIGTERM', () => onSignal('SIGTERM'));
}

/**
 * GuiCommand class implementing CommandModule interface
 */
export class GuiCommand implements CommandModule {
  /**
   * Register the gui command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('gui')
      .description('Launch the GUI server and open the desktop GUI (Tauri if available; falls back to browser)')
      .option('-c, --config <path>', 'Path to config file')
      .option('-p, --port <number>', 'Port to listen on (default: 3847)', (value) => parseInt(value, 10))
      .option('-h, --host <host>', 'Host to bind to (default: localhost)', 'localhost')
      .option('--no-open', 'Prevent browser from opening automatically')
      .option('-v, --verbose', 'Enable verbose output')
      .option('--no-auth', 'Disable authentication (development only - NOT recommended for production)')
      .option('--relaxed-cors', 'Relax CORS policy for development (allows dev ports 3000-9999 and LAN IPs)')
      .option('--classic', 'Use classic vanilla HTML GUI instead of React')
      .option('--trust-proxy', 'Trust proxy headers (X-Forwarded-For, etc.) for reverse proxy setups')
      .option('--allowed-origins <origins>', 'Comma-separated list of allowed CORS origins (e.g., "https://app.example.com,https://mobile.example.com")')
      .option('--expose-token-remotely', 'Allow /api/auth/status to expose token for non-loopback requests (security risk - use with caution)')
      .action(async (options: GuiOptions) => {
        // Handle --no-open flag (Commander.js sets open to false when --no-open is used)
        if (options.open === undefined) {
          options.open = true; // Default to true if not explicitly set
        }
        await guiAction(options);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const guiCommand = new GuiCommand();
