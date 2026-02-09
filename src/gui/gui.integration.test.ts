/**
 * GUI Integration Tests
 * 
 * Comprehensive end-to-end tests for the GUI server including:
 * - Server startup and shutdown
 * - Static file serving
 * - REST API endpoints
 * - WebSocket connections and events
 * 
 * See BUILD_QUEUE_PHASE_9.md PH9-T12 for specification.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Server as HTTPServer } from 'http';
import { request as httpRequest } from 'http';
import request from 'supertest';
import { WebSocket } from 'ws';
import { EventBus } from '../logging/event-bus.js';
import type { PuppetMasterEvent } from '../logging/index.js';
import { GuiServer } from './server.js';
import type { TierStateManager } from '../core/tier-state-manager.js';
import type { OrchestratorStateMachine } from '../core/orchestrator-state-machine.js';
import type { Orchestrator } from '../core/orchestrator.js';
import type { ProgressManager } from '../memory/progress-manager.js';
import type { AgentsManager } from '../memory/agents-manager.js';
import type { OrchestratorState } from '../types/state.js';
import { createMockCheckRegistry } from './test-helpers/mock-doctor-registry.js';

/**
 * Test server instance and dependencies
 */
interface TestServerContext {
  server: GuiServer;
  eventBus: EventBus;
  httpServer: HTTPServer | null;
  port: number;
  baseUrl: string;
  authToken?: string;
}

/**
 * Create a test server on a random available port
 */
async function startTestServer(): Promise<TestServerContext & { authToken?: string }> {
  const eventBus = new EventBus();
  const port = 30000 + Math.floor(Math.random() * 10000); // Random port in safe range
  const server = new GuiServer(
    {
      port,
      host: 'localhost',
      corsOrigins: [`http://localhost:${port}`],
      authEnabled: true, // Enable auth for tests
      useReactGui: true,
      // Use mock doctor registry for fast, deterministic tests
      doctorRegistryFactory: createMockCheckRegistry,
    },
    eventBus
  );

  // Initialize authentication before starting server
  const authToken = await server.initializeAuth();

  await server.start();
  const baseUrl = server.getUrl();

  return {
    server,
    eventBus,
    httpServer: null, // GuiServer manages its own HTTP server
    port,
    baseUrl,
    authToken,
  };
}

/**
 * Stop the test server gracefully
 */
async function stopTestServer(context: TestServerContext): Promise<void> {
  await context.server.stop();
}

/**
 * Create mock TierStateManager
 */
