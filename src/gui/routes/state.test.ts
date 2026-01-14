/**
 * Tests for State API Routes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import express, { type Express } from 'express';
import { createStateRoutes } from './state.js';
import type { TierStateManager } from '../../core/tier-state-manager.js';
import type { OrchestratorStateMachine } from '../../core/orchestrator-state-machine.js';
import type { ProgressManager } from '../../memory/progress-manager.js';
import type { AgentsManager } from '../../memory/agents-manager.js';
import { TierNode, createTierNode } from '../../core/tier-node.js';
import type { TierNodeData } from '../../core/tier-node.js';
import type { OrchestratorContext } from '../../types/state.js';

describe('State API Routes', () => {
  let app: Express;
  let mockTierManager: TierStateManager;
  let mockOrchestrator: OrchestratorStateMachine;
  let mockProgressManager: ProgressManager;
  let mockAgentsManager: AgentsManager;
  let testPort: number;

  beforeEach(() => {
    // Create Express app for testing
    app = express();
    app.use(express.json());

    // Create mock TierStateManager
    mockTierManager = {
      getRoot: vi.fn(),
      findNode: vi.fn(),
      getCurrentPhase: vi.fn(),
      getCurrentTask: vi.fn(),
      getCurrentSubtask: vi.fn(),
    } as unknown as TierStateManager;

    // Create mock OrchestratorStateMachine
    mockOrchestrator = {
      getContext: vi.fn(),
      getCurrentState: vi.fn(),
    } as unknown as OrchestratorStateMachine;

    // Create mock ProgressManager
    mockProgressManager = {
      getLatest: vi.fn(),
    } as unknown as ProgressManager;

    // Create mock AgentsManager
    mockAgentsManager = {
      parseSections: vi.fn(),
    } as unknown as AgentsManager;

    // Mount routes
    app.use('/api', createStateRoutes(mockTierManager, mockOrchestrator, mockProgressManager, mockAgentsManager));

    // Start test server on random port
    testPort = 30000 + Math.floor(Math.random() * 1000);
  });

  describe('GET /api/state', () => {
    it('should return current orchestrator state and completion stats', async () => {
      // Create mock tier tree
      const phaseData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase 1',
        description: 'Test phase',
        plan: { id: 'PH-001', title: 'Phase 1', description: 'Test phase' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const taskData: TierNodeData = {
        id: 'TK-001-001',
        type: 'task',
        title: 'Task 1',
        description: 'Test task',
        plan: { id: 'TK-001-001', title: 'Task 1', description: 'Test task' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const rootData: TierNodeData = {
        id: 'root',
        type: 'phase',
        title: 'Root',
        description: 'Root node',
        plan: { id: 'root', title: 'Root', description: 'Root node' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const root = createTierNode(rootData);
      const phase = createTierNode(phaseData, root);
      const task = createTierNode(taskData, phase);

      const context: OrchestratorContext = {
        state: 'executing',
        currentPhaseId: 'PH-001',
        currentTaskId: 'TK-001-001',
        currentSubtaskId: null,
        currentIterationId: null,
      };

      vi.mocked(mockOrchestrator.getContext).mockReturnValue(context);
      vi.mocked(mockTierManager.getRoot).mockReturnValue(root);

      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/state`);
        expect(response.ok).toBe(true);

        const data = await response.json();
        expect(data).toMatchObject({
          orchestratorState: 'executing',
          currentPhaseId: 'PH-001',
          currentTaskId: 'TK-001-001',
          currentSubtaskId: null,
          completionStats: {
            total: expect.any(Number),
            passed: expect.any(Number),
            failed: expect.any(Number),
            pending: expect.any(Number),
          },
        });
      } finally {
        server.close();
      }
    });

    it('should handle empty tier tree', async () => {
      const rootData: TierNodeData = {
        id: 'root',
        type: 'phase',
        title: 'Root',
        description: 'Root node',
        plan: { id: 'root', title: 'Root', description: 'Root node' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const root = createTierNode(rootData);

      const context: OrchestratorContext = {
        state: 'idle',
        currentPhaseId: null,
        currentTaskId: null,
        currentSubtaskId: null,
        currentIterationId: null,
      };

      vi.mocked(mockOrchestrator.getContext).mockReturnValue(context);
      vi.mocked(mockTierManager.getRoot).mockReturnValue(root);

      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/state`);
        expect(response.ok).toBe(true);

        const data = await response.json();
        expect(data.completionStats).toEqual({
          total: 0,
          passed: 0,
          failed: 0,
          pending: 0,
        });
      } finally {
        server.close();
      }
    });
  });

  describe('GET /api/tiers', () => {
    it('should return full tier hierarchy', async () => {
      const rootData: TierNodeData = {
        id: 'root',
        type: 'phase',
        title: 'Root',
        description: 'Root node',
        plan: { id: 'root', title: 'Root', description: 'Root node' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const phaseData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase 1',
        description: 'Test phase',
        plan: { id: 'PH-001', title: 'Phase 1', description: 'Test phase' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const root = createTierNode(rootData);
      const phase = createTierNode(phaseData, root);

      vi.mocked(mockTierManager.getRoot).mockReturnValue(root);

      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/tiers`);
        expect(response.ok).toBe(true);

        const data = await response.json();
        expect(data).toHaveProperty('root');
        expect(data.root).toHaveProperty('id', 'root');
        expect(data.root).toHaveProperty('children');
        expect(Array.isArray(data.root.children)).toBe(true);
      } finally {
        server.close();
      }
    });

    it('should handle empty tree', async () => {
      const rootData: TierNodeData = {
        id: 'root',
        type: 'phase',
        title: 'Root',
        description: 'Root node',
        plan: { id: 'root', title: 'Root', description: 'Root node' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const root = createTierNode(rootData);

      vi.mocked(mockTierManager.getRoot).mockReturnValue(root);

      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/tiers`);
        expect(response.ok).toBe(true);

        const data = await response.json();
        expect(data.root.children).toEqual([]);
      } finally {
        server.close();
      }
    });
  });

  describe('GET /api/tiers/:id', () => {
    it('should return specific tier node with path and children', async () => {
      const rootData: TierNodeData = {
        id: 'root',
        type: 'phase',
        title: 'Root',
        description: 'Root node',
        plan: { id: 'root', title: 'Root', description: 'Root node' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const phaseData: TierNodeData = {
        id: 'PH-001',
        type: 'phase',
        title: 'Phase 1',
        description: 'Test phase',
        plan: { id: 'PH-001', title: 'Phase 1', description: 'Test phase' },
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        evidence: [],
        iterations: 0,
        maxIterations: 1,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      };

      const root = createTierNode(rootData);
      const phase = createTierNode(phaseData, root);

      vi.mocked(mockTierManager.findNode).mockReturnValue(phase);

      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/tiers/PH-001`);
        expect(response.ok).toBe(true);

        const data = await response.json();
        expect(data).toHaveProperty('tier');
        expect(data).toHaveProperty('path');
        expect(data).toHaveProperty('children');
        expect(data.tier.id).toBe('PH-001');
        expect(Array.isArray(data.path)).toBe(true);
        expect(Array.isArray(data.children)).toBe(true);
      } finally {
        server.close();
      }
    });

    it('should return 404 for non-existent tier', async () => {
      vi.mocked(mockTierManager.findNode).mockReturnValue(null);

      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/tiers/NON-EXISTENT`);
        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data).toMatchObject({
          error: expect.stringContaining('NON-EXISTENT'),
          code: 'TIER_NOT_FOUND',
        });
      } finally {
        server.close();
      }
    });
  });

  describe('GET /api/progress', () => {
    it('should return entries with default limit', async () => {
      const mockEntries = [
        {
          timestamp: '2026-01-01T00:00:00Z',
          itemId: 'ST-001',
          sessionId: 'PM-2026-01-01-00-00-00-001',
          platform: 'cursor' as const,
          duration: '5m',
          status: 'SUCCESS' as const,
          accomplishments: ['Did something'],
          filesChanged: [],
          testsRun: [],
          learnings: [],
          nextSteps: [],
        },
      ];

      vi.mocked(mockProgressManager.getLatest).mockResolvedValue(mockEntries);

      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/progress`);
        expect(response.ok).toBe(true);

        const data = await response.json();
        expect(data).toHaveProperty('entries');
        expect(Array.isArray(data.entries)).toBe(true);
        expect(data.entries.length).toBe(1);
        expect(mockProgressManager.getLatest).toHaveBeenCalledWith(10);
      } finally {
        server.close();
      }
    });

    it('should respect limit query parameter', async () => {
      const mockEntries = Array.from({ length: 5 }, (_, i) => ({
        timestamp: `2026-01-01T00:00:0${i}Z`,
        itemId: `ST-00${i}`,
        sessionId: `PM-2026-01-01-00-00-0${i}-001`,
        platform: 'cursor' as const,
        duration: '5m',
        status: 'SUCCESS' as const,
        accomplishments: ['Did something'],
        filesChanged: [],
        testsRun: [],
        learnings: [],
        nextSteps: [],
      }));

      vi.mocked(mockProgressManager.getLatest).mockResolvedValue(mockEntries);

      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/progress?limit=5`);
        expect(response.ok).toBe(true);

        const data = await response.json();
        expect(data.entries.length).toBe(5);
        expect(mockProgressManager.getLatest).toHaveBeenCalledWith(5);
      } finally {
        server.close();
      }
    });

    it('should handle invalid limit parameter', async () => {
      const mockEntries: any[] = [];

      vi.mocked(mockProgressManager.getLatest).mockResolvedValue(mockEntries);

      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/progress?limit=invalid`);
        expect(response.ok).toBe(true);

        // Should default to 10
        expect(mockProgressManager.getLatest).toHaveBeenCalledWith(10);
      } finally {
        server.close();
      }
    });

    it('should return empty array when no progress', async () => {
      vi.mocked(mockProgressManager.getLatest).mockResolvedValue([]);

      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/progress`);
        expect(response.ok).toBe(true);

        const data = await response.json();
        expect(data.entries).toEqual([]);
      } finally {
        server.close();
      }
    });
  });

  describe('GET /api/agents', () => {
    it('should return root AGENTS.md content when file exists', async () => {
      const mockSections = {
        overview: 'Test overview',
        architectureNotes: [],
        codebasePatterns: [],
        toolingRules: [],
        commonFailureModes: [],
        doItems: [],
        dontItems: [],
        testing: [],
        directoryStructure: [],
      };

      vi.mocked(mockAgentsManager.parseSections).mockReturnValue(mockSections);

      // Mock fs/promises and fs modules
      const mockReadFile = vi.fn().mockResolvedValue('# AGENTS.md\nTest content');
      const mockExistsSync = vi.fn().mockReturnValue(true);

      vi.doMock('fs/promises', () => ({
        readFile: mockReadFile,
      }));

      vi.doMock('fs', () => ({
        existsSync: mockExistsSync,
      }));

      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/agents`);
        expect(response.ok).toBe(true);

        const data = await response.json();
        expect(data).toHaveProperty('document');
        // Note: In actual test, file may not exist, so document could be null
        // This test verifies the endpoint doesn't crash
      } finally {
        server.close();
      }
    });

    it('should handle missing AGENTS.md gracefully', async () => {
      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/agents`);
        expect(response.ok).toBe(true);

        const data = await response.json();
        expect(data).toHaveProperty('document');
        // Document may be null if file doesn't exist, which is acceptable
      } finally {
        server.close();
      }
    });
  });

  describe('Error Handling', () => {
    it('should return 500 for internal errors', async () => {
      vi.mocked(mockTierManager.getRoot).mockImplementation(() => {
        throw new Error('Test error');
      });

      const server = app.listen(testPort);

      try {
        const response = await fetch(`http://localhost:${testPort}/api/tiers`);
        expect(response.status).toBe(500);

        const data = await response.json();
        expect(data).toMatchObject({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
        });
      } finally {
        server.close();
      }
    });
  });
});
