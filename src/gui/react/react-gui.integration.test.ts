/**
 * React GUI Integration Smoke Test
 * 
 * Tests that React GUI API client works against real server endpoints.
 * This prevents situations where React tests pass but real integration fails.
 * 
 * See BUILD_QUEUE_PHASE_11.md PH11-T11 for specification.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { EventBus } from '../../logging/event-bus.js';
import { GuiServer } from '../server.js';
import type { TierStateManager } from '../../core/tier-state-manager.js';
import type { OrchestratorStateMachine } from '../../core/orchestrator-state-machine.js';
import type { ProgressManager, AgentsManager } from '../../memory/index.js';

/**
 * Create mock dependencies for testing
 */
function createMockTierManager(): TierStateManager {
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
    getState: () => 'pending' as const,
    getPath: () => [],
  };

  return {
    getRoot: () => mockRoot,
    getCurrentPhase: () => null,
    getCurrentTask: () => null,
    getCurrentSubtask: () => null,
    findNode: () => null,
    getAllPhases: () => [],
    getAllTasks: () => [],
    getAllSubtasks: () => [],
  } as unknown as TierStateManager;
}

function createMockOrchestratorStateMachine(): OrchestratorStateMachine {
  return {
    getCurrentState: () => 'idle' as const,
    getContext: () => ({}),
    send: () => true,
    canSend: () => true,
    getHistory: () => [],
    reset: () => {},
  } as unknown as OrchestratorStateMachine;
}

function createMockProgressManager(): ProgressManager {
  return {
    getRecentEntries: () => [],
    append: () => {},
    read: async () => [],
  } as unknown as ProgressManager;
}

function createMockAgentsManager(): AgentsManager {
  return {
    getRootAgentsContent: () => '# AGENTS.md\n\nContent here',
    loadForContext: async () => [
      { content: '# AGENTS.md\n\nContent here', level: 'root' as const, path: 'AGENTS.md' },
    ],
  } as unknown as AgentsManager;
}

describe('React GUI Smoke Test', () => {
  let server: GuiServer | null = null;
  let baseUrl: string;
  let authToken: string | undefined;

  beforeEach(async () => {
    const eventBus = new EventBus();
    const port = 30000 + Math.floor(Math.random() * 10000);
    
    server = new GuiServer(
      {
        port,
        host: 'localhost',
        corsOrigins: [`http://localhost:${port}`],
        useReactGui: true, // Enable React GUI mode
        authEnabled: true,
      },
      eventBus
    );

    // Initialize auth
    authToken = await server.initializeAuth();

    // Register state dependencies
    const tierManager = createMockTierManager();
    const orchestrator = createMockOrchestratorStateMachine();
    const progressManager = createMockProgressManager();
    const agentsManager = createMockAgentsManager();

    server.registerStateDependencies(
      tierManager,
      orchestrator,
      progressManager,
      agentsManager
    );

    await server.start();
    baseUrl = server.getUrl();
  });

  afterEach(async () => {
    if (server) {
      // Ensure server is stopped and all connections closed
      try {
        await server.stop();
      } catch (error) {
        // Log but don't fail - server may already be stopped
        console.warn('Error stopping test server:', error);
      }
      server = null;
    }
    // Give time for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Projects API', () => {
    it('GET /api/projects returns { projects } wrapper', async () => {
      const response = await request(baseUrl)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('projects');
      expect(Array.isArray(response.body.projects)).toBe(true);
    });
  });

  describe('Config API', () => {
    it('GET /api/config returns { config } wrapper', async () => {
      const response = await request(baseUrl)
        .get('/api/config')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('config');
      expect(typeof response.body.config).toBe('object');
    });
  });

  describe('Controls API', () => {
    it('POST /api/controls/start uses correct endpoint path', async () => {
      // Test that controls endpoint exists at /api/controls/* (not /api/control/*)
      const response = await request(baseUrl)
        .post('/api/controls/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      // Should return 503 (orchestrator not registered) or 400 (validation error)
      // But NOT 404 (endpoint not found)
      expect([400, 503]).toContain(response.status);
      expect(response.status).not.toBe(404);
    });

    it('POST /api/controls/pause uses correct endpoint path', async () => {
      const response = await request(baseUrl)
        .post('/api/controls/pause')
        .set('Authorization', `Bearer ${authToken}`);

      expect([400, 503]).toContain(response.status);
      expect(response.status).not.toBe(404);
    });
  });

  describe('Tiers API', () => {
    it('GET /api/tiers returns { root, metadata } wrapper', async () => {
      const response = await request(baseUrl)
        .get('/api/tiers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('root');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.metadata).toHaveProperty('totalPhases');
      expect(response.body.metadata).toHaveProperty('totalTasks');
      expect(response.body.metadata).toHaveProperty('totalSubtasks');
    });
  });

  describe('API Contract Verification', () => {
    it('verifies all React API endpoints match server contracts', async () => {
      // This is a meta-test that verifies the API contracts are aligned
      // Individual endpoint tests above verify specific contracts
      
      const endpoints = [
        { path: '/api/projects', expectedWrapper: 'projects' },
        { path: '/api/config', expectedWrapper: 'config' },
        { path: '/api/tiers', expectedWrapper: 'root' },
      ];

      for (const endpoint of endpoints) {
        const response = await request(baseUrl)
          .get(endpoint.path)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveProperty(endpoint.expectedWrapper);
      }
    });
  });
});
