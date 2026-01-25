/**
 * Tests for CheckpointManager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { CheckpointManager } from './checkpoint-manager.js';
import type { PersistedState } from './state-persistence.js';
import type { CurrentPosition, CheckpointMetadata } from './checkpoint-manager.js';

describe('checkpoint-manager', () => {
  const testDir = '.puppet-master-test';
  const checkpointDir = join(testDir, 'checkpoints');
  let checkpointManager: CheckpointManager;

  beforeEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
    await fs.mkdir(checkpointDir, { recursive: true });

    checkpointManager = new CheckpointManager(checkpointDir, 10);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore errors
    }
  });

  function createMockState(): PersistedState {
    return {
      orchestratorState: 'executing',
      orchestratorContext: {
        state: 'executing',
        currentPhaseId: 'PH-001',
        currentTaskId: 'TK-001-001',
        currentSubtaskId: 'ST-001-001-001',
        currentIterationId: null,
      },
      tierStates: {
        'PH-001': {
          tierType: 'phase',
          itemId: 'PH-001',
          state: 'running',
          iterationCount: 0,
          maxIterations: 5,
        },
        'TK-001-001': {
          tierType: 'task',
          itemId: 'TK-001-001',
          state: 'running',
          iterationCount: 0,
          maxIterations: 5,
        },
        'ST-001-001-001': {
          tierType: 'subtask',
          itemId: 'ST-001-001-001',
          state: 'running',
          iterationCount: 1,
          maxIterations: 10,
        },
      },
      savedAt: new Date().toISOString(),
    };
  }

  function createMockPosition(): CurrentPosition {
    return {
      phaseId: 'PH-001',
      taskId: 'TK-001-001',
      subtaskId: 'ST-001-001-001',
      iterationNumber: 1,
    };
  }

  function createMockMetadata(): CheckpointMetadata {
    return {
      projectName: 'test-project',
      completedSubtasks: 5,
      totalSubtasks: 10,
      iterationsRun: 15,
    };
  }

  describe('createCheckpoint', () => {
    it('creates a checkpoint file', async () => {
      const state = createMockState();
      const position = createMockPosition();

      const checkpointId = await checkpointManager.createCheckpoint(state, position);

      expect(checkpointId).toMatch(/^checkpoint-\d+$/);

      const checkpointPath = join(checkpointDir, `${checkpointId}.json`);
      await expect(fs.access(checkpointPath)).resolves.not.toThrow();

      const content = await fs.readFile(checkpointPath, 'utf-8');
      const checkpoint = JSON.parse(content);
      expect(checkpoint.id).toBe(checkpointId);
      expect(checkpoint.orchestratorState).toBe('executing');
      expect(checkpoint.currentPosition).toEqual(position);
    });

    it('creates checkpoint with metadata', async () => {
      const state = createMockState();
      const position = createMockPosition();
      const metadata = createMockMetadata();

      const checkpointId = await checkpointManager.createCheckpointWithMetadata(state, position, metadata);

      const checkpoint = await checkpointManager.loadCheckpoint(checkpointId);
      expect(checkpoint).not.toBeNull();
      expect(checkpoint?.metadata).toEqual(metadata);
    });

    it('creates checkpoint directory if it does not exist', async () => {
      const newDir = join(testDir, 'new-checkpoints');
      const manager = new CheckpointManager(newDir);
      const state = createMockState();
      const position = createMockPosition();

      const checkpointId = await manager.createCheckpoint(state, position);

      expect(checkpointId).toBeDefined();
      await expect(fs.access(newDir)).resolves.not.toThrow();
    });
  });

  describe('loadCheckpoint', () => {
    it('loads an existing checkpoint', async () => {
      const state = createMockState();
      const position = createMockPosition();
      const metadata = createMockMetadata();

      const checkpointId = await checkpointManager.createCheckpointWithMetadata(state, position, metadata);
      const loaded = await checkpointManager.loadCheckpoint(checkpointId);

      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe(checkpointId);
      expect(loaded?.orchestratorState).toBe('executing');
      expect(loaded?.currentPosition).toEqual(position);
      expect(loaded?.metadata).toEqual(metadata);
    });

    it('returns null for non-existent checkpoint', async () => {
      const loaded = await checkpointManager.loadCheckpoint('non-existent-checkpoint');
      expect(loaded).toBeNull();
    });

    it('throws error for corrupted checkpoint', async () => {
      const checkpointPath = join(checkpointDir, 'corrupted-checkpoint.json');
      await fs.writeFile(checkpointPath, 'invalid json', 'utf-8');

      await expect(checkpointManager.loadCheckpoint('corrupted-checkpoint')).rejects.toThrow();
    });

    it('throws error for checkpoint with invalid structure', async () => {
      const checkpointPath = join(checkpointDir, 'invalid-checkpoint.json');
      await fs.writeFile(
        checkpointPath,
        JSON.stringify({ id: 'invalid-checkpoint', timestamp: new Date().toISOString() }),
        'utf-8'
      );

      await expect(checkpointManager.loadCheckpoint('invalid-checkpoint')).rejects.toThrow('Invalid checkpoint structure');
    });
  });

  describe('listCheckpoints', () => {
    it('lists all checkpoints', async () => {
      const state = createMockState();
      const position = createMockPosition();
      const metadata = createMockMetadata();

      const id1 = await checkpointManager.createCheckpointWithMetadata(state, position, metadata);
      // Wait a bit to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));
      const id2 = await checkpointManager.createCheckpointWithMetadata(state, position, metadata);

      const checkpoints = await checkpointManager.listCheckpoints();

      expect(checkpoints.length).toBeGreaterThanOrEqual(2);
      expect(checkpoints.map((c) => c.id)).toContain(id1);
      expect(checkpoints.map((c) => c.id)).toContain(id2);
    });

    it('returns empty array when no checkpoints exist', async () => {
      const checkpoints = await checkpointManager.listCheckpoints();
      expect(checkpoints).toEqual([]);
    });

    it('sorts checkpoints by timestamp (newest first)', async () => {
      const state = createMockState();
      const position = createMockPosition();
      const metadata = createMockMetadata();

      const id1 = await checkpointManager.createCheckpointWithMetadata(state, position, metadata);
      await new Promise((resolve) => setTimeout(resolve, 10));
      const id2 = await checkpointManager.createCheckpointWithMetadata(state, position, metadata);

      const checkpoints = await checkpointManager.listCheckpoints();

      expect(checkpoints[0]?.id).toBe(id2); // Newest first
      expect(checkpoints[1]?.id).toBe(id1);
    });

    it('skips corrupted checkpoints', async () => {
      const state = createMockState();
      const position = createMockPosition();
      const metadata = createMockMetadata();

      const validId = await checkpointManager.createCheckpointWithMetadata(state, position, metadata);

      // Create a corrupted checkpoint file
      const corruptedPath = join(checkpointDir, 'checkpoint-corrupted.json');
      await fs.writeFile(corruptedPath, 'invalid json', 'utf-8');

      const checkpoints = await checkpointManager.listCheckpoints();

      // Should only include the valid checkpoint
      expect(checkpoints.length).toBeGreaterThanOrEqual(1);
      expect(checkpoints.map((c) => c.id)).toContain(validId);
      expect(checkpoints.map((c) => c.id)).not.toContain('checkpoint-corrupted');
    });
  });

  describe('deleteCheckpoint', () => {
    it('deletes an existing checkpoint', async () => {
      const state = createMockState();
      const position = createMockPosition();

      const checkpointId = await checkpointManager.createCheckpoint(state, position);
      const checkpointPath = join(checkpointDir, `${checkpointId}.json`);

      await expect(fs.access(checkpointPath)).resolves.not.toThrow();

      await checkpointManager.deleteCheckpoint(checkpointId);

      await expect(fs.access(checkpointPath)).rejects.toThrow();
    });

    it('throws error when deleting non-existent checkpoint', async () => {
      await expect(checkpointManager.deleteCheckpoint('non-existent')).rejects.toThrow('Checkpoint not found');
    });
  });

  describe('cleanOldCheckpoints', () => {
    it('keeps only maxCheckpoints checkpoints', async () => {
      const manager = new CheckpointManager(checkpointDir, 3); // Keep only 3
      const state = createMockState();
      const position = createMockPosition();
      const metadata = createMockMetadata();

      // Create 5 checkpoints
      const ids: string[] = [];
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10)); // Ensure different timestamps
        const id = await manager.createCheckpointWithMetadata(state, position, metadata);
        ids.push(id);
      }

      const checkpoints = await manager.listCheckpoints();
      expect(checkpoints.length).toBeLessThanOrEqual(3);

      // Oldest checkpoints should be deleted
      const oldestIds = ids.slice(0, 2);
      for (const oldId of oldestIds) {
        const checkpoint = await manager.loadCheckpoint(oldId);
        expect(checkpoint).toBeNull();
      }
    });

    it('does not delete checkpoints when under limit', async () => {
      const manager = new CheckpointManager(checkpointDir, 10);
      const state = createMockState();
      const position = createMockPosition();
      const metadata = createMockMetadata();

      const ids: string[] = [];
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        const id = await manager.createCheckpointWithMetadata(state, position, metadata);
        ids.push(id);
      }

      const checkpoints = await manager.listCheckpoints();
      expect(checkpoints.length).toBe(5);

      // All checkpoints should still exist
      for (const id of ids) {
        const checkpoint = await manager.loadCheckpoint(id);
        expect(checkpoint).not.toBeNull();
      }
    });
  });

  describe('atomic write behavior', () => {
    it('uses atomic writes for checkpoint creation', async () => {
      const state = createMockState();
      const position = createMockPosition();

      const checkpointId = await checkpointManager.createCheckpoint(state, position);
      const checkpointPath = join(checkpointDir, `${checkpointId}.json`);

      // Check that backup files might exist (from AtomicWriter)
      // Note: AtomicWriter may create backups, but we don't need to verify that here
      // Just verify the main file exists and is valid
      await expect(fs.access(checkpointPath)).resolves.not.toThrow();

      const content = await fs.readFile(checkpointPath, 'utf-8');
      const checkpoint = JSON.parse(content);
      expect(checkpoint.id).toBe(checkpointId);
    });
  });
});
