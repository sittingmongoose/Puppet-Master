/**
 * Integration Path Validator Tests
 *
 * Tests for the integration path validation system.
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T27 for implementation details.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import {
  IntegrationPathValidator,
  validateIntegrationPaths,
  checkCriticalPaths,
} from './integration-path-validator.js';
import type { IntegrationPath } from './integration-path-matrix.js';

/**
 * Create a temporary directory for test fixtures.
 */
async function createTempDir(): Promise<string> {
  const tempDir = path.join(os.tmpdir(), `integration-path-test-${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Clean up a temporary directory.
 */
async function cleanupTempDir(tempDir: string): Promise<void> {
  try {
    await fs.rm(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

/**
 * Create a test file with the given content.
 */
async function createTestFile(
  baseDir: string,
  relativePath: string,
  content: string
): Promise<string> {
  const fullPath = path.join(baseDir, relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, content);
  return fullPath;
}

describe('IntegrationPathValidator', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir();
  });

  afterEach(async () => {
    await cleanupTempDir(tempDir);
  });

  describe('validatePath', () => {
    it('returns failure when test file does not exist', async () => {
      const testPath: IntegrationPath = {
        id: 'TEST-001',
        name: 'Test Path',
        description: 'A test integration path',
        category: 'cli',
        startPoint: 'Start',
        endPoint: 'End',
        criticalComponents: ['src/some-file.ts'],
        testFile: 'tests/integration/missing.test.ts',
        testPattern: 'should.*work',
        priority: 'p0',
      };

      const validator = new IntegrationPathValidator({
        projectRoot: tempDir,
        paths: [testPath],
      });

      const result = await validator.validatePath(testPath);

      expect(result.passed).toBe(false);
      expect(result.testFileExists).toBe(false);
      expect(result.error).toContain('Test file not found');
    });

    it('returns success when test file has matching tests', async () => {
      const testFile = 'tests/integration/sample.test.ts';
      const testContent = `
        import { describe, it, expect } from 'vitest';

        describe('Sample Integration', () => {
          it('should work correctly', () => {
            expect(true).toBe(true);
          });

          it('should handle errors', () => {
            expect(false).toBe(false);
          });
        });
      `;

      await createTestFile(tempDir, testFile, testContent);

      const testPath: IntegrationPath = {
        id: 'TEST-001',
        name: 'Test Path',
        description: 'A test integration path',
        category: 'cli',
        startPoint: 'Start',
        endPoint: 'End',
        criticalComponents: ['src/some-file.ts'],
        testFile,
        testPattern: 'should.*work',
        priority: 'p0',
      };

      const validator = new IntegrationPathValidator({
        projectRoot: tempDir,
        paths: [testPath],
      });

      const result = await validator.validatePath(testPath);

      expect(result.passed).toBe(true);
      expect(result.testFileExists).toBe(true);
      expect(result.matchingTests).toContain('should work correctly');
      expect(result.error).toBeUndefined();
    });

    it('returns failure when no tests match pattern', async () => {
      const testFile = 'tests/integration/sample.test.ts';
      const testContent = `
        import { describe, it, expect } from 'vitest';

        describe('Sample Integration', () => {
          it('does something', () => {
            expect(true).toBe(true);
          });
        });
      `;

      await createTestFile(tempDir, testFile, testContent);

      const testPath: IntegrationPath = {
        id: 'TEST-001',
        name: 'Test Path',
        description: 'A test integration path',
        category: 'cli',
        startPoint: 'Start',
        endPoint: 'End',
        criticalComponents: ['src/some-file.ts'],
        testFile,
        testPattern: 'should.*upload',
        priority: 'p0',
      };

      const validator = new IntegrationPathValidator({
        projectRoot: tempDir,
        paths: [testPath],
      });

      const result = await validator.validatePath(testPath);

      expect(result.passed).toBe(false);
      expect(result.testFileExists).toBe(true);
      expect(result.matchingTests).toHaveLength(0);
      expect(result.error).toContain('No tests matching pattern');
    });

    it('excludes skipped tests by default', async () => {
      const testFile = 'tests/integration/sample.test.ts';
      const testContent = `
        import { describe, it, expect } from 'vitest';

        describe('Sample Integration', () => {
          it.skip('should work correctly', () => {
            expect(true).toBe(true);
          });
        });
      `;

      await createTestFile(tempDir, testFile, testContent);

      const testPath: IntegrationPath = {
        id: 'TEST-001',
        name: 'Test Path',
        description: 'A test integration path',
        category: 'cli',
        startPoint: 'Start',
        endPoint: 'End',
        criticalComponents: ['src/some-file.ts'],
        testFile,
        testPattern: 'should.*work',
        priority: 'p0',
      };

      const validator = new IntegrationPathValidator({
        projectRoot: tempDir,
        paths: [testPath],
      });

      const result = await validator.validatePath(testPath);

      expect(result.passed).toBe(false);
      expect(result.matchingTests).toHaveLength(0);
    });

    it('includes skipped tests when configured', async () => {
      const testFile = 'tests/integration/sample.test.ts';
      const testContent = `
        import { describe, it, expect } from 'vitest';

        describe('Sample Integration', () => {
          it.skip('should work correctly', () => {
            expect(true).toBe(true);
          });
        });
      `;

      await createTestFile(tempDir, testFile, testContent);

      const testPath: IntegrationPath = {
        id: 'TEST-001',
        name: 'Test Path',
        description: 'A test integration path',
        category: 'cli',
        startPoint: 'Start',
        endPoint: 'End',
        criticalComponents: ['src/some-file.ts'],
        testFile,
        testPattern: 'should.*work',
        priority: 'p0',
      };

      const validator = new IntegrationPathValidator({
        projectRoot: tempDir,
        paths: [testPath],
        includeSkipped: true,
      });

      const result = await validator.validatePath(testPath);

      expect(result.passed).toBe(true);
      expect(result.matchingTests).toContain('should work correctly');
      expect(result.warning).toContain('skipped');
    });

    it('handles test() style test declarations', async () => {
      const testFile = 'tests/integration/sample.test.ts';
      const testContent = `
        import { describe, test, expect } from 'vitest';

        describe('Sample Integration', () => {
          test('wizard uploads correctly', () => {
            expect(true).toBe(true);
          });
        });
      `;

      await createTestFile(tempDir, testFile, testContent);

      const testPath: IntegrationPath = {
        id: 'TEST-001',
        name: 'Test Path',
        description: 'A test integration path',
        category: 'gui',
        startPoint: 'Start',
        endPoint: 'End',
        criticalComponents: ['src/some-file.ts'],
        testFile,
        testPattern: 'wizard.*upload',
        priority: 'p0',
      };

      const validator = new IntegrationPathValidator({
        projectRoot: tempDir,
        paths: [testPath],
      });

      const result = await validator.validatePath(testPath);

      expect(result.passed).toBe(true);
      expect(result.matchingTests).toContain('wizard uploads correctly');
    });
  });

  describe('validateAll', () => {
    it('validates multiple paths', async () => {
      // Create test files
      const testFile1 = 'tests/integration/path1.test.ts';
      const testFile2 = 'tests/integration/path2.test.ts';

      await createTestFile(
        tempDir,
        testFile1,
        `
        import { describe, it, expect } from 'vitest';
        describe('Path 1', () => {
          it('should upload files', () => {});
        });
      `
      );

      await createTestFile(
        tempDir,
        testFile2,
        `
        import { describe, it, expect } from 'vitest';
        describe('Path 2', () => {
          it('should start execution', () => {});
        });
      `
      );

      const paths: IntegrationPath[] = [
        {
          id: 'TEST-001',
          name: 'Path 1',
          description: 'Test path 1',
          category: 'gui',
          startPoint: 'Start',
          endPoint: 'End',
          criticalComponents: [],
          testFile: testFile1,
          testPattern: 'upload',
          priority: 'p0',
        },
        {
          id: 'TEST-002',
          name: 'Path 2',
          description: 'Test path 2',
          category: 'cli',
          startPoint: 'Start',
          endPoint: 'End',
          criticalComponents: [],
          testFile: testFile2,
          testPattern: 'start.*execution',
          priority: 'p0',
        },
      ];

      const validator = new IntegrationPathValidator({
        projectRoot: tempDir,
        paths,
      });

      const result = await validator.validateAll();

      expect(result.passed).toBe(true);
      expect(result.summary.totalPaths).toBe(2);
      expect(result.summary.passedPaths).toBe(2);
      expect(result.summary.p0Passed).toBe(2);
      expect(result.summary.p0Total).toBe(2);
    });

    it('fails if any P0 path is missing tests', async () => {
      const testFile1 = 'tests/integration/path1.test.ts';

      await createTestFile(
        tempDir,
        testFile1,
        `
        import { describe, it, expect } from 'vitest';
        describe('Path 1', () => {
          it('should upload files', () => {});
        });
      `
      );

      const paths: IntegrationPath[] = [
        {
          id: 'TEST-001',
          name: 'Path 1',
          description: 'Test path 1',
          category: 'gui',
          startPoint: 'Start',
          endPoint: 'End',
          criticalComponents: [],
          testFile: testFile1,
          testPattern: 'upload',
          priority: 'p0',
        },
        {
          id: 'TEST-002',
          name: 'Path 2 (missing)',
          description: 'Test path 2',
          category: 'cli',
          startPoint: 'Start',
          endPoint: 'End',
          criticalComponents: [],
          testFile: 'tests/integration/missing.test.ts',
          testPattern: 'start',
          priority: 'p0',
        },
      ];

      const validator = new IntegrationPathValidator({
        projectRoot: tempDir,
        paths,
      });

      const result = await validator.validateAll();

      expect(result.passed).toBe(false);
      expect(result.summary.p0Passed).toBe(1);
      expect(result.summary.p0Total).toBe(2);
    });

    it('passes if P1 paths are missing but all P0 paths have tests', async () => {
      const testFile1 = 'tests/integration/path1.test.ts';

      await createTestFile(
        tempDir,
        testFile1,
        `
        import { describe, it, expect } from 'vitest';
        describe('Path 1', () => {
          it('should upload files', () => {});
        });
      `
      );

      const paths: IntegrationPath[] = [
        {
          id: 'TEST-001',
          name: 'Path 1 (P0)',
          description: 'Test path 1',
          category: 'gui',
          startPoint: 'Start',
          endPoint: 'End',
          criticalComponents: [],
          testFile: testFile1,
          testPattern: 'upload',
          priority: 'p0',
        },
        {
          id: 'TEST-002',
          name: 'Path 2 (P1 missing)',
          description: 'Test path 2',
          category: 'cli',
          startPoint: 'Start',
          endPoint: 'End',
          criticalComponents: [],
          testFile: 'tests/integration/missing.test.ts',
          testPattern: 'start',
          priority: 'p1',
        },
      ];

      const validator = new IntegrationPathValidator({
        projectRoot: tempDir,
        paths,
      });

      const result = await validator.validateAll();

      expect(result.passed).toBe(true);
      expect(result.summary.p0Passed).toBe(1);
      expect(result.summary.p0Total).toBe(1);
      expect(result.summary.p1Passed).toBe(0);
      expect(result.summary.p1Total).toBe(1);
    });
  });

  describe('generateReport', () => {
    it('generates a markdown report', async () => {
      const testFile = 'tests/integration/sample.test.ts';
      await createTestFile(
        tempDir,
        testFile,
        `
        import { describe, it, expect } from 'vitest';
        describe('Sample', () => {
          it('should work', () => {});
        });
      `
      );

      const paths: IntegrationPath[] = [
        {
          id: 'TEST-001',
          name: 'Test Path',
          description: 'A test integration path',
          category: 'gui',
          startPoint: 'Start',
          endPoint: 'End',
          criticalComponents: ['src/some-file.ts'],
          testFile,
          testPattern: 'should.*work',
          priority: 'p0',
        },
      ];

      const validator = new IntegrationPathValidator({
        projectRoot: tempDir,
        paths,
      });

      const result = await validator.validateAll();
      const report = validator.generateReport(result);

      expect(report).toContain('# Integration Path Test Coverage Report');
      expect(report).toContain('## Summary');
      expect(report).toContain('P0 (Critical)');
      expect(report).toContain('TEST-001');
      expect(report).toContain('✅');
    });

    it('shows failures in report', async () => {
      const paths: IntegrationPath[] = [
        {
          id: 'TEST-001',
          name: 'Test Path',
          description: 'A test integration path',
          category: 'gui',
          startPoint: 'Start',
          endPoint: 'End',
          criticalComponents: ['src/some-file.ts'],
          testFile: 'tests/missing.test.ts',
          testPattern: 'should.*work',
          priority: 'p0',
        },
      ];

      const validator = new IntegrationPathValidator({
        projectRoot: tempDir,
        paths,
      });

      const result = await validator.validateAll();
      const report = validator.generateReport(result);

      expect(report).toContain('❌');
      expect(report).toContain('FAILED');
      expect(report).toContain('Test file not found');
    });
  });

  describe('saveReport', () => {
    it('saves report to .puppet-master/audits/', async () => {
      const testFile = 'tests/integration/sample.test.ts';
      await createTestFile(
        tempDir,
        testFile,
        `
        import { describe, it, expect } from 'vitest';
        describe('Sample', () => {
          it('should work', () => {});
        });
      `
      );

      const paths: IntegrationPath[] = [
        {
          id: 'TEST-001',
          name: 'Test Path',
          description: 'A test integration path',
          category: 'gui',
          startPoint: 'Start',
          endPoint: 'End',
          criticalComponents: [],
          testFile,
          testPattern: 'should.*work',
          priority: 'p0',
        },
      ];

      const validator = new IntegrationPathValidator({
        projectRoot: tempDir,
        paths,
      });

      const result = await validator.validateAll();
      const reportPath = await validator.saveReport(result);

      // Check markdown report exists
      expect(reportPath).toContain('integration-paths.md');
      const reportContent = await fs.readFile(reportPath, 'utf8');
      expect(reportContent).toContain('Integration Path Test Coverage Report');

      // Check JSON report exists
      const jsonPath = path.join(tempDir, '.puppet-master', 'audits', 'integration-paths.json');
      const jsonContent = await fs.readFile(jsonPath, 'utf8');
      const jsonResult = JSON.parse(jsonContent);
      expect(jsonResult.passed).toBe(true);
    });
  });

  describe('convenience functions', () => {
    it('validateIntegrationPaths works', async () => {
      const testFile = 'tests/integration/sample.test.ts';
      await createTestFile(
        tempDir,
        testFile,
        `
        import { describe, it, expect } from 'vitest';
        describe('Sample', () => {
          it('should work', () => {});
        });
      `
      );

      const result = await validateIntegrationPaths(tempDir, {
        paths: [
          {
            id: 'TEST-001',
            name: 'Test',
            description: 'Test',
            category: 'cli',
            startPoint: 'Start',
            endPoint: 'End',
            criticalComponents: [],
            testFile,
            testPattern: 'work',
            priority: 'p0',
          },
        ],
      });

      expect(result.passed).toBe(true);
    });

    it('checkCriticalPaths returns missing paths', async () => {
      // Don't create any test files - all critical paths will be missing
      const result = await checkCriticalPaths(tempDir);

      expect(result.passed).toBe(false);
      expect(result.missingPaths.length).toBeGreaterThan(0);
      expect(result.missingPaths.every((p) => p.priority === 'p0')).toBe(true);
    });
  });
});
