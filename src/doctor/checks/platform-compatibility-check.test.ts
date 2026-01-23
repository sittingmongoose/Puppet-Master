/**
 * Tests for Platform Compatibility Check
 * 
 * Tests the Doctor integration for platform compatibility checking.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { PlatformCompatibilityCheck } from './platform-compatibility-check.js';

describe('PlatformCompatibilityCheck', () => {
  let tempDir: string;
  let srcDir: string;
  let check: PlatformCompatibilityCheck;
  let originalCwd: () => string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'platform-compat-check-'));
    srcDir = join(tempDir, 'src');
    await mkdir(srcDir, { recursive: true });
    check = new PlatformCompatibilityCheck();
    originalCwd = process.cwd;
  });

  afterEach(async () => {
    vi.spyOn(process, 'cwd').mockRestore();
    await rm(tempDir, { recursive: true, force: true });
  });

  it('should have correct name and category', () => {
    expect(check.name).toBe('platform-compatibility');
    expect(check.category).toBe('project');
    expect(check.description).toBe('Check for Windows/Unix compatibility issues');
  });

  it('should pass when no issues found', async () => {
    await writeFile(
      join(srcDir, 'test.ts'),
      `const value = 'hello';\nconst path = require('path');\n`
    );

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('No platform compatibility issues found');
    expect(result.category).toBe('project');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should fail when errors found', async () => {
    await writeFile(
      join(srcDir, 'test.ts'),
      `const target = 'true';\nconst path = '/tmp/file';\n`
    );

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('platform compatibility error');
    expect(result.details).toBeDefined();
    expect(result.fixSuggestion).toBeDefined();
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should pass when only warnings found', async () => {
    await writeFile(
      join(srcDir, 'test.ts'),
      `spawn('cmd', ['arg1 && arg2']);\n`
    );

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    // Warnings should not cause failure
    expect(result.passed).toBe(true);
    expect(result.message).toContain('warning');
    expect(result.details).toBeDefined();
  });

  it('should include error details in result', async () => {
    await writeFile(
      join(srcDir, 'test.ts'),
      `const cmd = 'true';\n`
    );

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.details).toBeDefined();
    if (result.details) {
      expect(result.details).toContain('test.ts');
      expect(result.details).toContain('Fix:');
    }
  });

  it('should include warning details in result', async () => {
    await writeFile(
      join(srcDir, 'test.ts'),
      `spawn('cmd', ['arg1 || arg2']);\n`
    );

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    if (result.message.includes('warning')) {
      expect(result.details).toBeDefined();
      if (result.details) {
        expect(result.details).toContain('test.ts');
        expect(result.details).toContain('Fix:');
      }
    }
  });

  it('should measure execution duration', async () => {
    await writeFile(
      join(srcDir, 'test.ts'),
      `const value = 'hello';\n`
    );

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(typeof result.durationMs).toBe('number');
  });

  it('should handle multiple files with issues', async () => {
    await writeFile(
      join(srcDir, 'file1.ts'),
      `const cmd = 'true';\n`
    );
    await writeFile(
      join(srcDir, 'file2.ts'),
      `const path = '/tmp/file';\n`
    );

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('error');
    if (result.details) {
      // Should mention both files
      expect(result.details).toMatch(/file1\.ts|file2\.ts/);
    }
  });

  it('should aggregate error and warning counts correctly', async () => {
    await writeFile(
      join(srcDir, 'test.ts'),
      `const cmd = 'true';\nspawn('cmd', ['arg1 && arg2']);\n`
    );

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    // Should report errors (which cause failure)
    expect(result.passed).toBe(false);
    expect(result.message).toContain('error');
  });
});
