/**
 * File Exists Verifier Tests
 * 
 * Tests for the FileExistsVerifier implementation.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { mkdtemp } from 'fs/promises';
import { FileExistsVerifier } from './file-exists-verifier.js';
import type { FileExistsCriterion } from './file-exists-verifier.js';

describe('FileExistsVerifier', () => {
  let tempDir: string;
  let verifier: FileExistsVerifier;

  beforeEach(async () => {
    tempDir = await mkdtemp('/tmp/file-exists-verifier-');
    verifier = new FileExistsVerifier();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('verify', () => {
    it('should verify file exists', async () => {
      const testFile = join(tempDir, 'test.txt');
      await writeFile(testFile, 'test content');

      const criterion: FileExistsCriterion = {
        id: 'test-1',
        description: 'Test file exists',
        type: 'file_exists',
        target: testFile,
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.type).toBe('file_exists');
      expect(result.target).toBe(testFile);
      expect(result.summary).toContain('exist and meet criteria');
    });

    it('should verify directory exists', async () => {
      const testDir = join(tempDir, 'test-dir');
      await mkdir(testDir);

      const criterion: FileExistsCriterion = {
        id: 'test-2',
        description: 'Test directory exists',
        type: 'file_exists',
        target: testDir,
        options: {
          isDirectory: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.summary).toContain('exist and meet criteria');
    });

    it('should fail when file does not exist', async () => {
      const nonExistentFile = join(tempDir, 'nonexistent.txt');

      const criterion: FileExistsCriterion = {
        id: 'test-3',
        description: 'Test file does not exist',
        type: 'file_exists',
        target: nonExistentFile,
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.summary).toContain('No files match');
      expect(result.error).toBeDefined();
    });

    it('should verify file does NOT exist when notExists is true', async () => {
      const nonExistentFile = join(tempDir, 'nonexistent.txt');

      const criterion: FileExistsCriterion = {
        id: 'test-4',
        description: 'Test file does not exist',
        type: 'file_exists',
        target: nonExistentFile,
        options: {
          notExists: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.summary).toContain('(as expected)');
    });

    it('should fail when file exists but notExists is true', async () => {
      const testFile = join(tempDir, 'test.txt');
      await writeFile(testFile, 'test content');

      const criterion: FileExistsCriterion = {
        id: 'test-5',
        description: 'Test file should not exist',
        type: 'file_exists',
        target: testFile,
        options: {
          notExists: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.summary).toContain('did not meet criteria');
    });

    it('should verify file size constraints', async () => {
      const testFile = join(tempDir, 'test.txt');
      await writeFile(testFile, 'test content'); // 12 bytes

      const criterion: FileExistsCriterion = {
        id: 'test-6',
        description: 'Test file size',
        type: 'file_exists',
        target: testFile,
        options: {
          minSize: 10,
          maxSize: 20,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
    });

    it('should fail when file is too small', async () => {
      const testFile = join(tempDir, 'test.txt');
      await writeFile(testFile, 'test'); // 4 bytes

      const criterion: FileExistsCriterion = {
        id: 'test-7',
        description: 'Test file size too small',
        type: 'file_exists',
        target: testFile,
        options: {
          minSize: 10,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('less than minimum');
    });

    it('should fail when file is too large', async () => {
      const testFile = join(tempDir, 'test.txt');
      await writeFile(testFile, 'test content that is longer'); // > 20 bytes

      const criterion: FileExistsCriterion = {
        id: 'test-8',
        description: 'Test file size too large',
        type: 'file_exists',
        target: testFile,
        options: {
          maxSize: 10,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('should verify file permissions', async () => {
      const testFile = join(tempDir, 'test.txt');
      await writeFile(testFile, 'test content');

      // Note: On some systems, file permissions may vary
      // This test checks that the verifier can handle permission checks
      const criterion: FileExistsCriterion = {
        id: 'test-9',
        description: 'Test file permissions',
        type: 'file_exists',
        target: testFile,
        options: {
          permissions: 'r', // At least readable
        },
      };

      const result = await verifier.verify(criterion);

      // Should pass if file is readable (which it should be)
      expect(result.passed).toBe(true);
    });

    it('should fail when expecting directory but file exists', async () => {
      const testFile = join(tempDir, 'test.txt');
      await writeFile(testFile, 'test content');

      const criterion: FileExistsCriterion = {
        id: 'test-10',
        description: 'Test directory check fails',
        type: 'file_exists',
        target: testFile,
        options: {
          isDirectory: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Expected directory but found file');
    });

    it('should fail when expecting file but directory exists', async () => {
      const testDir = join(tempDir, 'test-dir');
      await mkdir(testDir);

      const criterion: FileExistsCriterion = {
        id: 'test-11',
        description: 'Test file check fails',
        type: 'file_exists',
        target: testDir,
        options: {
          isDirectory: false,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Expected file but found directory');
    });

    it('should handle glob patterns', async () => {
      // Create test files
      await writeFile(join(tempDir, 'test1.txt'), 'content1');
      await writeFile(join(tempDir, 'test2.txt'), 'content2');
      await writeFile(join(tempDir, 'other.js'), 'content3');

      const criterion: FileExistsCriterion = {
        id: 'test-12',
        description: 'Test glob pattern',
        type: 'file_exists',
        target: join(tempDir, '*.txt'),
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.summary).toContain('file(s) exist');
    });

    it('should handle recursive glob patterns', async () => {
      // Create nested directory structure
      const subDir = join(tempDir, 'subdir');
      await mkdir(subDir);
      await writeFile(join(subDir, 'test.ts'), 'content');
      await writeFile(join(tempDir, 'test.ts'), 'content');

      const criterion: FileExistsCriterion = {
        id: 'test-13',
        description: 'Test recursive glob',
        type: 'file_exists',
        target: join(tempDir, '**', '*.ts'),
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.summary).toContain('file(s) exist');
    });

    it('should handle invalid criterion type', async () => {
      const criterion = {
        id: 'test-14',
        description: 'Invalid type',
        type: 'regex' as const,
        target: 'test',
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Invalid criterion type');
    });

    it('should aggregate results for multiple files', async () => {
      // Create some files that exist and some that don't
      await writeFile(join(tempDir, 'exists1.txt'), 'content1');
      await writeFile(join(tempDir, 'exists2.txt'), 'content2');

      const criterion: FileExistsCriterion = {
        id: 'test-15',
        description: 'Test multiple files',
        type: 'file_exists',
        target: join(tempDir, '*.txt'),
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.summary).toContain('2 file(s)');
    });

    it('should handle errors gracefully', async () => {
      // Use an invalid path that might cause errors
      const invalidPath = '/invalid/path/that/does/not/exist/file.txt';

      const criterion: FileExistsCriterion = {
        id: 'test-16',
        description: 'Test error handling',
        type: 'file_exists',
        target: invalidPath,
      };

      const result = await verifier.verify(criterion);

      // Should not throw, but return a failed result
      expect(result.passed).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