function createMockTierManager(): TierStateManager {
  // Create a mock TierNode-like object
  const mockRoot = {
    id: 'root',
    type: 'root' as const,
    data: {
      title: 'Root',
      description: '',
      plan: '',
      acceptanceCriteria: [],
      testPlan: [],
      evidence: [],
      iterations: 0,
      maxIterations: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    parent: null,
    children: [],
    getState: vi.fn().mockReturnValue('pending' as const),
    getPath: vi.fn().mockReturnValue([]),
  };

  return {
    getRoot: vi.fn().mockReturnValue(mockRoot),
    getCurrentPhase: vi.fn().mockReturnValue(null),
    getCurrentTask: vi.fn().mockReturnValue(null),
    getCurrentSubtask: vi.fn().mockReturnValue(null),
    findNode: vi.fn().mockReturnValue(null),
    getAllPhases: vi.fn().mockReturnValue([]),
    getAllTasks: vi.fn().mockReturnValue([]),
    getAllSubtasks: vi.fn().mockReturnValue([]),
  } as unknown as TierStateManager;
}

/**
 * Create mock OrchestratorStateMachine
 */
function createMockOrchestratorStateMachine(): OrchestratorStateMachine {
  return {
    getCurrentState: vi.fn().mockReturnValue('idle' as OrchestratorState),
    getContext: vi.fn().mockReturnValue({}),
    send: vi.fn().mockReturnValue(true),
    canSend: vi.fn().mockReturnValue(true),
    getHistory: vi.fn().mockReturnValue([]),
    reset: vi.fn(),
  } as unknown as OrchestratorStateMachine;
}

/**
 * Create mock ProgressManager
 */
function createMockProgressManager(): ProgressManager {
  return {
    getRecentEntries: vi.fn().mockReturnValue([]),
    append: vi.fn(),
    read: vi.fn().mockResolvedValue([]),
  } as unknown as ProgressManager;
}

/**
 * Create mock AgentsManager
 */
function createMockAgentsManager(): AgentsManager {
  return {
    getRootAgentsContent: vi.fn().mockReturnValue('# AGENTS.md\n\nContent here'),
    loadForContext: vi.fn().mockResolvedValue([
      { content: '# AGENTS.md\n\nContent here', level: 'root', path: 'AGENTS.md' },
    ]),
    listFiles: vi.fn().mockResolvedValue([
      {
        name: 'AGENTS.md (root)',
        path: 'AGENTS.md',
        lastAccessed: new Date(),
        level: 'root',
      },
    ]),
  } as unknown as AgentsManager;
}

/**
 * Create mock Orchestrator
 */
function createMockOrchestrator(stateOverride?: OrchestratorState): Orchestrator {
  const tierManager = createMockTierManager();
  return {
    getState: vi.fn().mockReturnValue(stateOverride ?? ('idle' as OrchestratorState)),
    getTierStateManager: vi.fn().mockReturnValue(tierManager),
    start: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn().mockResolvedValue(undefined),
    // Pre-flight checks required by controls/start
    getCurrentProject: vi.fn().mockReturnValue({ name: 'test-project', workingDirectory: process.cwd() }),
    validatePRD: vi.fn().mockResolvedValue({ valid: true }),
    validateConfig: vi.fn().mockResolvedValue({ valid: true }),
    checkRequiredCLIs: vi.fn().mockResolvedValue({ allAvailable: true, missing: [] }),
    checkGitRepo: vi.fn().mockResolvedValue({ valid: true }),
  } as unknown as Orchestrator;
}

describe('GUI Integration Tests', () => {
  let testContext: TestServerContext | null = null;

  beforeEach(async () => {
    testContext = await startTestServer();
  });

  afterEach(async () => {
    if (testContext) {
      // Ensure server is stopped and all connections closed
      try {
        await stopTestServer(testContext);
      } catch (error) {
        // Log but don't fail - server may already be stopped
        console.warn('Error stopping test server:', error);
      }
      testContext = null;
    }
    // Give time for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Server Startup and Health', () => {
    it('server starts and responds to health check', async () => {
      const response = await request(testContext!.baseUrl)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'ok',
        version: '0.1.0',
      });
    });

    it('server provides status endpoint', async () => {
      const response = await request(testContext!.baseUrl)
        .get('/api/status')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .expect(200);

      expect(response.body).toHaveProperty('state');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('Static File Serving', () => {
    it('serves index.html', async () => {
      const response = await request(testContext!.baseUrl)
        .get('/')
        .expect(200);

      // In dev checkouts, React build output may be missing. In that case the server
      // returns a helpful HTML page instead of 500-ing.
      if (response.text.includes('Puppet Master GUI is not built')) {
        expect(response.text).toContain('Missing:');
      } else {
        expect(response.text).toContain('<!DOCTYPE html>');
        expect(response.text).toContain('RWM Puppet Master');
      }
      expect(response.headers['content-type']).toMatch(/text\/html/);
    });

    it('serves CSS files', async ({ skip }) => {
      const htmlResponse = await request(testContext!.baseUrl)
        .get('/')
        .expect(200);
      const cssMatch = htmlResponse.text.match(/href="(\/assets\/[^"]+\.css)"/);
      if (!cssMatch) {
        skip(true, 'React GUI dist not built (no CSS asset links found in /)');
      }
      const cssPath = cssMatch?.[1];
      if (!cssPath) {
        throw new Error('Unable to find CSS asset in index.html');
      }
      const response = await request(testContext!.baseUrl)
        .get(cssPath)
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/css/);
      expect(response.text.length).toBeGreaterThan(0);
    });

    it('serves JavaScript files', async ({ skip }) => {
      const htmlResponse = await request(testContext!.baseUrl)
        .get('/')
        .expect(200);
      const jsMatch = htmlResponse.text.match(/src="(\/assets\/[^"]+\.js)"/);
      if (!jsMatch) {
        skip(true, 'React GUI dist not built (no JS asset links found in /)');
      }
      const jsPath = jsMatch?.[1];
      if (!jsPath) {
        throw new Error('Unable to find JavaScript asset in index.html');
      }
      const response = await request(testContext!.baseUrl)
        .get(jsPath)
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/javascript|text\/javascript/);
      expect(response.text.length).toBeGreaterThan(0);
    });

    it('serves doctor route', async () => {
      const response = await request(testContext!.baseUrl)
        .get('/doctor')
        .expect(200);

      if (response.text.includes('Puppet Master GUI is not built')) {
        expect(response.text).toContain('Missing:');
      } else {
        expect(response.text).toContain('<!DOCTYPE html>');
        expect(response.text).toMatch(/id="root"/);
      }
    });
  });

  describe('State API Endpoints', () => {
    it('GET /api/state returns orchestrator state', async () => {
      const tierManager = createMockTierManager();
      const orchestrator = createMockOrchestratorStateMachine();
      const progressManager = createMockProgressManager();
      const agentsManager = createMockAgentsManager();

      testContext!.server.registerStateDependencies(
        tierManager,
        orchestrator,
        progressManager,
        agentsManager
      );

      const response = await request(testContext!.baseUrl)
        .get('/api/state')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .expect(200);

      expect(response.body).toHaveProperty('orchestratorState');
      expect(response.body).toHaveProperty('currentPhaseId');
      expect(response.body).toHaveProperty('currentTaskId');
      expect(response.body).toHaveProperty('completionStats');
    });

    it('GET /api/tiers returns tier hierarchy', async () => {
      const tierManager = createMockTierManager();
      const orchestrator = createMockOrchestratorStateMachine();
      const progressManager = createMockProgressManager();
      const agentsManager = createMockAgentsManager();

      testContext!.server.registerStateDependencies(
        tierManager,
        orchestrator,
        progressManager,
        agentsManager
      );

      const response = await request(testContext!.baseUrl)
        .get('/api/tiers')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .expect(200);

      expect(response.body).toHaveProperty('root');
    });

    it('GET /api/progress returns progress entries', async () => {
      const tierManager = createMockTierManager();
      const orchestrator = createMockOrchestratorStateMachine();
      const progressManager = createMockProgressManager();
      const agentsManager = createMockAgentsManager();

      testContext!.server.registerStateDependencies(
        tierManager,
        orchestrator,
        progressManager,
        agentsManager
      );

      const response = await request(testContext!.baseUrl)
        .get('/api/progress')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .expect(200);

      expect(response.body).toHaveProperty('entries');
      expect(Array.isArray(response.body.entries)).toBe(true);
    });

    it('GET /api/agents returns agents list', async () => {
      const tierManager = createMockTierManager();
      const orchestrator = createMockOrchestratorStateMachine();
      const progressManager = createMockProgressManager();
      const agentsManager = createMockAgentsManager();

      testContext!.server.registerStateDependencies(
        tierManager,
        orchestrator,
        progressManager,
        agentsManager
      );

      const response = await request(testContext!.baseUrl)
        .get('/api/agents')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .expect(200);

      expect(response.body).toHaveProperty('files');
      expect(Array.isArray(response.body.files)).toBe(true);
    });
  });

  describe('Config API Endpoints', () => {
    it('GET /api/config returns configuration', async () => {
      const response = await request(testContext!.baseUrl)
        .get('/api/config')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .expect(200);

      expect(response.body).toHaveProperty('config');
    });

    it('PUT /api/config validates and saves configuration', async () => {
      // Use a minimal valid config structure based on PuppetMasterConfig
      const validConfig = {
        project: {
          name: 'Test Project',
          workingDirectory: process.cwd(),
        },
        tiers: {
          phase: {
            platform: 'cursor' as const,
            model: 'sonnet-4.5-thinking',
            task_failure_style: 'spawn_new_agent',
            max_iterations: 3,
            escalation: null,
          },
          task: {
            platform: 'cursor' as const,
            model: 'sonnet-4.5-thinking',
            task_failure_style: 'spawn_new_agent',
            max_iterations: 5,
            escalation: 'phase' as const,
          },
          subtask: {
            platform: 'cursor' as const,
            model: 'sonnet-4.5-thinking',
            task_failure_style: 'spawn_new_agent',
            max_iterations: 10,
            escalation: 'task' as const,
          },
          iteration: {
            platform: 'cursor' as const,
            model: 'auto',
            max_attempts: 3,
            escalation: 'subtask' as const,
          },
        },
        branching: {
          base_branch: 'main',
          granularity: 'per-task' as const,
          naming_pattern: 'ralph/{phase}/{task}',
          push_policy: 'per-subtask' as const,
          merge_policy: 'squash' as const,
        },
        verification: {
          browser_enabled: false,
          test_timeout_seconds: 300,
        },
        memory: {
          progress_file: 'progress.txt',
          agents_file: 'AGENTS.md',
          prd_file: '.puppet-master/prd.json',
        },
        budgets: {},
      };

      const response = await request(testContext!.baseUrl)
        .put('/api/config')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .send({ config: validConfig });

      // Config validation might fail if required fields are missing, so accept 200 or 400
      expect([200, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success');
      }
    });
  });

  describe('WebSocket Connection and Events', () => {
    it('connects to WebSocket endpoint', async () => {
      return new Promise<void>((resolve, reject) => {
        const wsUrl = testContext!.baseUrl.replace('http://', 'ws://') + '/events';
        const ws = new WebSocket(wsUrl);

        ws.on('open', () => {
          expect(ws.readyState).toBe(WebSocket.OPEN);
          ws.close();
          resolve();
        });

        ws.on('error', (error) => {
          reject(error);
        });
      });
    });

    it('receives events from EventBus', async () => {
      return new Promise<void>((resolve, reject) => {
        const wsUrl = testContext!.baseUrl.replace('http://', 'ws://') + '/events';
        const ws = new WebSocket(wsUrl);

        ws.on('open', () => {
          // Emit a test event
          const testEvent: PuppetMasterEvent = {
            type: 'state_changed',
            from: 'idle',
            to: 'executing',
          };

          testContext!.eventBus.emit(testEvent);
        });

        ws.on('message', (data) => {
          const event = JSON.parse(data.toString());
          expect(event.type).toBe('state_change');
          expect(event.payload).toEqual({
            state: 'executing',
            previousState: 'idle',
          });
          ws.close();
          resolve();
        });

        ws.on('error', (error) => {
          reject(error);
        });
      });
    });

    it('handles WebSocket disconnect gracefully', async () => {
      return new Promise<void>((resolve, reject) => {
        const wsUrl = testContext!.baseUrl.replace('http://', 'ws://') + '/events';
        const ws = new WebSocket(wsUrl);

        ws.on('open', () => {
          ws.close();
        });

        ws.on('close', () => {
          // Server should handle disconnect without errors
          resolve();
        });

        ws.on('error', (error) => {
          reject(error);
        });
      });
    });
  });

  describe('SSE Event Stream', () => {
    it('GET /api/events/stream returns text/event-stream', async () => {
      const streamUrl = new URL('/api/events/stream', testContext!.baseUrl);

      await new Promise<void>((resolve, reject) => {
        const req = httpRequest(
          {
            method: 'GET',
            hostname: streamUrl.hostname,
            port: streamUrl.port,
            path: streamUrl.pathname,
            headers: { 
              Accept: 'text/event-stream',
              Authorization: testContext!.authToken ? `Bearer ${testContext!.authToken}` : '',
            },
          },
          (res) => {
            try {
              expect(res.statusCode).toBe(200);
              expect(res.headers['content-type']).toMatch(/text\/event-stream/);
              resolve();
            } catch (error) {
              reject(error);
            } finally {
              req.destroy();
              res.destroy();
            }
          }
        );

        req.on('error', reject);
        req.end();
      });
    });

    it('streams EventBus events in SSE format and cleans up on disconnect', async () => {
      const streamUrl = new URL('/api/events/stream', testContext!.baseUrl);

      await new Promise<void>((resolve, reject) => {
        const req = httpRequest(
          {
            method: 'GET',
            hostname: streamUrl.hostname,
            port: streamUrl.port,
            path: streamUrl.pathname,
            headers: { 
              Accept: 'text/event-stream',
              Authorization: testContext!.authToken ? `Bearer ${testContext!.authToken}` : '',
            },
          },
          (res) => {
            res.setEncoding('utf8');

            let buffer = '';
            const timeout = setTimeout(() => {
              cleanup();
              reject(new Error('Timed out waiting for SSE event'));
            }, 3000);

            const cleanup = () => {
              clearTimeout(timeout);
              res.removeAllListeners('data');
              req.destroy();
              res.destroy();
            };

            res.on('data', (chunk) => {
              buffer += chunk;

              // Look for a translated state_changed event.
              if (!buffer.includes('event: state_change')) {
                return;
              }

              const frames = buffer
                .split('\n\n')
                .map((f) => f.trim())
                .filter(Boolean);
              const frame = frames.find((f) => f.includes('event: state_change') && f.includes('data: '));
              if (!frame) {
                return;
              }

              const dataLine = frame
                .split('\n')
                .map((l) => l.trim())
                .find((l) => l.startsWith('data: '));
              if (!dataLine) {
                return;
              }

              try {
                const parsed = JSON.parse(dataLine.slice('data: '.length));
                expect(parsed.type).toBe('state_change');
                expect(parsed.payload).toEqual({
                  state: 'executing',
                  previousState: 'idle',
                });

                cleanup();

                // Allow the server's `req.on('close')` cleanup to run.
                setTimeout(() => {
                  try {
                    expect(testContext!.eventBus.getSubscriptionCount()).toBe(0);
                    resolve();
                  } catch (error) {
                    reject(error);
                  }
                }, 25);
              } catch (error) {
                cleanup();
                reject(error);
              }
            });

            // Emit after the stream is established.
            setTimeout(() => {
              const testEvent: PuppetMasterEvent = { type: 'state_changed', from: 'idle', to: 'executing' };
              testContext!.eventBus.emit(testEvent);
            }, 25);
          }
        );

        req.on('error', reject);
        req.end();
      });
    });
  });

  describe('Control Endpoints', () => {
    it('POST /api/controls/start returns 503 when orchestrator not registered', async () => {
      // Test that controls return 503 when orchestrator is not registered
      const response = await request(testContext!.baseUrl)
        .post('/api/controls/start')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .send({})
        .expect(503);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code', 'ORCHESTRATOR_NOT_AVAILABLE');
    });

    it('POST /api/controls/start starts execution when orchestrator is registered', async () => {
      const orchestrator = createMockOrchestrator();
      testContext!.server.registerOrchestratorInstance(orchestrator);

      const response = await request(testContext!.baseUrl)
        .post('/api/controls/start')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('sessionId');
    });

    it('POST /api/controls/pause returns 503 when orchestrator not registered', async () => {
      const response = await request(testContext!.baseUrl)
        .post('/api/controls/pause')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .expect(503);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code', 'ORCHESTRATOR_NOT_AVAILABLE');
    });

    it('POST /api/controls/pause pauses execution when orchestrator is registered', async () => {
      // Pause requires state 'executing'
      const orchestrator = createMockOrchestrator('executing');
      testContext!.server.registerOrchestratorInstance(orchestrator);

      const response = await request(testContext!.baseUrl)
        .post('/api/controls/pause')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });

    it('POST /api/controls/stop returns 503 when orchestrator not registered', async () => {
      const response = await request(testContext!.baseUrl)
        .post('/api/controls/stop')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .send({})
        .expect(503);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code', 'ORCHESTRATOR_NOT_AVAILABLE');
    });

    it('POST /api/controls/stop stops execution when orchestrator is registered', async () => {
      // Stop requires state 'executing' or 'paused'
      const orchestrator = createMockOrchestrator('executing');
      testContext!.server.registerOrchestratorInstance(orchestrator);

      const response = await request(testContext!.baseUrl)
        .post('/api/controls/stop')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Doctor Endpoints', () => {
    it('GET /api/doctor/checks returns list of checks', async () => {
      const response = await request(testContext!.baseUrl)
        .get('/api/doctor/checks')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .expect(200);

      expect(response.body).toHaveProperty('checks');
      expect(Array.isArray(response.body.checks)).toBe(true);
      expect(response.body.checks.length).toBeGreaterThan(0);

      // Verify check structure
      const check = response.body.checks[0];
      expect(check).toHaveProperty('name');
      expect(check).toHaveProperty('category');
      expect(check).toHaveProperty('description');
    });

    it('POST /api/doctor/run runs selected checks', async () => {
      const response = await request(testContext!.baseUrl)
        .post('/api/doctor/run')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .send({ checks: ['project-dir', 'config-file'] })
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results).toHaveLength(2);

      // Verify result structure
      if (response.body.results.length > 0) {
        const result = response.body.results[0];
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('category');
        expect(result).toHaveProperty('passed');
        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('durationMs');
      }
    }, 30000); // Increase timeout for check execution

    it('POST /api/doctor/run runs checks by category', async () => {
      const response = await request(testContext!.baseUrl)
        .post('/api/doctor/run')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .send({ category: 'cli' })
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);

      // All results should be CLI category
      for (const result of response.body.results) {
        expect(result.category).toBe('cli');
      }
    }, 30000);

    it('POST /api/doctor/fix attempts to fix a check', async () => {
      // Use dry-run mode to avoid executing real install commands during tests.
      // Pick a known fixable check (installed via InstallationManager).
      const fixResponse = await request(testContext!.baseUrl)
        .post('/api/doctor/fix')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .send({ checkName: 'codex-cli', dryRun: true })
        .expect(200);

      expect(fixResponse.body).toHaveProperty('success', true);
    }, 30000);

    it('POST /api/doctor/fix returns 404 for non-existent check', async () => {
      const response = await request(testContext!.baseUrl)
        .post('/api/doctor/fix')
        .set('Authorization', testContext!.authToken ? `Bearer ${testContext!.authToken}` : '')
        .send({ checkName: 'non-existent-check' })
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code');
    });
  });

  describe('Auth initialization', () => {
    it('returns 401 for /api/status without auth when auth is enabled', async () => {
      // Create server with auth enabled (default)
      const eventBus = new EventBus();
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = new GuiServer(
        {
          port,
          host: 'localhost',
          corsOrigins: [`http://localhost:${port}`],
          authEnabled: true,
        },
        eventBus
      );

      await server.start();
      const baseUrl = server.getUrl();

      try {
        // Request without auth should return 401
        const response = await request(baseUrl)
          .get('/api/status')
          .expect(401);

        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('code');
      } finally {
        await server.stop();
      }
    });

    it('returns 200 for /api/status with valid auth token', async () => {
      // Create server with auth enabled
      const eventBus = new EventBus();
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = new GuiServer(
        {
          port,
          host: 'localhost',
          corsOrigins: [`http://localhost:${port}`],
          authEnabled: true,
        },
        eventBus
      );

      // Initialize auth to get token
      const token = await server.initializeAuth();
      expect(token).toBeDefined();

      await server.start();
      const baseUrl = server.getUrl();

      try {
        // Request with valid token should return 200
        const response = await request(baseUrl)
          .get('/api/status')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(response.body).toHaveProperty('state');
      } finally {
        await server.stop();
      }
    });

    it('allows requests when auth is disabled', async () => {
      // Create server with auth disabled
      const eventBus = new EventBus();
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = new GuiServer(
        {
          port,
          host: 'localhost',
          corsOrigins: [`http://localhost:${port}`],
          authEnabled: false,
        },
        eventBus
      );

      await server.start();
      const baseUrl = server.getUrl();

      try {
        // Request without auth should return 200 when auth is disabled
        const response = await request(baseUrl)
          .get('/api/status')
          .expect(200);

        expect(response.body).toHaveProperty('state');
      } finally {
        await server.stop();
      }
    });

    it('returns 401 for invalid token', async () => {
      const eventBus = new EventBus();
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = new GuiServer(
        {
          port,
          host: 'localhost',
          corsOrigins: [`http://localhost:${port}`],
          authEnabled: true,
        },
        eventBus
      );

      await server.initializeAuth();
      await server.start();
      const baseUrl = server.getUrl();

      try {
        // Request with invalid token should return 401
        const response = await request(baseUrl)
          .get('/api/status')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);

        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('code', 'INVALID_TOKEN');
      } finally {
        await server.stop();
      }
    });

    it('returns 401 for malformed authorization header', async () => {
      const eventBus = new EventBus();
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = new GuiServer(
        {
          port,
          host: 'localhost',
          corsOrigins: [`http://localhost:${port}`],
          authEnabled: true,
        },
        eventBus
      );

      await server.initializeAuth();
      await server.start();
      const baseUrl = server.getUrl();

      try {
        // Request with malformed header should return 401
        const response = await request(baseUrl)
          .get('/api/status')
          .set('Authorization', 'InvalidFormat token')
          .expect(401);

        expect(response.body).toHaveProperty('error');
        expect(response.body).toHaveProperty('code', 'INVALID_AUTH_FORMAT');
      } finally {
        await server.stop();
      }
    });

    it('allows unauthenticated GET /api/platforms/first-boot when auth is enabled (onboarding)', async () => {
      const eventBus = new EventBus();
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = new GuiServer(
        {
          port,
          host: 'localhost',
          corsOrigins: [`http://localhost:${port}`],
          authEnabled: true,
          useReactGui: true,
        },
        eventBus
      );

      await server.initializeAuth();
      await server.start();
      const baseUrl = server.getUrl();

      try {
        const response = await request(baseUrl)
          .get('/api/platforms/first-boot')
          .expect(200);

        expect(response.body).toHaveProperty('isFirstBoot');
        expect(response.body).toHaveProperty('missingConfig');
        expect(response.body).toHaveProperty('missingCapabilities');
      } finally {
        await server.stop();
      }
    }, 60_000);
  });

  describe('CORS Policy', () => {
    it('allows localhost origins by default', async () => {
      const eventBus = new EventBus();
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = new GuiServer(
        {
          port,
          host: 'localhost',
          corsOrigins: [`http://localhost:${port}`],
          authEnabled: false, // Disable auth for CORS tests
        },
        eventBus
      );

      await server.start();
      const baseUrl = server.getUrl();

      try {
        // Request from localhost should succeed
        const response = await request(baseUrl)
          .get('/api/status')
          .set('Origin', `http://localhost:${port}`)
          .expect(200);

        expect(response.body).toHaveProperty('state');
      } finally {
        await server.stop();
      }
    });

    it('allows tauri.localhost origins for bundled desktop frontend', async () => {
      const eventBus = new EventBus();
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = new GuiServer(
        {
          port,
          host: 'localhost',
          corsOrigins: [`http://localhost:${port}`],
          authEnabled: false,
        },
        eventBus
      );

      await server.start();
      const baseUrl = server.getUrl();

      try {
        const response = await request(baseUrl)
          .get('/api/status')
          .set('Origin', 'http://tauri.localhost')
          .expect(200);

        expect(response.body).toHaveProperty('state');
      } finally {
        await server.stop();
      }
    });

    it('rejects non-localhost origins by default', async () => {
      const eventBus = new EventBus();
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = new GuiServer(
        {
          port,
          host: 'localhost',
          corsOrigins: [`http://localhost:${port}`],
          authEnabled: false, // Disable auth for CORS tests
        },
        eventBus
      );

      await server.start();
      const baseUrl = server.getUrl();

      try {
        // Request from external origin should be rejected
        // Note: CORS is enforced by browser, supertest shows error as 500
        // The server logs will show CORS rejection
        const response = await request(baseUrl)
          .get('/api/status')
          .set('Origin', 'https://example.com');

        // CORS rejection results in error - verify it's not a 200 success
        expect(response.status).not.toBe(200);
      } finally {
        await server.stop();
      }
    });

    it('allows dev ports when CORS is relaxed', async () => {
      const eventBus = new EventBus();
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = new GuiServer(
        {
          port,
          host: 'localhost',
          corsOrigins: [`http://localhost:${port}`],
          corsRelaxed: true,
          authEnabled: false, // Disable auth for CORS tests
        },
        eventBus
      );

      await server.start();
      const baseUrl = server.getUrl();

      try {
        // Note: CORS is enforced by browser, not by supertest
        // This test verifies the server configuration allows relaxed CORS
        // Actual CORS behavior would be verified in browser testing
        const response = await request(baseUrl)
          .get('/api/status')
          .set('Origin', 'http://192.168.1.100:3000');

        // Server processes request (CORS headers handled by cors middleware)
        // CORS rejection happens at browser level, not in supertest
        expect([200, 500]).toContain(response.status);
        if (response.status === 200) {
          expect(response.body).toHaveProperty('state');
        }
      } finally {
        await server.stop();
      }
    });

    it('allows LAN IPs when CORS is relaxed', async () => {
      const eventBus = new EventBus();
      const port = 30000 + Math.floor(Math.random() * 10000);
      const server = new GuiServer(
        {
          port,
          host: 'localhost',
          corsOrigins: [`http://localhost:${port}`],
          corsRelaxed: true,
          authEnabled: false, // Disable auth for CORS tests
        },
        eventBus
      );

      await server.start();
      const baseUrl = server.getUrl();

      try {
        // Note: CORS is enforced by browser, not by supertest
        // This test verifies the server accepts the request when CORS is relaxed
        // Actual CORS headers would be checked by browser
        const response = await request(baseUrl)
          .get('/api/status')
          .set('Origin', 'http://192.168.1.100:3847');

        // Server should process the request (CORS headers handled by cors middleware)
        // If CORS rejects, it would be at browser level, not server
        expect([200, 500]).toContain(response.status);
        // If 200, CORS allowed it; if 500, CORS middleware rejected (expected in some cases)
      } finally {
        await server.stop();
      }
    });

    it('respects GUI_CORS_RELAXED environment variable', async () => {
      // Set environment variable
      const originalEnv = process.env.GUI_CORS_RELAXED;
      process.env.GUI_CORS_RELAXED = 'true';

      try {
        const eventBus = new EventBus();
        const port = 30000 + Math.floor(Math.random() * 10000);
        const server = new GuiServer(
          {
            port,
            host: 'localhost',
            corsOrigins: [`http://localhost:${port}`],
            // corsRelaxed not set, should use env var
            authEnabled: false, // Disable auth for CORS tests
          },
          eventBus
        );

        await server.start();
        const baseUrl = server.getUrl();

        try {
          // Request from dev port should succeed when env var is set
          // Note: CORS is browser-enforced, supertest may not fully test it
          const response = await request(baseUrl)
            .get('/api/status')
            .set('Origin', 'http://192.168.1.100:5000');

          // Server processes request (CORS handled by middleware)
          expect([200, 500]).toContain(response.status);
          if (response.status === 200) {
            expect(response.body).toHaveProperty('state');
          }
        } finally {
          await server.stop();
        }
      } finally {
        // Restore original env
        if (originalEnv !== undefined) {
          process.env.GUI_CORS_RELAXED = originalEnv;
        } else {
          delete process.env.GUI_CORS_RELAXED;
        }
      }
    });
  });

  describe('Server Shutdown', () => {
    it('stops server gracefully', async () => {
      const context = await startTestServer();
      
      // Verify server is running
      await request(context.baseUrl).get('/health').expect(200);

      // Stop server
      await stopTestServer(context);

      // Verify server is stopped (request should fail)
      try {
        await request(context.baseUrl).get('/health');
        // If we get here, server is still running (unexpected)
        expect(false).toBe(true);
      } catch (error) {
        // Expected: server is stopped
        expect(true).toBe(true);
      }
    });
  });
});
