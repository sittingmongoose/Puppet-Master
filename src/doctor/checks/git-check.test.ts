/**
 * Tests for Git Checks
 * 
 * Tests git availability, configuration, repository, and remote checks.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { GitAvailableCheck, GitConfigCheck, GitRepoCheck, GitRemoteCheck } from './git-check.js';

vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

/**
 * Helper to create a mock process that simulates successful command execution
 */
function createMockProcess(stdout: string, exitCode: number = 0): ChildProcess {
  const dataHandler = vi.fn((event: string, handler: (data: Buffer) => void) => {
    if (event === 'data' && stdout) {
      setTimeout(() => handler(Buffer.from(stdout)), 0);
    }
  });

  const closeHandler = vi.fn((event: string, handler: (code: number) => void) => {
    if (event === 'close') {
      setTimeout(() => handler(exitCode), 10);
    }
  });

  return {
    stdout: { on: dataHandler } as unknown as NodeJS.ReadableStream,
    stderr: { on: vi.fn() } as unknown as NodeJS.ReadableStream,
    on: closeHandler,
    pid: 12345,
  } as unknown as ChildProcess;
}

/**
 * Helper to create a mock process that simulates spawn error
 */
function createMockErrorProcess(error: Error): ChildProcess {
  const errorHandler = vi.fn((event: string, handler: (err: Error) => void) => {
    if (event === 'error') {
      setTimeout(() => handler(error), 10);
    }
  });

  return {
    stdout: { on: vi.fn() } as unknown as NodeJS.ReadableStream,
    stderr: { on: vi.fn() } as unknown as NodeJS.ReadableStream,
    on: errorHandler,
    pid: 12345,
  } as unknown as ChildProcess;
}

describe('GitAvailableCheck', () => {
  let check: GitAvailableCheck;

  beforeEach(() => {
    check = new GitAvailableCheck();
    vi.clearAllMocks();
  });

  it('should pass when git is available with version', async () => {
    const mockProc = createMockProcess('git version 2.40.0');
    vi.mocked(spawn).mockReturnValue(mockProc);

    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toBe('git is available');
    expect(result.details).toBe('git version 2.40.0');
    expect(result.category).toBe('git');
    expect(result.name).toBe('git-available');
  });

  it('should fail when git command fails', async () => {
    const mockProc = createMockProcess('', 1);
    vi.mocked(spawn).mockReturnValue(mockProc);

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toBe('git is not available');
    expect(result.fixSuggestion).toBe('Install git: https://git-scm.com/downloads');
  });

  it('should fail when spawn error occurs', async () => {
    const mockProc = createMockErrorProcess(new Error('Command not found'));
    vi.mocked(spawn).mockReturnValue(mockProc);

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('Failed to check git availability');
    expect(result.fixSuggestion).toBe('Install git: https://git-scm.com/downloads');
  });
});

describe('GitConfigCheck', () => {
  let check: GitConfigCheck;

  beforeEach(() => {
    check = new GitConfigCheck();
    vi.clearAllMocks();
  });

  it('should pass when both user.name and user.email are configured', async () => {
    const mockUserNameProc = createMockProcess('John Doe');
    const mockUserEmailProc = createMockProcess('john@example.com');
    
    vi.mocked(spawn)
      .mockReturnValueOnce(mockUserNameProc)
      .mockReturnValueOnce(mockUserEmailProc);

    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toBe('git user.name and user.email are configured');
    expect(result.details).toContain('user.name: John Doe');
    expect(result.details).toContain('user.email: john@example.com');
  });

  it('should fail when user.name is missing', async () => {
    const mockUserNameProc = createMockProcess('', 1);
    const mockUserEmailProc = createMockProcess('john@example.com');
    
    vi.mocked(spawn)
      .mockReturnValueOnce(mockUserNameProc)
      .mockReturnValueOnce(mockUserEmailProc);

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('user.name');
    expect(result.fixSuggestion).toContain('git config --global user.name');
  });

  it('should fail when user.email is missing', async () => {
    const mockUserNameProc = createMockProcess('John Doe');
    const mockUserEmailProc = createMockProcess('', 1);
    
    vi.mocked(spawn)
      .mockReturnValueOnce(mockUserNameProc)
      .mockReturnValueOnce(mockUserEmailProc);

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('user.email');
    expect(result.fixSuggestion).toContain('git config --global user.email');
  });

  it('should fail when both user.name and user.email are missing', async () => {
    const mockUserNameProc = createMockProcess('', 1);
    const mockUserEmailProc = createMockProcess('', 1);
    
    vi.mocked(spawn)
      .mockReturnValueOnce(mockUserNameProc)
      .mockReturnValueOnce(mockUserEmailProc);

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('user.name');
    expect(result.message).toContain('user.email');
  });

  it('should handle spawn error gracefully', async () => {
    const mockProc = createMockErrorProcess(new Error('Command not found'));
    vi.mocked(spawn).mockReturnValue(mockProc);

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('Failed to check git configuration');
  });
});

describe('GitRepoCheck', () => {
  let check: GitRepoCheck;

  beforeEach(() => {
    check = new GitRepoCheck();
    vi.clearAllMocks();
  });

  it('should pass when in a git repository', async () => {
    const mockProc = createMockProcess('true');
    vi.mocked(spawn).mockReturnValue(mockProc);

    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toBe('Current directory is a git repository');
  });

  it('should fail when not in a git repository', async () => {
    const mockProc = createMockProcess('', 128);
    vi.mocked(spawn).mockReturnValue(mockProc);

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toBe('Current directory is not a git repository');
    expect(result.fixSuggestion).toBe('Run git init to initialize a repository');
  });

  it('should fail when rev-parse returns false', async () => {
    const mockProc = createMockProcess('false');
    vi.mocked(spawn).mockReturnValue(mockProc);

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toBe('Current directory is not a git repository');
  });

  it('should handle spawn error gracefully', async () => {
    const mockProc = createMockErrorProcess(new Error('Command not found'));
    vi.mocked(spawn).mockReturnValue(mockProc);

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('Failed to check git repository status');
  });
});

describe('GitRemoteCheck', () => {
  let check: GitRemoteCheck;

  beforeEach(() => {
    check = new GitRemoteCheck();
    vi.clearAllMocks();
  });

  it('should pass when remote is configured', async () => {
    const mockProc = createMockProcess('origin\thttps://github.com/user/repo.git (fetch)\norigin\thttps://github.com/user/repo.git (push)');
    vi.mocked(spawn).mockReturnValue(mockProc);

    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toBe('git remote is configured');
    expect(result.details).toContain('origin');
  });

  it('should pass with warning when no remote is configured', async () => {
    const mockProc = createMockProcess('');
    vi.mocked(spawn).mockReturnValue(mockProc);

    const result = await check.run();

    // GitRemoteCheck should pass even if no remote (just warn)
    expect(result.passed).toBe(true);
    expect(result.message).toContain('No git remote configured');
    expect(result.fixSuggestion).toContain('git remote add origin');
  });

  it('should handle spawn error gracefully and still pass', async () => {
    const mockProc = createMockErrorProcess(new Error('Command not found'));
    vi.mocked(spawn).mockReturnValue(mockProc);

    const result = await check.run();

    // GitRemoteCheck should pass even on error (it's optional)
    expect(result.passed).toBe(true);
    expect(result.message).toContain('Failed to check git remote');
  });
});
