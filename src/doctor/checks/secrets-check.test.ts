/**
 * Tests for SecretsCheck
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SecretsCheck } from './secrets-check.js';

vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

vi.mock('node:fs', async () => {
  const actual = await vi.importActual<typeof import('node:fs')>('node:fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  };
});

function createMockGitLsFilesProcess(files: string[], exitCode: number = 0): ChildProcess {
  const stdout = files.length ? files.join('\n') + '\n' : '';

  const stdoutOn = vi.fn((event: string, handler: (data: Buffer) => void) => {
    if (event === 'data' && stdout) {
      setTimeout(() => handler(Buffer.from(stdout)), 0);
    }
  });

  const on = vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    if (event === 'close') {
      setTimeout(() => handler(exitCode), 10);
    }
    if (event === 'error') {
      // no-op
    }
  });

  return {
    stdout: { on: stdoutOn } as unknown as NodeJS.ReadableStream,
    stderr: { on: vi.fn() } as unknown as NodeJS.ReadableStream,
    on,
    pid: 12345,
  } as unknown as ChildProcess;
}

describe('SecretsCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes when no secrets found and .gitignore ignores .env', async () => {
    vi.mocked(spawn).mockReturnValue(createMockGitLsFilesProcess(['src/index.ts']));

    vi.mocked(existsSync).mockImplementation((path: import('node:fs').PathLike) => {
      const p = typeof path === 'string' ? path : String(path);
      if (p === join(process.cwd(), '.gitignore')) {
        return true;
      }
      return true;
    });

    vi.mocked(readFileSync).mockImplementation((path: import('node:fs').PathOrFileDescriptor) => {
      const p = typeof path === 'string' ? path : String(path);
      if (p === join(process.cwd(), '.gitignore')) {
        return '.env\n.env.*\nnode_modules/\n';
      }
      return 'console.log("ok");\n';
    });

    const check = new SecretsCheck();
    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('No secret patterns found');
  });

  it('fails when a Context7 key is found, and masks the snippet', async () => {
    vi.mocked(spawn).mockReturnValue(createMockGitLsFilesProcess(['mcp.json']));

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockImplementation((path: import('node:fs').PathOrFileDescriptor) => {
      const p = typeof path === 'string' ? path : String(path);
      if (p === join(process.cwd(), '.gitignore')) {
        return '.env\n';
      }
      return 'CONTEXT7_API_KEY=ctx7sk-abcdefghijklmnopqrstuvwxyz1234567890\n';
    });

    const check = new SecretsCheck();
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('critical');
    expect(result.details).toBeDefined();
    expect(result.details).toContain('ctx7');
    expect(result.details).not.toContain('abcdefghijklmnopqrstuvwxyz1234567890');
    expect(result.fixSuggestion).toContain('Remove secrets');
  });

  it('fails when .gitignore does not ignore .env', async () => {
    vi.mocked(spawn).mockReturnValue(createMockGitLsFilesProcess(['src/index.ts']));

    vi.mocked(existsSync).mockImplementation((path: import('node:fs').PathLike) => {
      const p = typeof path === 'string' ? path : String(path);
      if (p === join(process.cwd(), '.gitignore')) {
        return true;
      }
      return true;
    });

    vi.mocked(readFileSync).mockImplementation((path: import('node:fs').PathOrFileDescriptor) => {
      const p = typeof path === 'string' ? path : String(path);
      if (p === join(process.cwd(), '.gitignore')) {
        return 'node_modules/\n';
      }
      return 'console.log("ok");\n';
    });

    const check = new SecretsCheck();
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('.gitignore');
    expect(result.details).toContain('missing .env ignore');
  });

  it('skips when not a git repo or git is unavailable', async () => {
    vi.mocked(spawn).mockReturnValue(createMockGitLsFilesProcess([], 1));

    const check = new SecretsCheck();
    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('skipping secrets scan');
  });
});

