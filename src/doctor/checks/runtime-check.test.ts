/**
 * Tests for Runtime Checks
 * 
 * Tests runtime environment checks including Node.js, npm, yarn, and Python.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { spawn } from 'child_process';
import {
  NodeVersionCheck,
  NpmAvailableCheck,
  YarnAvailableCheck,
  PythonVersionCheck,
  parseVersion,
  compareVersions,
} from './runtime-check.js';

// Mock child_process.spawn
vi.mock('child_process', () => {
  return {
    spawn: vi.fn(),
  };
});

type MockProcess = ReturnType<typeof spawn>;

describe('parseVersion', () => {
  it('should parse version string with v prefix', () => {
    const result = parseVersion('v18.0.0');
    expect(result).toEqual({ major: 18, minor: 0, patch: 0 });
  });

  it('should parse version string without prefix', () => {
    const result = parseVersion('18.0.0');
    expect(result).toEqual({ major: 18, minor: 0, patch: 0 });
  });

  it('should parse Python version string', () => {
    const result = parseVersion('Python 3.8.5');
    expect(result).toEqual({ major: 3, minor: 8, patch: 5 });
  });

  it('should parse version with extra text', () => {
    const result = parseVersion('node version 20.10.0');
    expect(result).toEqual({ major: 20, minor: 10, patch: 0 });
  });

  it('should throw error for invalid version string', () => {
    expect(() => parseVersion('invalid')).toThrow('Unable to parse version');
  });

  it('should throw error for version without patch', () => {
    expect(() => parseVersion('18.0')).toThrow('Unable to parse version');
  });
});

describe('compareVersions', () => {
  it('should return 0 for equal versions', () => {
    const v1 = { major: 18, minor: 0, patch: 0 };
    const v2 = { major: 18, minor: 0, patch: 0 };
    expect(compareVersions(v1, v2)).toBe(0);
  });

  it('should return 1 when first version is greater (major)', () => {
    const v1 = { major: 20, minor: 0, patch: 0 };
    const v2 = { major: 18, minor: 0, patch: 0 };
    expect(compareVersions(v1, v2)).toBe(1);
  });

  it('should return -1 when first version is less (major)', () => {
    const v1 = { major: 16, minor: 0, patch: 0 };
    const v2 = { major: 18, minor: 0, patch: 0 };
    expect(compareVersions(v1, v2)).toBe(-1);
  });

  it('should return 1 when first version is greater (minor)', () => {
    const v1 = { major: 18, minor: 5, patch: 0 };
    const v2 = { major: 18, minor: 0, patch: 0 };
    expect(compareVersions(v1, v2)).toBe(1);
  });

  it('should return -1 when first version is less (minor)', () => {
    const v1 = { major: 18, minor: 0, patch: 0 };
    const v2 = { major: 18, minor: 5, patch: 0 };
    expect(compareVersions(v1, v2)).toBe(-1);
  });

  it('should return 1 when first version is greater (patch)', () => {
    const v1 = { major: 18, minor: 0, patch: 5 };
    const v2 = { major: 18, minor: 0, patch: 0 };
    expect(compareVersions(v1, v2)).toBe(1);
  });

  it('should return -1 when first version is less (patch)', () => {
    const v1 = { major: 18, minor: 0, patch: 0 };
    const v2 = { major: 18, minor: 0, patch: 5 };
    expect(compareVersions(v1, v2)).toBe(-1);
  });
});

describe('NodeVersionCheck', () => {
  let check: NodeVersionCheck;
  let mockProcess: MockProcess;

  beforeEach(() => {
    check = new NodeVersionCheck();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createMockProcess(stdout: string, exitCode = 0, error?: Error): MockProcess {
    const proc = {
      stdout: {
        on: vi.fn((event: string, callback: (data: Buffer) => void) => {
          if (event === 'data' && !error) {
            setTimeout(() => callback(Buffer.from(stdout)), 0);
          }
        }),
      },
      stderr: {
        on: vi.fn(),
      },
      on: vi.fn((event: string, callback: (codeOrError?: number | Error) => void) => {
        if (event === 'close' && !error) {
          setTimeout(() => callback(exitCode), 0);
        }
        if (event === 'error' && error) {
          setTimeout(() => callback(error), 0);
        }
      }),
      kill: vi.fn(),
    } as unknown as MockProcess;
    return proc;
  }

  it('should pass when Node.js version meets minimum requirement', async () => {
    mockProcess = createMockProcess('v18.0.0\n');
    vi.mocked(spawn).mockReturnValue(mockProcess);

    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('meets minimum requirement');
    expect(result.details).toContain('v18.0.0');
  });

  it('should pass when Node.js version exceeds minimum requirement', async () => {
    mockProcess = createMockProcess('v20.10.0\n');
    vi.mocked(spawn).mockReturnValue(mockProcess);

    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('meets minimum requirement');
  });

  it('should fail when Node.js version is below minimum requirement', async () => {
    mockProcess = createMockProcess('v16.20.0\n');
    vi.mocked(spawn).mockReturnValue(mockProcess);

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('below minimum requirement');
    expect(result.fixSuggestion).toBeDefined();
  });

  it('should fail when node command is not found', async () => {
    const error = new Error('spawn node ENOENT');
    mockProcess = createMockProcess('', 1, error);
    vi.mocked(spawn).mockImplementation(() => {
      throw error;
    });

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('not found');
    expect(result.fixSuggestion).toBeDefined();
  });

  it('should fail when command times out', async () => {
    mockProcess = createMockProcess('');
    vi.mocked(spawn).mockReturnValue(mockProcess);
    // Simulate timeout by not calling close callback
    mockProcess.on = vi.fn();

    // Use a very short timeout for testing
    const result = await check.run();

    // The check should handle the timeout
    expect(result.passed).toBe(false);
  });
});

describe('NpmAvailableCheck', () => {
  let check: NpmAvailableCheck;
  let mockProcess: MockProcess;

  beforeEach(() => {
    check = new NpmAvailableCheck();
    vi.clearAllMocks();
  });

  function createMockProcess(stdout: string, exitCode = 0, error?: Error): MockProcess {
    const proc = {
      stdout: {
        on: vi.fn((event: string, callback: (data: Buffer) => void) => {
          if (event === 'data' && !error) {
            setTimeout(() => callback(Buffer.from(stdout)), 0);
          }
        }),
      },
      stderr: {
        on: vi.fn(),
      },
      on: vi.fn((event: string, callback: (codeOrError?: number | Error) => void) => {
        if (event === 'close' && !error) {
          setTimeout(() => callback(exitCode), 0);
        }
        if (event === 'error' && error) {
          setTimeout(() => callback(error), 0);
        }
      }),
      kill: vi.fn(),
    } as unknown as MockProcess;
    return proc;
  }

  it('should pass when npm is available', async () => {
    mockProcess = createMockProcess('10.2.3\n');
    vi.mocked(spawn).mockReturnValue(mockProcess);

    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('npm is available');
    expect(result.details).toContain('10.2.3');
  });

  it('should fail when npm is not found', async () => {
    const error = new Error('spawn npm ENOENT');
    vi.mocked(spawn).mockImplementation(() => {
      throw error;
    });

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('not found');
    expect(result.fixSuggestion).toBeDefined();
  });

  it('should fail when npm command fails', async () => {
    mockProcess = createMockProcess('', 1);
    vi.mocked(spawn).mockReturnValue(mockProcess);

    const result = await check.run();

    expect(result.passed).toBe(false);
  });
});

describe('YarnAvailableCheck', () => {
  let check: YarnAvailableCheck;
  let mockProcess: MockProcess;

  beforeEach(() => {
    check = new YarnAvailableCheck();
    vi.clearAllMocks();
  });

  function createMockProcess(stdout: string, exitCode = 0, error?: Error): MockProcess {
    const proc = {
      stdout: {
        on: vi.fn((event: string, callback: (data: Buffer) => void) => {
          if (event === 'data' && !error) {
            setTimeout(() => callback(Buffer.from(stdout)), 0);
          }
        }),
      },
      stderr: {
        on: vi.fn(),
      },
      on: vi.fn((event: string, callback: (codeOrError?: number | Error) => void) => {
        if (event === 'close' && !error) {
          setTimeout(() => callback(exitCode), 0);
        }
        if (event === 'error' && error) {
          setTimeout(() => callback(error), 0);
        }
      }),
      kill: vi.fn(),
    } as unknown as MockProcess;
    return proc;
  }

  it('should pass when yarn is available', async () => {
    mockProcess = createMockProcess('1.22.19\n');
    vi.mocked(spawn).mockReturnValue(mockProcess);

    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('yarn is available');
    expect(result.details).toContain('1.22.19');
  });

  it('should warn (not fail critically) when yarn is not found', async () => {
    const error = new Error('spawn yarn ENOENT');
    vi.mocked(spawn).mockImplementation(() => {
      throw error;
    });

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('not found (optional)');
    expect(result.details).toContain('optional');
    expect(result.fixSuggestion).toContain('optional');
  });
});

describe('PythonVersionCheck', () => {
  let check: PythonVersionCheck;
  let mockProcess: MockProcess;

  beforeEach(() => {
    check = new PythonVersionCheck();
    vi.clearAllMocks();
  });

  function createMockProcess(stdout: string, exitCode = 0, error?: Error): MockProcess {
    const proc = {
      stdout: {
        on: vi.fn((event: string, callback: (data: Buffer) => void) => {
          if (event === 'data' && !error) {
            setTimeout(() => callback(Buffer.from(stdout)), 0);
          }
        }),
      },
      stderr: {
        on: vi.fn(),
      },
      on: vi.fn((event: string, callback: (codeOrError?: number | Error) => void) => {
        if (event === 'close' && !error) {
          setTimeout(() => callback(exitCode), 0);
        }
        if (event === 'error' && error) {
          setTimeout(() => callback(error), 0);
        }
      }),
      kill: vi.fn(),
    } as unknown as MockProcess;
    return proc;
  }

  it('should pass when Python 3.8+ is available via python3', async () => {
    mockProcess = createMockProcess('Python 3.8.5\n');
    vi.mocked(spawn).mockReturnValue(mockProcess);

    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('meets minimum requirement');
    expect(result.details).toContain('python3');
  });

  it('should pass when Python 3.8+ is available via python', async () => {
    // First call (python3) fails, second call (python) succeeds
    vi.mocked(spawn).mockImplementation((cmd: string) => {
      if (cmd === 'python3') {
        throw new Error('spawn python3 ENOENT');
      }
      if (cmd === 'python') {
        return createMockProcess('Python 3.9.0\n');
      }
      throw new Error('Unexpected command');
    });

    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('meets minimum requirement');
    expect(result.details).toContain('python');

    // Ensure we attempted python3 first, then python fallback
    expect(vi.mocked(spawn).mock.calls.map((call) => call[0])).toEqual(['python3', 'python']);
  });

  it('should fail when Python version is below 3.8', async () => {
    mockProcess = createMockProcess('Python 3.7.9\n');
    vi.mocked(spawn).mockReturnValue(mockProcess);

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('below minimum requirement');
    expect(result.fixSuggestion).toBeDefined();
  });

  it('should warn (not fail critically) when Python is not found', async () => {
    const error = new Error('spawn python3 ENOENT');
    vi.mocked(spawn).mockImplementation((cmd: string) => {
      if (cmd === 'python3' || cmd === 'python') {
        throw error;
      }
      throw new Error('Unexpected command');
    });

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('not found (optional)');
    expect(result.details).toContain('optional');
    expect(result.fixSuggestion).toContain('optional');
  });

  it('should fail when Python version cannot be parsed', async () => {
    mockProcess = createMockProcess('Invalid version string\n');
    vi.mocked(spawn).mockReturnValue(mockProcess);

    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('Unable to parse');
  });
});
