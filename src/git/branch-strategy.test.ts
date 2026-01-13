/**
 * Tests for branch strategy implementations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createBranchStrategy,
  SingleBranchStrategy,
  PerPhaseBranchStrategy,
  PerTaskBranchStrategy,
  type BranchStrategyConfig,
} from './branch-strategy.js';
import type { GitManager, GitResult } from './git-manager.js';

describe('Branch Strategy', () => {
  let mockGitManager: {
    getCurrentBranch: ReturnType<typeof vi.fn>;
    checkout: ReturnType<typeof vi.fn>;
    createBranch: ReturnType<typeof vi.fn>;
    merge: ReturnType<typeof vi.fn>;
  };
  let config: BranchStrategyConfig;

  beforeEach(() => {
    mockGitManager = {
      getCurrentBranch: vi.fn().mockResolvedValue('main'),
      checkout: vi.fn().mockResolvedValue({ success: true, stdout: '', stderr: '', exitCode: 0 } as GitResult),
      createBranch: vi.fn().mockResolvedValue({ success: true, stdout: '', stderr: '', exitCode: 0 } as GitResult),
      merge: vi.fn().mockResolvedValue({ success: true, stdout: '', stderr: '', exitCode: 0 } as GitResult),
    };
    config = {
      granularity: 'single',
      baseBranch: 'main',
      namingPattern: 'ralph/{phase}/{task}',
    };
  });

  describe('SingleBranchStrategy', () => {
    it('should return base branch name always', () => {
      const strategy = new SingleBranchStrategy(config, mockGitManager as unknown as GitManager);
      
      expect(strategy.getBranchName({})).toBe('main');
      expect(strategy.getBranchName({ phaseId: 'PH-001' })).toBe('main');
      expect(strategy.getBranchName({ taskId: 'TK-001' })).toBe('main');
    });

    it('should never create a branch', () => {
      const strategy = new SingleBranchStrategy(config, mockGitManager as unknown as GitManager);
      
      expect(strategy.shouldCreateBranch({})).toBe(false);
      expect(strategy.shouldCreateBranch({ phaseId: 'PH-001' })).toBe(false);
      expect(strategy.shouldCreateBranch({ taskId: 'TK-001' })).toBe(false);
    });

    it('should never merge', () => {
      const strategy = new SingleBranchStrategy(config, mockGitManager as unknown as GitManager);
      
      expect(strategy.shouldMerge({})).toBe(false);
      expect(strategy.shouldMerge({ isComplete: true })).toBe(false);
    });

    it('should have correct granularity', () => {
      const strategy = new SingleBranchStrategy(config, mockGitManager as unknown as GitManager);
      expect(strategy.granularity).toBe('single');
    });
  });

  describe('PerPhaseBranchStrategy', () => {
    beforeEach(() => {
      config.granularity = 'per-phase';
    });

    it('should format branch name with phase', () => {
      const strategy = new PerPhaseBranchStrategy(config, mockGitManager as unknown as GitManager);
      
      expect(strategy.getBranchName({ phaseId: 'PH-001' })).toBe('ralph/ph-001');
      expect(strategy.getBranchName({ phaseId: 'PH-002' })).toBe('ralph/ph-002');
    });

    it('should return base branch when phaseId is missing', () => {
      const strategy = new PerPhaseBranchStrategy(config, mockGitManager as unknown as GitManager);
      
      expect(strategy.getBranchName({})).toBe('main');
      expect(strategy.getBranchName({ taskId: 'TK-001' })).toBe('main');
    });

    it('should create branch when phase changes', async () => {
      const strategy = new PerPhaseBranchStrategy(config, mockGitManager as unknown as GitManager);
      
      // First phase - should create
      expect(strategy.shouldCreateBranch({ phaseId: 'PH-001' })).toBe(true);
      
      // Simulate that we've worked on PH-001
      await strategy.ensureBranch({ phaseId: 'PH-001' });
      
      // Same phase - should not create
      expect(strategy.shouldCreateBranch({ phaseId: 'PH-001' })).toBe(false);
      
      // New phase - should create
      expect(strategy.shouldCreateBranch({ phaseId: 'PH-002' })).toBe(true);
    });

    it('should merge when phase is complete', () => {
      const strategy = new PerPhaseBranchStrategy(config, mockGitManager as unknown as GitManager);
      
      expect(strategy.shouldMerge({ phaseId: 'PH-001', isComplete: true })).toBe(true);
      expect(strategy.shouldMerge({ phaseId: 'PH-001', isComplete: false })).toBe(false);
      expect(strategy.shouldMerge({ phaseId: 'PH-001' })).toBe(false);
      expect(strategy.shouldMerge({ isComplete: true })).toBe(false); // No phaseId
    });

    it('should have correct granularity', () => {
      const strategy = new PerPhaseBranchStrategy(config, mockGitManager as unknown as GitManager);
      expect(strategy.granularity).toBe('per-phase');
    });
  });

  describe('PerTaskBranchStrategy', () => {
    beforeEach(() => {
      config.granularity = 'per-task';
    });

    it('should format branch name with phase and task', () => {
      const strategy = new PerTaskBranchStrategy(config, mockGitManager as unknown as GitManager);
      
      expect(strategy.getBranchName({ phaseId: 'PH-001', taskId: 'TK-001' })).toBe('ralph/ph-001/tk-001');
      expect(strategy.getBranchName({ phaseId: 'PH-002', taskId: 'TK-002' })).toBe('ralph/ph-002/tk-002');
    });

    it('should return base branch when phaseId or taskId is missing', () => {
      const strategy = new PerTaskBranchStrategy(config, mockGitManager as unknown as GitManager);
      
      expect(strategy.getBranchName({})).toBe('main');
      expect(strategy.getBranchName({ phaseId: 'PH-001' })).toBe('main');
      expect(strategy.getBranchName({ taskId: 'TK-001' })).toBe('main');
    });

    it('should create branch when task changes', async () => {
      const strategy = new PerTaskBranchStrategy(config, mockGitManager as unknown as GitManager);
      
      // First task - should create
      expect(strategy.shouldCreateBranch({ phaseId: 'PH-001', taskId: 'TK-001' })).toBe(true);
      
      // Simulate that we've worked on TK-001
      await strategy.ensureBranch({ phaseId: 'PH-001', taskId: 'TK-001' });
      
      // Same task - should not create
      expect(strategy.shouldCreateBranch({ phaseId: 'PH-001', taskId: 'TK-001' })).toBe(false);
      
      // New task - should create
      expect(strategy.shouldCreateBranch({ phaseId: 'PH-001', taskId: 'TK-002' })).toBe(true);
    });

    it('should merge when task is complete', () => {
      const strategy = new PerTaskBranchStrategy(config, mockGitManager as unknown as GitManager);
      
      expect(strategy.shouldMerge({ taskId: 'TK-001', isComplete: true })).toBe(true);
      expect(strategy.shouldMerge({ taskId: 'TK-001', isComplete: false })).toBe(false);
      expect(strategy.shouldMerge({ taskId: 'TK-001' })).toBe(false);
      expect(strategy.shouldMerge({ isComplete: true })).toBe(false); // No taskId
    });

    it('should have correct granularity', () => {
      const strategy = new PerTaskBranchStrategy(config, mockGitManager as unknown as GitManager);
      expect(strategy.granularity).toBe('per-task');
    });
  });

  describe('Pattern substitution', () => {
    it('should substitute {phase} placeholder', () => {
      const strategy = new PerPhaseBranchStrategy(
        { ...config, granularity: 'per-phase', namingPattern: 'ralph/{phase}' },
        mockGitManager as unknown as GitManager
      );
      
      expect(strategy.getBranchName({ phaseId: 'PH-001' })).toBe('ralph/ph-001');
    });

    it('should substitute {task} placeholder', () => {
      const strategy = new PerTaskBranchStrategy(
        { ...config, granularity: 'per-task', namingPattern: 'ralph/{task}' },
        mockGitManager as unknown as GitManager
      );
      
      expect(strategy.getBranchName({ phaseId: 'PH-001', taskId: 'TK-001' })).toBe('ralph/tk-001');
    });

    it('should substitute both {phase} and {task} placeholders', () => {
      const strategy = new PerTaskBranchStrategy(
        { ...config, granularity: 'per-task', namingPattern: 'ralph/{phase}/{task}' },
        mockGitManager as unknown as GitManager
      );
      
      expect(strategy.getBranchName({ phaseId: 'PH-001', taskId: 'TK-001' })).toBe('ralph/ph-001/tk-001');
    });

    it('should handle custom naming patterns', () => {
      const strategy = new PerTaskBranchStrategy(
        { ...config, granularity: 'per-task', namingPattern: 'feature/{phase}-{task}' },
        mockGitManager as unknown as GitManager
      );
      
      expect(strategy.getBranchName({ phaseId: 'PH-001', taskId: 'TK-001' })).toBe('feature/ph-001-tk-001');
    });

    it('should remove unused placeholders', () => {
      const strategy = new PerPhaseBranchStrategy(
        { ...config, granularity: 'per-phase', namingPattern: 'ralph/{phase}/{task}' },
        mockGitManager as unknown as GitManager
      );
      
      // {task} should be removed since we don't have taskId
      expect(strategy.getBranchName({ phaseId: 'PH-001' })).toBe('ralph/ph-001');
    });
  });

  describe('Factory function', () => {
    it('should create SingleBranchStrategy for single granularity', () => {
      const strategy = createBranchStrategy(
        { ...config, granularity: 'single' },
        mockGitManager as unknown as GitManager
      );
      
      expect(strategy).toBeInstanceOf(SingleBranchStrategy);
      expect(strategy.granularity).toBe('single');
    });

    it('should create PerPhaseBranchStrategy for per-phase granularity', () => {
      const strategy = createBranchStrategy(
        { ...config, granularity: 'per-phase' },
        mockGitManager as unknown as GitManager
      );
      
      expect(strategy).toBeInstanceOf(PerPhaseBranchStrategy);
      expect(strategy.granularity).toBe('per-phase');
    });

    it('should create PerTaskBranchStrategy for per-task granularity', () => {
      const strategy = createBranchStrategy(
        { ...config, granularity: 'per-task' },
        mockGitManager as unknown as GitManager
      );
      
      expect(strategy).toBeInstanceOf(PerTaskBranchStrategy);
      expect(strategy.granularity).toBe('per-task');
    });

    it('should throw error for unknown granularity', () => {
      expect(() => {
        createBranchStrategy(
          { ...config, granularity: 'unknown' as 'single' },
          mockGitManager as unknown as GitManager
        );
      }).toThrow('Unknown granularity: unknown');
    });
  });

  describe('ensureBranch', () => {
    it('should checkout existing branch if already on correct branch', async () => {
      mockGitManager.getCurrentBranch.mockResolvedValue('ralph/ph-001');
      const strategy = new PerPhaseBranchStrategy(
        { ...config, granularity: 'per-phase' },
        mockGitManager as unknown as GitManager
      );
      
      await strategy.ensureBranch({ phaseId: 'PH-001' });
      
      expect(mockGitManager.getCurrentBranch).toHaveBeenCalled();
      expect(mockGitManager.checkout).not.toHaveBeenCalled();
      expect(mockGitManager.createBranch).not.toHaveBeenCalled();
    });

    it('should create branch when it does not exist and shouldCreateBranch returns true', async () => {
      mockGitManager.getCurrentBranch.mockResolvedValue('main');
      mockGitManager.checkout.mockResolvedValueOnce({
        success: false,
        stdout: '',
        stderr: "error: pathspec 'ralph/ph-001' did not match any file(s) known to git.",
        exitCode: 1,
      } as GitResult);
      
      const strategy = new PerPhaseBranchStrategy(
        { ...config, granularity: 'per-phase' },
        mockGitManager as unknown as GitManager
      );
      
      await strategy.ensureBranch({ phaseId: 'PH-001' });
      
      expect(mockGitManager.createBranch).toHaveBeenCalledWith('ralph/ph-001', true);
    });

    it('should checkout existing branch when it exists', async () => {
      mockGitManager.getCurrentBranch.mockResolvedValue('main');
      mockGitManager.checkout.mockResolvedValueOnce({
        success: true,
        stdout: '',
        stderr: '',
        exitCode: 0,
      } as GitResult);
      
      const strategy = new PerPhaseBranchStrategy(
        { ...config, granularity: 'per-phase' },
        mockGitManager as unknown as GitManager
      );
      
      await strategy.ensureBranch({ phaseId: 'PH-001' });
      
      expect(mockGitManager.checkout).toHaveBeenCalledWith('ralph/ph-001');
      expect(mockGitManager.createBranch).not.toHaveBeenCalled();
    });
  });

  describe('mergeToBranch', () => {
    it('should checkout target branch and merge current branch', async () => {
      mockGitManager.getCurrentBranch.mockResolvedValue('ralph/ph-001');
      const strategy = new PerPhaseBranchStrategy(
        { ...config, granularity: 'per-phase' },
        mockGitManager as unknown as GitManager
      );
      
      // Set current branch by ensuring it first
      await strategy.ensureBranch({ phaseId: 'PH-001' });
      
      const result = await strategy.mergeToBranch('main');
      
      expect(mockGitManager.checkout).toHaveBeenCalledWith('main');
      expect(mockGitManager.merge).toHaveBeenCalledWith('ralph/ph-001');
      expect(result.success).toBe(true);
    });
  });
});
