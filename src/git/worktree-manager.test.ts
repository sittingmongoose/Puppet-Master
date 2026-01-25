/**
 * Tests for WorktreeManager
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P2-T01
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorktreeManager } from './worktree-manager.js';
import { GitManager } from './git-manager.js';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

describe('WorktreeManager', () => {
  let testDir: string;
  let gitManager: GitManager;
  let worktreeManager: WorktreeManager;

  beforeEach(async () => {
    // Create a temporary test directory with a git repo
    testDir = join(tmpdir(), `worktree-test-${randomUUID()}`);
    await mkdir(testDir, { recursive: true });

    // Initialize git repo
    gitManager = new GitManager(testDir);
    await execGit(testDir, ['init']);
    await execGit(testDir, ['config', 'user.email', 'test@test.com']);
    await execGit(testDir, ['config', 'user.name', 'Test User']);

    // Create initial commit
    await writeFile(join(testDir, 'README.md'), '# Test Project\n');
    await execGit(testDir, ['add', '.']);
    await execGit(testDir, ['commit', '-m', 'Initial commit']);

    worktreeManager = new WorktreeManager(testDir, gitManager);
  });

  afterEach(async () => {
    // Clean up
    try {
      await worktreeManager.cleanupAll(true);
    } catch {
      // Ignore
    }
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  /**
   * Helper to execute git commands directly
   */
  async function execGit(cwd: string, args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const { spawn } = await import('node:child_process');
    return new Promise((resolve) => {
      const proc = spawn('git', args, { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';
      proc.stdout?.on('data', (d: Buffer) => { stdout += d.toString(); });
      proc.stderr?.on('data', (d: Buffer) => { stderr += d.toString(); });
      proc.on('close', (code) => resolve({ stdout: stdout.trim(), stderr: stderr.trim(), exitCode: code ?? -1 }));
      proc.on('error', () => resolve({ stdout: '', stderr: 'spawn error', exitCode: -1 }));
    });
  }

  describe('createWorktree', () => {
    it('should create a worktree for an agent', async () => {
      const agentId = 'agent-1';
      const path = await worktreeManager.createWorktree(agentId);

      expect(path).toContain(agentId);
      expect(worktreeManager.hasWorktree(agentId)).toBe(true);

      const info = worktreeManager.getWorktree(agentId);
      expect(info).toBeDefined();
      expect(info?.agentId).toBe(agentId);
      expect(info?.status).toBe('active');
      expect(info?.branch).toContain(agentId);
    });

    it('should throw if worktree already exists for agent', async () => {
      const agentId = 'agent-dup';
      await worktreeManager.createWorktree(agentId);

      await expect(worktreeManager.createWorktree(agentId)).rejects.toThrow(
        /Worktree already exists/
      );
    });

    it('should create worktree from specified base branch', async () => {
      // Create a feature branch
      await execGit(testDir, ['checkout', '-b', 'feature-branch']);
      await writeFile(join(testDir, 'feature.txt'), 'feature content');
      await execGit(testDir, ['add', '.']);
      await execGit(testDir, ['commit', '-m', 'Feature commit']);
      await execGit(testDir, ['checkout', 'master']);

      const agentId = 'agent-from-feature';
      await worktreeManager.createWorktree(agentId, 'feature-branch');

      const info = worktreeManager.getWorktree(agentId);
      expect(info?.baseBranch).toBe('feature-branch');
    });

    it('should create multiple worktrees concurrently', async () => {
      const agentIds = ['agent-a', 'agent-b', 'agent-c'];
      const promises = agentIds.map(id => worktreeManager.createWorktree(id));
      const paths = await Promise.all(promises);

      expect(paths).toHaveLength(3);
      expect(worktreeManager.listWorktrees()).toHaveLength(3);
    });
  });

  describe('destroyWorktree', () => {
    it('should destroy an existing worktree', async () => {
      const agentId = 'agent-to-destroy';
      await worktreeManager.createWorktree(agentId);
      expect(worktreeManager.hasWorktree(agentId)).toBe(true);

      await worktreeManager.destroyWorktree(agentId);
      expect(worktreeManager.hasWorktree(agentId)).toBe(false);
    });

    it('should force destroy worktree with uncommitted changes', async () => {
      const agentId = 'agent-dirty';
      const path = await worktreeManager.createWorktree(agentId);

      // Make uncommitted changes in the worktree
      await writeFile(join(path, 'dirty.txt'), 'uncommitted');

      // Should succeed with force=true
      await worktreeManager.destroyWorktree(agentId, true);
      expect(worktreeManager.hasWorktree(agentId)).toBe(false);
    });

    it('should handle destroying non-existent worktree gracefully', async () => {
      // Should not throw
      await expect(worktreeManager.destroyWorktree('non-existent', true)).resolves.not.toThrow();
    });
  });

  describe('mergeWorktree', () => {
    it('should merge worktree branch back to base', async () => {
      const agentId = 'agent-merge';
      const worktreePath = await worktreeManager.createWorktree(agentId);

      // Make changes in the worktree
      await writeFile(join(worktreePath, 'new-file.txt'), 'new content');
      await execGit(worktreePath, ['add', '.']);
      await execGit(worktreePath, ['commit', '-m', 'Add new file']);

      // Merge back
      const result = await worktreeManager.mergeWorktree(agentId);

      expect(result.success).toBe(true);
      expect(result.conflictFiles).toHaveLength(0);
      expect(result.mergeCommitSha).toBeDefined();
    });

    it('should detect merge conflicts', async () => {
      const agentId = 'agent-conflict';
      const worktreePath = await worktreeManager.createWorktree(agentId);

      // Modify the same file in main repo
      await writeFile(join(testDir, 'README.md'), '# Modified in main\n');
      await execGit(testDir, ['add', '.']);
      await execGit(testDir, ['commit', '-m', 'Modify README in main']);

      // Modify the same file in worktree
      await writeFile(join(worktreePath, 'README.md'), '# Modified in worktree\n');
      await execGit(worktreePath, ['add', '.']);
      await execGit(worktreePath, ['commit', '-m', 'Modify README in worktree']);

      // Attempt merge
      const result = await worktreeManager.mergeWorktree(agentId);

      expect(result.success).toBe(false);
      expect(result.conflictFiles).toContain('README.md');
      expect(result.error).toContain('conflict');

      // Worktree should be marked as conflict
      const info = worktreeManager.getWorktree(agentId);
      expect(info?.status).toBe('conflict');
    });

    it('should cleanup worktree after successful merge when configured', async () => {
      const manager = new WorktreeManager(testDir, gitManager, {
        cleanupOnMerge: true,
      });

      const agentId = 'agent-cleanup';
      const worktreePath = await manager.createWorktree(agentId);

      // Make changes
      await writeFile(join(worktreePath, 'cleanup-test.txt'), 'content');
      await execGit(worktreePath, ['add', '.']);
      await execGit(worktreePath, ['commit', '-m', 'Add file']);

      // Merge
      await manager.mergeWorktree(agentId);

      // Should be cleaned up
      expect(manager.hasWorktree(agentId)).toBe(false);
    });

    it('should throw if merging non-existent worktree', async () => {
      await expect(worktreeManager.mergeWorktree('ghost')).rejects.toThrow(
        /No worktree found/
      );
    });
  });

  describe('listWorktrees', () => {
    it('should return empty array when no worktrees', () => {
      expect(worktreeManager.listWorktrees()).toEqual([]);
    });

    it('should list all tracked worktrees', async () => {
      await worktreeManager.createWorktree('agent-1');
      await worktreeManager.createWorktree('agent-2');

      const list = worktreeManager.listWorktrees();
      expect(list).toHaveLength(2);
      expect(list.map(w => w.agentId).sort()).toEqual(['agent-1', 'agent-2']);
    });
  });

  describe('listGitWorktrees', () => {
    it('should list git worktrees including main', async () => {
      const list = await worktreeManager.listGitWorktrees();
      
      // Should have at least the main worktree
      expect(list.length).toBeGreaterThanOrEqual(1);
      expect(list.some(w => w.path === testDir)).toBe(true);
    });

    it('should include created worktrees', async () => {
      await worktreeManager.createWorktree('agent-list');
      
      const list = await worktreeManager.listGitWorktrees();
      expect(list.some(w => w.branch.includes('agent-list'))).toBe(true);
    });
  });

  describe('cleanupAll', () => {
    it('should destroy all tracked worktrees', async () => {
      await worktreeManager.createWorktree('agent-1');
      await worktreeManager.createWorktree('agent-2');
      await worktreeManager.createWorktree('agent-3');

      expect(worktreeManager.listWorktrees()).toHaveLength(3);

      await worktreeManager.cleanupAll();

      expect(worktreeManager.listWorktrees()).toHaveLength(0);
    });
  });

  describe('cleanupOrphanedWorktrees', () => {
    it('should clean up worktrees not tracked by manager', async () => {
      // Create a worktree directly with git (not through manager)
      const orphanPath = join(testDir, '.puppet-master', 'worktrees', 'orphan-agent');
      await mkdir(join(testDir, '.puppet-master', 'worktrees'), { recursive: true });
      await execGit(testDir, ['worktree', 'add', '-b', 'worktree/orphan-agent', orphanPath]);

      // Manager doesn't track it
      expect(worktreeManager.hasWorktree('orphan-agent')).toBe(false);

      // Clean up orphans
      const cleaned = await worktreeManager.cleanupOrphanedWorktrees();
      expect(cleaned).toContain(orphanPath);
    });

    it('should not clean up tracked worktrees', async () => {
      await worktreeManager.createWorktree('tracked-agent');

      const cleaned = await worktreeManager.cleanupOrphanedWorktrees();
      expect(cleaned).toHaveLength(0);
      expect(worktreeManager.hasWorktree('tracked-agent')).toBe(true);
    });
  });

  describe('restoreFromDisk', () => {
    it('should restore tracking for existing worktrees', async () => {
      // Create a worktree
      await worktreeManager.createWorktree('restore-test');
      const path = worktreeManager.getWorktree('restore-test')?.path;
      expect(path).toBeDefined();

      // Create a new manager (simulating restart)
      const newManager = new WorktreeManager(testDir, gitManager);
      expect(newManager.hasWorktree('restore-test')).toBe(false);

      // Restore from disk
      const restored = await newManager.restoreFromDisk();
      expect(restored).toBe(1);
      expect(newManager.hasWorktree('restore-test')).toBe(true);
    });
  });

  describe('getActiveCount', () => {
    it('should return count of active worktrees', async () => {
      expect(worktreeManager.getActiveCount()).toBe(0);

      await worktreeManager.createWorktree('agent-1');
      expect(worktreeManager.getActiveCount()).toBe(1);

      await worktreeManager.createWorktree('agent-2');
      expect(worktreeManager.getActiveCount()).toBe(2);

      await worktreeManager.destroyWorktree('agent-1', true);
      expect(worktreeManager.getActiveCount()).toBe(1);
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent create and destroy', async () => {
      // Create multiple worktrees
      const createPromises = [
        worktreeManager.createWorktree('concurrent-1'),
        worktreeManager.createWorktree('concurrent-2'),
        worktreeManager.createWorktree('concurrent-3'),
      ];
      await Promise.all(createPromises);

      expect(worktreeManager.getActiveCount()).toBe(3);

      // Destroy concurrently
      const destroyPromises = [
        worktreeManager.destroyWorktree('concurrent-1', true),
        worktreeManager.destroyWorktree('concurrent-2', true),
        worktreeManager.destroyWorktree('concurrent-3', true),
      ];
      await Promise.all(destroyPromises);

      expect(worktreeManager.getActiveCount()).toBe(0);
    });
  });
});
