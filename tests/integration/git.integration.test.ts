/**
 * Git Integration Tests
 * 
 * Tests the git operations integration paths:
 * - GIT-001: Iteration commits (stage → commit → SHA capture → log)
 * - GIT-002: Branch strategies (single, per-phase, per-task)
 * 
 * Uses real git operations in a temporary repository.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { spawn } from 'node:child_process';

import { GitManager } from '../../src/git/git-manager.js';
import {
  createBranchStrategy,
  SingleBranchStrategy,
  PerPhaseBranchStrategy,
  PerTaskBranchStrategy,
  type BranchStrategyConfig,
  type BranchContext
} from '../../src/git/branch-strategy.js';

describe('Git Integration Tests', () => {
  let tempDir: string;
  let gitManager: GitManager;

  async function runGit(args: string[], opts: { cwd: string }): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const proc = spawn('git', args, { cwd: opts.cwd, stdio: ['ignore', 'pipe', 'pipe'] });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      proc.on('error', (err) => {
        reject(err);
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
          return;
        }
        reject(new Error(`git ${args.join(' ')} failed (${code ?? -1}): ${stderr.trim()}`));
      });
    });
  }

  /**
   * Initialize a real git repository for testing
   */
  async function initGitRepo(): Promise<void> {
    await runGit(['init'], { cwd: tempDir });
    await runGit(['config', 'user.email', 'test@example.com'], { cwd: tempDir });
    await runGit(['config', 'user.name', 'Test User'], { cwd: tempDir });
    
    // Create initial commit
    await fs.writeFile(join(tempDir, 'README.md'), '# Test Project');
    await runGit(['add', '.'], { cwd: tempDir });
    await runGit(['commit', '-m', 'Initial commit'], { cwd: tempDir });
  }

  beforeEach(async () => {
    // Create temp directory
    tempDir = join(tmpdir(), `git-integration-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    
    // Initialize git repo
    await initGitRepo();
    
    // Create GitManager
    const logPath = join(tempDir, '.puppet-master', 'logs', 'git-actions.log');
    gitManager = new GitManager(tempDir, logPath);
  });

  afterEach(async () => {
    // Cleanup
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('GIT-001: Iteration Commit Integration', () => {
    it('commit stages files and captures SHA', async () => {
      // Create a new file
      await fs.writeFile(join(tempDir, 'iteration-001.ts'), 'export const x = 1;');
      
      // Stage and commit
      const result = await gitManager.commit({
        message: 'ralph: ST-001-001-001 iteration 1 complete',
        files: ['iteration-001.ts']
      });

      expect(result.success).toBe(true);
      expect(result.stdout).toMatch(/[a-f0-9]{7,}/); // Contains commit SHA
    });

    it('commit with all staged files works', async () => {
      // Create multiple files
      await fs.writeFile(join(tempDir, 'file1.ts'), 'export const a = 1;');
      await fs.writeFile(join(tempDir, 'file2.ts'), 'export const b = 2;');
      
      // Stage files manually
      await runGit(['add', '.'], { cwd: tempDir });
      
      // Commit without specifying files
      const result = await gitManager.commit({
        message: 'ralph: TK-001-001 multiple files'
      });

      expect(result.success).toBe(true);
    });

    it('commit amend modifies previous commit', async () => {
      // Create initial file
      await fs.writeFile(join(tempDir, 'initial.ts'), 'export const init = 1;');
      await gitManager.commit({
        message: 'ralph: initial commit',
        files: ['initial.ts']
      });

      // Get initial commit count
      const { stdout: beforeLog } = await runGit(['log', '--oneline'], { cwd: tempDir });
      const beforeCount = beforeLog.trim().split('\n').length;

      // Add more changes and amend
      await fs.writeFile(join(tempDir, 'amended.ts'), 'export const amended = 2;');
      const result = await gitManager.commit({
        message: 'ralph: amended commit',
        files: ['amended.ts'],
        amend: true
      });

      expect(result.success).toBe(true);

      // Commit count should be same (amended, not new commit)
      const { stdout: afterLog } = await runGit(['log', '--oneline'], { cwd: tempDir });
      const afterCount = afterLog.trim().split('\n').length;
      expect(afterCount).toBe(beforeCount);
    });

    it('commit logs action to git-actions.log', async () => {
      await fs.writeFile(join(tempDir, 'logged.ts'), 'export const logged = 1;');
      
      await gitManager.commit({
        message: 'ralph: logged commit',
        files: ['logged.ts']
      });

      // Check log file exists and contains entry
      const logPath = join(tempDir, '.puppet-master', 'logs', 'git-actions.log');
      const logContent = await fs.readFile(logPath, 'utf-8');
      
      expect(logContent).toContain('"action":"commit"');
      expect(logContent).toContain('"result":"success"');
      expect(logContent).toContain('logged commit');
    });

    it('getRecentCommits returns iteration commits', async () => {
      // Create several commits
      for (let i = 1; i <= 3; i++) {
        await fs.writeFile(join(tempDir, `iteration-${i}.ts`), `export const iter${i} = ${i};`);
        await gitManager.commit({
          message: `ralph: ST-001-001-00${i} iteration ${i}`,
          files: [`iteration-${i}.ts`]
        });
      }

      const commits = await gitManager.getRecentCommits(5);
      
      expect(commits.length).toBeGreaterThanOrEqual(3);
      expect(commits[0].message).toContain('iteration 3');
      expect(commits[1].message).toContain('iteration 2');
      expect(commits[2].message).toContain('iteration 1');
    });

    it('getStatus returns correct branch and file states', async () => {
      // Create staged file
      await fs.writeFile(join(tempDir, 'staged.ts'), 'staged content');
      await runGit(['add', 'staged.ts'], { cwd: tempDir });
      
      // Create untracked file
      await fs.writeFile(join(tempDir, 'untracked.ts'), 'untracked content');

      const status = await gitManager.getStatus();

      expect(status.branch).toMatch(/^(master|main)$/);
      expect(status.staged).toContain('staged.ts');
      expect(status.untracked).toContain('untracked.ts');
      expect(typeof status.ahead).toBe('number');
      expect(typeof status.behind).toBe('number');
    });

    it('getDiffFiles returns union of changed files', async () => {
      // Create various file states
      await fs.writeFile(join(tempDir, 'new-staged.ts'), 'staged');
      await runGit(['add', 'new-staged.ts'], { cwd: tempDir });
      
      await fs.writeFile(join(tempDir, 'README.md'), '# Modified README');
      await fs.writeFile(join(tempDir, 'untracked.ts'), 'untracked');

      const diffFiles = await gitManager.getDiffFiles();

      // Should include staged, modified, and untracked
      expect(diffFiles).toContain('new-staged.ts');
      expect(diffFiles).toContain('README.md');
      expect(diffFiles).toContain('untracked.ts');
    });
  });

  describe('GIT-002: Branch Strategy Integration', () => {
    describe('SingleBranchStrategy', () => {
      it('stays on base branch for all operations', async () => {
        const config: BranchStrategyConfig = {
          granularity: 'single',
          baseBranch: 'master',
          namingPattern: 'ralph/{phase}'
        };

        const strategy = createBranchStrategy(config, gitManager);
        expect(strategy).toBeInstanceOf(SingleBranchStrategy);
        expect(strategy.granularity).toBe('single');

        const context: BranchContext = {
          phaseId: 'PH-001',
          taskId: 'TK-001-001'
        };

        // Should return base branch
        expect(strategy.getBranchName(context)).toBe('master');
        expect(strategy.shouldCreateBranch(context)).toBe(false);
        expect(strategy.shouldMerge(context)).toBe(false);

        // Ensure branch should stay on master
        await strategy.ensureBranch(context);
        const currentBranch = await gitManager.getCurrentBranch();
        expect(currentBranch).toBe('master');
      });
    });

    describe('PerPhaseBranchStrategy', () => {
      it('creates branch on phase change', async () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-phase',
          baseBranch: 'master',
          namingPattern: 'ralph/{phase}'
        };

        const strategy = createBranchStrategy(config, gitManager);
        expect(strategy).toBeInstanceOf(PerPhaseBranchStrategy);

        const context: BranchContext = {
          phaseId: 'PH-001',
          taskId: 'TK-001-001'
        };

        // First phase should create branch
        expect(strategy.getBranchName(context)).toBe('ralph/ph-001');
        expect(strategy.shouldCreateBranch(context)).toBe(true);

        // Create the branch
        await strategy.ensureBranch(context);
        const currentBranch = await gitManager.getCurrentBranch();
        expect(currentBranch).toBe('ralph/ph-001');
      });

      it('stays on same branch within phase', async () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-phase',
          baseBranch: 'master',
          namingPattern: 'ralph/{phase}'
        };

        const strategy = createBranchStrategy(config, gitManager);

        // First context
        const context1: BranchContext = {
          phaseId: 'PH-001',
          taskId: 'TK-001-001'
        };
        await strategy.ensureBranch(context1);

        // Same phase, different task
        const context2: BranchContext = {
          phaseId: 'PH-001',
          taskId: 'TK-001-002'
        };

        // Should not create new branch
        expect(strategy.shouldCreateBranch(context2)).toBe(false);
        
        await strategy.ensureBranch(context2);
        const currentBranch = await gitManager.getCurrentBranch();
        expect(currentBranch).toBe('ralph/ph-001');
      });

      it('indicates merge when phase is complete', async () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-phase',
          baseBranch: 'master',
          namingPattern: 'ralph/{phase}'
        };

        const strategy = createBranchStrategy(config, gitManager);

        const context: BranchContext = {
          phaseId: 'PH-001',
          isComplete: true
        };

        expect(strategy.shouldMerge(context)).toBe(true);
      });

      it('merges to base branch on completion', async () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-phase',
          baseBranch: 'master',
          namingPattern: 'ralph/{phase}'
        };

        const strategy = createBranchStrategy(config, gitManager);

        // Create phase branch and make a commit
        const context: BranchContext = { phaseId: 'PH-001' };
        await strategy.ensureBranch(context);
        
        await fs.writeFile(join(tempDir, 'phase-work.ts'), 'export const work = 1;');
        await gitManager.commit({
          message: 'ralph: PH-001 phase work',
          files: ['phase-work.ts']
        });

        // Merge to base
        const mergeResult = await strategy.mergeToBranch('master');
        expect(mergeResult.success).toBe(true);

        // Verify we're now on master
        const currentBranch = await gitManager.getCurrentBranch();
        expect(currentBranch).toBe('master');
      });
    });

    describe('PerTaskBranchStrategy', () => {
      it('creates branch per task', async () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-task',
          baseBranch: 'master',
          namingPattern: 'ralph/{phase}/{task}'
        };

        const strategy = createBranchStrategy(config, gitManager);
        expect(strategy).toBeInstanceOf(PerTaskBranchStrategy);

        const context: BranchContext = {
          phaseId: 'PH-001',
          taskId: 'TK-001-001'
        };

        expect(strategy.getBranchName(context)).toBe('ralph/ph-001/tk-001-001');
        expect(strategy.shouldCreateBranch(context)).toBe(true);

        await strategy.ensureBranch(context);
        const currentBranch = await gitManager.getCurrentBranch();
        expect(currentBranch).toBe('ralph/ph-001/tk-001-001');
      });

      it('creates new branch when task changes', async () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-task',
          baseBranch: 'master',
          namingPattern: 'ralph/{phase}/{task}'
        };

        const strategy = createBranchStrategy(config, gitManager);

        // First task
        const context1: BranchContext = {
          phaseId: 'PH-001',
          taskId: 'TK-001-001'
        };
        await strategy.ensureBranch(context1);
        expect(await gitManager.getCurrentBranch()).toBe('ralph/ph-001/tk-001-001');

        // Make a commit so we can switch branches
        await fs.writeFile(join(tempDir, 'task1.ts'), 'task1');
        await gitManager.commit({ message: 'task1', files: ['task1.ts'] });

        // Go back to master before switching to new task branch
        await gitManager.checkout('master');

        // Second task (different)
        const context2: BranchContext = {
          phaseId: 'PH-001',
          taskId: 'TK-001-002'
        };
        
        expect(strategy.shouldCreateBranch(context2)).toBe(true);
        await strategy.ensureBranch(context2);
        expect(await gitManager.getCurrentBranch()).toBe('ralph/ph-001/tk-001-002');
      });

      it('indicates merge when task is complete', async () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-task',
          baseBranch: 'master',
          namingPattern: 'ralph/{phase}/{task}'
        };

        const strategy = createBranchStrategy(config, gitManager);

        const context: BranchContext = {
          phaseId: 'PH-001',
          taskId: 'TK-001-001',
          isComplete: true
        };

        expect(strategy.shouldMerge(context)).toBe(true);
      });
    });

    describe('Branch Naming Patterns', () => {
      it('substitutes {phase} placeholder', async () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-phase',
          baseBranch: 'main',
          namingPattern: 'feature/{phase}'
        };

        const strategy = createBranchStrategy(config, gitManager);
        const context: BranchContext = { phaseId: 'PH-002' };
        
        expect(strategy.getBranchName(context)).toBe('feature/ph-002');
      });

      it('substitutes {task} placeholder', async () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-task',
          baseBranch: 'main',
          namingPattern: 'dev/{task}'
        };

        const strategy = createBranchStrategy(config, gitManager);
        const context: BranchContext = { 
          phaseId: 'PH-001',
          taskId: 'TK-002-003' 
        };
        
        expect(strategy.getBranchName(context)).toBe('dev/tk-002-003');
      });

      it('substitutes multiple placeholders', async () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-task',
          baseBranch: 'main',
          namingPattern: 'ralph/{phase}/{task}'
        };

        const strategy = createBranchStrategy(config, gitManager);
        const context: BranchContext = {
          phaseId: 'PH-001',
          taskId: 'TK-001-002'
        };
        
        expect(strategy.getBranchName(context)).toBe('ralph/ph-001/tk-001-002');
      });

      it('handles missing placeholders gracefully', async () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-phase',
          baseBranch: 'main',
          namingPattern: 'ralph/{phase}/{task}'
        };

        const strategy = createBranchStrategy(config, gitManager);
        const context: BranchContext = { phaseId: 'PH-001' }; // No taskId
        
        // Should clean up trailing/double slashes
        const branchName = strategy.getBranchName(context);
        expect(branchName).not.toContain('//');
        expect(branchName).not.toMatch(/\/$/);
      });
    });

    describe('Factory Function', () => {
      it('creates SingleBranchStrategy for single granularity', () => {
        const config: BranchStrategyConfig = {
          granularity: 'single',
          baseBranch: 'main',
          namingPattern: 'unused'
        };
        const strategy = createBranchStrategy(config, gitManager);
        expect(strategy).toBeInstanceOf(SingleBranchStrategy);
      });

      it('creates PerPhaseBranchStrategy for per-phase granularity', () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-phase',
          baseBranch: 'main',
          namingPattern: 'ralph/{phase}'
        };
        const strategy = createBranchStrategy(config, gitManager);
        expect(strategy).toBeInstanceOf(PerPhaseBranchStrategy);
      });

      it('creates PerTaskBranchStrategy for per-task granularity', () => {
        const config: BranchStrategyConfig = {
          granularity: 'per-task',
          baseBranch: 'main',
          namingPattern: 'ralph/{phase}/{task}'
        };
        const strategy = createBranchStrategy(config, gitManager);
        expect(strategy).toBeInstanceOf(PerTaskBranchStrategy);
      });

      it('throws for unknown granularity', () => {
        const config = {
          granularity: 'invalid' as any,
          baseBranch: 'main',
          namingPattern: 'test'
        };
        expect(() => createBranchStrategy(config, gitManager)).toThrow('Unknown granularity');
      });
    });
  });

  describe('Push Operations', () => {
    // Note: Push tests require a remote, so we test the command construction
    it('push returns failure when no remote configured', async () => {
      const result = await gitManager.push({ remote: 'origin', branch: 'master' });
      
      // Should fail because no remote is configured in test repo
      expect(result.success).toBe(false);
      expect(result.stderr).toContain("'origin'"); // Error mentions the remote
    });
  });
});
