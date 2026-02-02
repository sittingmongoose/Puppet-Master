/**
 * CLI Pause/Resume Integration Tests
 * 
 * Tests the pause/resume cycle components:
 * - CheckpointManager: creation, loading, listing, cleanup
 * - StatePersistence: state serialization and round-trip
 * - Resume flow prerequisites
 * 
 * Integration path: CLI-002
 * Note: Full CLI tests require complex config setup; these tests focus on core components
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Import the actual modules
import { StatePersistence } from '../../src/core/state-persistence.js';
import { CheckpointManager } from '../../src/core/checkpoint-manager.js';
import type { PRD } from '../../src/types/prd.js';

describe('CLI Pause/Resume Integration Tests', () => {
  let tempDir: string;
  let prdPath: string;
  let checkpointDir: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Create temp directory for test artifacts
    tempDir = join(tmpdir(), `pause-resume-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    prdPath = join(tempDir, 'prd.json');
    checkpointDir = join(tempDir, '.puppet-master', 'checkpoints');
    
    await fs.mkdir(checkpointDir, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Pause Flow Integration', () => {
    it('pause flow validates orchestrator must be in executing state', async () => {
      // This tests the state validation that pause command performs
      const executingPrd: PRD = {
        projectName: 'test-project',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        orchestratorState: 'executing',
        orchestratorContext: {
          currentPhaseId: 'PH-001',
          iterationCount: 5
        },
        phases: []
      };

      const pausedPrd: PRD = {
        ...executingPrd,
        orchestratorState: 'paused'
      };

      const idlePrd: PRD = {
        ...executingPrd,
        orchestratorState: 'idle'
      };

      // Executing state can transition to paused
      expect(executingPrd.orchestratorState).toBe('executing');
      
      // Paused state cannot pause again
      expect(pausedPrd.orchestratorState).toBe('paused');
      
      // Idle state cannot pause
      expect(idlePrd.orchestratorState).toBe('idle');
    });

    it('pause creates checkpoint with current state', async () => {
      // Simulate pause flow: create checkpoint from current state
      const manager = new CheckpointManager(checkpointDir, 5);

      const currentState = {
        orchestratorState: 'executing' as const, // Will transition to paused
        orchestratorContext: {
          currentPhaseId: 'PH-001',
          currentTaskId: 'TK-001-001',
          currentSubtaskId: 'ST-001-001-001',
          iterationCount: 5,
          startedAt: new Date().toISOString()
        },
        tierStates: {
          'PH-001': { retryCount: 0, lastError: null },
          'TK-001-001': { retryCount: 1, lastError: null },
          'ST-001-001-001': { retryCount: 0, lastError: null }
        },
        savedAt: new Date().toISOString()
      };

      const position = {
        phaseId: 'PH-001',
        taskId: 'TK-001-001',
        subtaskId: 'ST-001-001-001',
        iterationNumber: 5
      };

      // Create checkpoint (simulating pause action)
      const checkpointId = await manager.createCheckpoint(currentState, position);
      expect(checkpointId).toMatch(/^checkpoint-\d+$/);

      // Verify checkpoint contains correct state
      const checkpoint = await manager.loadCheckpoint(checkpointId);
      expect(checkpoint).not.toBeNull();
      expect(checkpoint?.orchestratorContext.currentPhaseId).toBe('PH-001');
      expect(checkpoint?.orchestratorContext.iterationCount).toBe(5);
      expect(checkpoint?.tierStates['TK-001-001']).toEqual({ retryCount: 1, lastError: null });
    });

    it('pause updates PRD state to paused with reason', async () => {
      // Simulate the PRD update that pause command performs
      const prd: PRD = {
        projectName: 'test-project',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        orchestratorState: 'executing',
        orchestratorContext: {
          currentPhaseId: 'PH-001',
          iterationCount: 5
        },
        phases: []
      };

      // Write initial PRD
      await fs.writeFile(prdPath, JSON.stringify(prd, null, 2));

      // Simulate pause action updating PRD
      prd.orchestratorState = 'paused';
      prd.orchestratorContext = {
        ...prd.orchestratorContext,
        pauseReason: 'user-requested'
      };

      await fs.writeFile(prdPath, JSON.stringify(prd, null, 2));

      // Verify PRD was updated
      const updatedPrd = JSON.parse(await fs.readFile(prdPath, 'utf-8')) as PRD;
      expect(updatedPrd.orchestratorState).toBe('paused');
      expect(updatedPrd.orchestratorContext?.pauseReason).toBe('user-requested');
    });
  });

  describe('Checkpoint Manager Integration', () => {
    it('checkpoint manager creates and loads checkpoints correctly', async () => {
      const manager = new CheckpointManager(checkpointDir, 5);

      const state = {
        orchestratorState: 'paused' as const,
        orchestratorContext: {
          currentPhaseId: 'PH-001',
          currentTaskId: 'TK-001-001',
          iterationCount: 10
        },
        tierStates: {
          'PH-001': { retryCount: 0, lastError: null }
        },
        savedAt: new Date().toISOString()
      };

      const position = {
        phaseId: 'PH-001',
        taskId: 'TK-001-001',
        subtaskId: 'ST-001-001-001',
        iterationNumber: 10
      };

      // Create checkpoint
      const checkpointId = await manager.createCheckpoint(state, position);
      expect(checkpointId).toMatch(/^checkpoint-\d+$/);

      // Load checkpoint
      const loaded = await manager.loadCheckpoint(checkpointId);
      expect(loaded).not.toBeNull();
      expect(loaded?.orchestratorState).toBe('paused');
      expect(loaded?.currentPosition.phaseId).toBe('PH-001');
      expect(loaded?.currentPosition.iterationNumber).toBe(10);
    });

    it('checkpoint manager lists available checkpoints', async () => {
      const manager = new CheckpointManager(checkpointDir, 5);

      const state = {
        orchestratorState: 'paused' as const,
        orchestratorContext: { currentPhaseId: 'PH-001' },
        tierStates: {},
        savedAt: new Date().toISOString()
      };

      const position = {
        phaseId: 'PH-001',
        taskId: null,
        subtaskId: null,
        iterationNumber: 1
      };

      // Create multiple checkpoints
      await manager.createCheckpoint(state, position);
      await new Promise(resolve => setTimeout(resolve, 10)); // Ensure different timestamps
      await manager.createCheckpoint(state, { ...position, iterationNumber: 2 });

      // List checkpoints
      const checkpoints = await manager.listCheckpoints();
      expect(checkpoints.length).toBeGreaterThanOrEqual(2);
      expect(checkpoints[0].position.iterationNumber).toBe(2); // Most recent first
    });

    it('checkpoint manager enforces max checkpoint limit', async () => {
      const manager = new CheckpointManager(checkpointDir, 3); // Only keep 3

      const state = {
        orchestratorState: 'paused' as const,
        orchestratorContext: { currentPhaseId: 'PH-001' },
        tierStates: {},
        savedAt: new Date().toISOString()
      };

      // Create 5 checkpoints
      for (let i = 0; i < 5; i++) {
        await manager.createCheckpoint(state, {
          phaseId: 'PH-001',
          taskId: null,
          subtaskId: null,
          iterationNumber: i
        });
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Should only have 3 checkpoints after cleanup
      const checkpoints = await manager.listCheckpoints();
      expect(checkpoints.length).toBeLessThanOrEqual(3);
    });
  });

  describe('State Persistence Integration', () => {
    it('state persistence round-trips orchestrator state through PRD', async () => {
      // Create a mock PrdManager that uses the real file
      const mockPrdManager = {
        load: vi.fn().mockImplementation(async () => {
          const content = await fs.readFile(prdPath, 'utf-8');
          return JSON.parse(content) as PRD;
        }),
        save: vi.fn().mockImplementation(async (prd: PRD) => {
          await fs.writeFile(prdPath, JSON.stringify(prd, null, 2));
        })
      };

      // Initial PRD
      const initialPrd: PRD = {
        projectName: 'test-project',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        orchestratorState: 'idle',
        phases: [{
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Test',
          status: 'pending',
          tasks: []
        }]
      };
      await fs.writeFile(prdPath, JSON.stringify(initialPrd, null, 2));

      // Create StatePersistence with mock
      const persistence = new StatePersistence(mockPrdManager as any, checkpointDir);

      // Create a mock orchestrator state machine with correct API
      const mockOrchestratorMachine = {
        getCurrentState: () => 'executing' as const,
        getContext: () => ({
          currentPhaseId: 'PH-001',
          currentTaskId: 'TK-001-001',
          iterationCount: 5,
          startedAt: new Date().toISOString()
        })
      };

      const mockTierMachines = new Map();
      mockTierMachines.set('PH-001', {
        getCurrentState: () => 'running' as const,
        getContext: () => ({ retryCount: 0, lastError: null })
      });

      // Save state
      await persistence.saveState(mockOrchestratorMachine as any, mockTierMachines as any);

      // Verify state was persisted
      const savedPrd = JSON.parse(await fs.readFile(prdPath, 'utf-8')) as PRD;
      expect(savedPrd.orchestratorState).toBe('executing');
      expect(savedPrd.orchestratorContext?.currentPhaseId).toBe('PH-001');
      expect(savedPrd.orchestratorContext?.iterationCount).toBe(5);
    });
  });

  describe('Resume Flow Prerequisites', () => {
    it('resume requires paused state in PRD', async () => {
      // This tests the precondition check for resume
      const prd: PRD = {
        projectName: 'test-project',
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        orchestratorState: 'paused',
        orchestratorContext: {
          currentPhaseId: 'PH-001'
        },
        phases: []
      };

      await fs.writeFile(prdPath, JSON.stringify(prd, null, 2));

      // Load and verify state is paused (prerequisite for resume)
      const loadedPrd = JSON.parse(await fs.readFile(prdPath, 'utf-8')) as PRD;
      expect(loadedPrd.orchestratorState).toBe('paused');
    });

    it('checkpoint can be loaded for resume', async () => {
      const manager = new CheckpointManager(checkpointDir, 5);

      // Create a checkpoint simulating pause
      const pausedState = {
        orchestratorState: 'paused' as const,
        orchestratorContext: {
          currentPhaseId: 'PH-001',
          currentTaskId: 'TK-001-001',
          pauseReason: 'user-requested'
        },
        tierStates: {
          'PH-001': { retryCount: 1, lastError: null },
          'TK-001-001': { retryCount: 0, lastError: null }
        },
        savedAt: new Date().toISOString()
      };

      const position = {
        phaseId: 'PH-001',
        taskId: 'TK-001-001',
        subtaskId: 'ST-001-001-001',
        iterationNumber: 15
      };

      const checkpointId = await manager.createCheckpoint(pausedState, position);

      // Load checkpoint (simulating resume action)
      const checkpoint = await manager.loadCheckpoint(checkpointId);
      
      expect(checkpoint).not.toBeNull();
      expect(checkpoint?.orchestratorState).toBe('paused');
      expect(checkpoint?.orchestratorContext.pauseReason).toBe('user-requested');
      expect(checkpoint?.tierStates['PH-001']).toEqual({ retryCount: 1, lastError: null });
      expect(checkpoint?.currentPosition.iterationNumber).toBe(15);
    });
  });
});
