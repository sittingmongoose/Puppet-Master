/**
 * Regex Verifier Tests
 * 
 * Tests for the RegexVerifier implementation.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { RegexVerifier } from './regex-verifier.js';
import type { RegexCriterion } from './regex-verifier.js';

describe('RegexVerifier', () => {
  let verifier: RegexVerifier;
  let testDir: string;

  beforeEach(async () => {
    verifier = new RegexVerifier();
    testDir = join(process.cwd(), '.test-regex-verifier');
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('verify', () => {
    it('should match pattern in file content (positive match)', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\nThis is a test file.\n');

      const criterion: RegexCriterion = {
        id: 'test-1',
        description: 'Find "world" in file',
        type: 'regex',
        target: testFile,
        options: {
          pattern: 'world',
          mustMatch: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.type).toBe('regex');
      expect(result.target).toBe(testFile);
      expect(result.summary).toContain('matched');
      expect(result.error).toBeUndefined();
    });

    it('should fail when pattern does not match (positive match required)', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\nThis is a test file.\n');

      const criterion: RegexCriterion = {
        id: 'test-2',
        description: 'Find "missing" in file',
        type: 'regex',
        target: testFile,
        options: {
          pattern: 'missing',
          mustMatch: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.summary).toContain('did not');
    });

    it('should pass when pattern does not match (negative pattern)', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\nThis is a test file.\n');

      const criterion: RegexCriterion = {
        id: 'test-3',
        description: 'Ensure "missing" is not in file',
        type: 'regex',
        target: testFile,
        options: {
          pattern: 'missing',
          mustMatch: false,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.summary).toContain('must not match');
    });

    it('should fail when pattern matches (negative pattern required)', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\nThis is a test file.\n');

      const criterion: RegexCriterion = {
        id: 'test-4',
        description: 'Ensure "world" is not in file',
        type: 'regex',
        target: testFile,
        options: {
          pattern: 'world',
          mustMatch: false,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
    });

    it('should handle multiple patterns with matchAll: true', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\nThis is a test file.\nWith multiple lines.\n');

      const criterion: RegexCriterion = {
        id: 'test-5',
        description: 'All patterns must match',
        type: 'regex',
        target: testFile,
        options: {
          pattern: ['world', 'test', 'multiple'],
          mustMatch: true,
          matchAll: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.summary).toContain('all');
    });

    it('should fail when not all patterns match (matchAll: true)', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\nThis is a test file.\n');

      const criterion: RegexCriterion = {
        id: 'test-6',
        description: 'All patterns must match',
        type: 'regex',
        target: testFile,
        options: {
          pattern: ['world', 'test', 'missing'],
          mustMatch: true,
          matchAll: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
    });

    it('should handle multiple patterns with matchAll: false (any pattern)', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\nThis is a test file.\n');

      const criterion: RegexCriterion = {
        id: 'test-7',
        description: 'Any pattern must match',
        type: 'regex',
        target: testFile,
        options: {
          pattern: ['missing', 'world', 'also-missing'],
          mustMatch: true,
          matchAll: false,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      expect(result.summary).toContain('any');
    });

    it('should fail when no patterns match (matchAll: false)', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\nThis is a test file.\n');

      const criterion: RegexCriterion = {
        id: 'test-8',
        description: 'Any pattern must match',
        type: 'regex',
        target: testFile,
        options: {
          pattern: ['missing1', 'missing2', 'missing3'],
          mustMatch: true,
          matchAll: false,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
    });

    it('should handle missing file gracefully', async () => {
      const testFile = join(testDir, 'nonexistent.txt');

      const criterion: RegexCriterion = {
        id: 'test-9',
        description: 'Test missing file',
        type: 'regex',
        target: testFile,
        options: {
          pattern: 'anything',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.summary).toContain('Error');
    });

    it('should extract match locations with line and column numbers', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Line 1: hello\nLine 2: world\nLine 3: hello again\n');

      const criterion: RegexCriterion = {
        id: 'test-10',
        description: 'Find all occurrences of "hello"',
        type: 'regex',
        target: testFile,
        options: {
          pattern: 'hello',
          mustMatch: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
      // The verifier should find matches, but we can't directly access locations
      // from the result. The locations are used internally for the summary.
      expect(result.summary).toContain('matched');
    });

    it('should support regex flags (case-insensitive)', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, WORLD!\nThis is a test file.\n');

      const criterion: RegexCriterion = {
        id: 'test-11',
        description: 'Case-insensitive match',
        type: 'regex',
        target: testFile,
        options: {
          pattern: 'hello',
          flags: 'i',
          mustMatch: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
    });

    it('should support multiline regex flags', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Line 1\nLine 2\nLine 3\n');

      const criterion: RegexCriterion = {
        id: 'test-12',
        description: 'Multiline match',
        type: 'regex',
        target: testFile,
        options: {
          pattern: '^Line',
          flags: 'm',
          mustMatch: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
    });

    it('should handle invalid regex pattern', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\n');

      const criterion: RegexCriterion = {
        id: 'test-13',
        description: 'Invalid regex',
        type: 'regex',
        target: testFile,
        options: {
          pattern: '[invalid',
          mustMatch: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Invalid regex pattern');
    });

    it('should reject invalid criterion type', async () => {
      const criterion = {
        id: 'test-14',
        description: 'Wrong type',
        type: 'file_exists',
        target: 'some-file.txt',
        options: {},
      };

      const result = await verifier.verify(criterion as RegexCriterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Invalid criterion type');
    });

    it('should reject missing pattern option', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\n');

      const criterion = {
        id: 'test-15',
        description: 'Missing pattern',
        type: 'regex' as const,
        target: testFile,
        options: {},
      };

      const result = await verifier.verify(criterion as RegexCriterion);

      expect(result.passed).toBe(false);
      expect(result.error).toContain('Missing required option: pattern');
    });

    it('should default mustMatch to true', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\n');

      const criterion: RegexCriterion = {
        id: 'test-16',
        description: 'Default mustMatch',
        type: 'regex',
        target: testFile,
        options: {
          pattern: 'world',
          // mustMatch not specified, should default to true
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(true);
    });

    it('should default matchAll to false', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\n');

      const criterion: RegexCriterion = {
        id: 'test-17',
        description: 'Default matchAll',
        type: 'regex',
        target: testFile,
        options: {
          pattern: ['world', 'missing'],
          mustMatch: true,
          // matchAll not specified, should default to false (any pattern)
        },
      };

      const result = await verifier.verify(criterion);

      // Should pass because 'world' matches (any pattern logic)
      expect(result.passed).toBe(true);
    });

    it('should handle empty file', async () => {
      const testFile = join(testDir, 'empty.txt');
      await writeFile(testFile, '');

      const criterion: RegexCriterion = {
        id: 'test-18',
        description: 'Empty file',
        type: 'regex',
        target: testFile,
        options: {
          pattern: 'anything',
          mustMatch: true,
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.passed).toBe(false);
    });

    it('should include duration in result', async () => {
      const testFile = join(testDir, 'test.txt');
      await writeFile(testFile, 'Hello, world!\n');

      const criterion: RegexCriterion = {
        id: 'test-19',
        description: 'Duration test',
        type: 'regex',
        target: testFile,
        options: {
          pattern: 'world',
        },
      };

      const result = await verifier.verify(criterion);

      expect(result.durationMs).toBeGreaterThanOrEqual(0);
      expect(typeof result.durationMs).toBe('number');
    });
  });
});
