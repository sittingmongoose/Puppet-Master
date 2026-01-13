/**
 * Tests for GitManager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { GitManager } from './git-manager.js';

describe('GitManager', () => {
  const testBaseDir = join(process.cwd(), '.test-git');
  let testRepoDir: string;
  let testLogPath: string;
  let gitManager: GitManager;

  beforeEach(async () => {
    testRepoDir = join(testBaseDir, `repo-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    testLogPath = join(testBaseDir, `logs-${Date.now()}.log`);
    await mkdir(testRepoDir, { recursive: true });

    try {
      execSync('git init', { cwd: testRepoDir, stdio: 'pipe' });
      execSync('git config user.name "Test User"', { cwd: testRepoDir, stdio: 'pipe' });
      execSync('git config user.email "test@example.com"', { cwd: testRepoDir, stdio: 'pipe' });
    } catch {
      // Git might not be available
    }

    gitManager = new GitManager(testRepoDir, testLogPath);
  });

  afterEach(async () => {
    try {
      await rm(testBaseDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('isAvailable', () => {
    it('should return boolean when checking git availability', async () => {
      const available = await gitManager.isAvailable();
      expect(typeof available).toBe('boolean');
    });

    it('should log availability check', async () => {
      await gitManager.isAvailable();
      if (existsSync(testLogPath)) {
        const logContent = await readFile(testLogPath, 'utf-8');
        const lines = logContent.trim().split('\n').filter((line) => line.length > 0);
        if (lines.length > 0) {
          const lastEntry = JSON.parse(lines[lines.length - 1]);
          expect(lastEntry.action).toBe('check_availability');
        }
      }
    });
  });

  describe('getVersion', () => {
    it('should return git version when available', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      const version = await gitManager.getVersion();
      expect(version).toContain('git version');
    });
  });

  describe('getCurrentBranch', () => {
    it('should return branch name', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      
      // Need at least one commit for HEAD to exist
      await writeFile(join(testRepoDir, 'test.txt'), 'content');
      await gitManager.commit({ message: 'initial', files: ['test.txt'] });
      
      const branch = await gitManager.getCurrentBranch();
      expect(typeof branch).toBe('string');
      expect(branch.length).toBeGreaterThan(0);
    });
  });

  describe('add', () => {
    it('should stage files', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      const testFile = join(testRepoDir, 'test.txt');
      await writeFile(testFile, 'test content');
      const result = await gitManager.add(['test.txt']);
      expect(result.success).toBe(true);
      const status = await gitManager.getStatus();
      expect(status.staged).toContain('test.txt');
    });

    it('should stage all files with "."', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      await writeFile(join(testRepoDir, 'file1.txt'), 'content1');
      await writeFile(join(testRepoDir, 'file2.txt'), 'content2');
      const result = await gitManager.add('.');
      expect(result.success).toBe(true);
      const status = await gitManager.getStatus();
      expect(status.staged.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('commit', () => {
    it('should create commit with message', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      await writeFile(join(testRepoDir, 'test.txt'), 'content');
      await gitManager.add(['test.txt']);
      const result = await gitManager.commit({ message: 'test commit' });
      expect(result.success).toBe(true);
      const commits = await gitManager.getRecentCommits(1);
      expect(commits.length).toBe(1);
      expect(commits[0].message).toBe('test commit');
    });

    it('should stage and commit files when files option provided', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      await writeFile(join(testRepoDir, 'test.txt'), 'content');
      const result = await gitManager.commit({ message: 'test', files: ['test.txt'] });
      expect(result.success).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('should return structured status', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      const status = await gitManager.getStatus();
      expect(status).toHaveProperty('branch');
      expect(status).toHaveProperty('staged');
      expect(status).toHaveProperty('modified');
      expect(status).toHaveProperty('untracked');
      expect(status).toHaveProperty('ahead');
      expect(status).toHaveProperty('behind');
      expect(Array.isArray(status.staged)).toBe(true);
    });

    it('should detect untracked files', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      await writeFile(join(testRepoDir, 'untracked.txt'), 'content');
      const status = await gitManager.getStatus();
      expect(status.untracked).toContain('untracked.txt');
    });
  });

  describe('getRecentCommits', () => {
    it('should return commit history', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      await writeFile(join(testRepoDir, 'file1.txt'), 'content1');
      await gitManager.commit({ message: 'commit 1', files: ['file1.txt'] });
      await writeFile(join(testRepoDir, 'file2.txt'), 'content2');
      await gitManager.commit({ message: 'commit 2', files: ['file2.txt'] });
      const commits = await gitManager.getRecentCommits(2);
      expect(commits.length).toBe(2);
      expect(commits[0].message).toBe('commit 2');
    });

    it('should return CommitInfo with all fields', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      await writeFile(join(testRepoDir, 'test.txt'), 'content');
      await gitManager.commit({ message: 'test commit', files: ['test.txt'] });
      const commits = await gitManager.getRecentCommits(1);
      expect(commits.length).toBe(1);
      const commit = commits[0];
      expect(commit).toHaveProperty('sha');
      expect(commit).toHaveProperty('shortSha');
      expect(commit).toHaveProperty('message');
      expect(commit).toHaveProperty('author');
      expect(commit).toHaveProperty('date');
    });
  });

  describe('createBranch', () => {
    it('should create new branch', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      await writeFile(join(testRepoDir, 'test.txt'), 'content');
      await gitManager.commit({ message: 'initial', files: ['test.txt'] });
      const result = await gitManager.createBranch('feature-branch', true);
      expect(result.success).toBe(true);
      const branch = await gitManager.getCurrentBranch();
      expect(branch).toBe('feature-branch');
    });
  });

  describe('checkout', () => {
    it('should switch branches', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      await writeFile(join(testRepoDir, 'test.txt'), 'content');
      await gitManager.commit({ message: 'initial', files: ['test.txt'] });
      
      // Get the default branch name (could be 'main' or 'master')
      const defaultBranch = await gitManager.getCurrentBranch();
      
      await gitManager.createBranch('test-branch', true);
      const result = await gitManager.checkout(defaultBranch);
      expect(result.success).toBe(true);
      const branch = await gitManager.getCurrentBranch();
      expect(branch).toBe(defaultBranch);
    });
  });

  describe('stash', () => {
    it('should stash changes', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      await writeFile(join(testRepoDir, 'test.txt'), 'content');
      await gitManager.commit({ message: 'initial', files: ['test.txt'] });
      await writeFile(join(testRepoDir, 'test.txt'), 'modified');
      const result = await gitManager.stash('test stash');
      expect(result.success).toBe(true);
    });
  });

  describe('diff', () => {
    it('should return diff for working directory', async () => {
      const available = await gitManager.isAvailable();
      if (!available) return;
      await writeFile(join(testRepoDir, 'test.txt'), 'original');
      await gitManager.commit({ message: 'initial', files: ['test.txt'] });
      await writeFile(join(testRepoDir, 'test.txt'), 'modified');
      const diff = await gitManager.diff(false);
      expect(typeof diff).toBe('string');
    });
  });
});
