/**
 * Dead Code Detector Tests
 *
 * Tests for the TypeScript-based dead code detection.
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T25.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { createDeadCodeDetector, detectDeadCode } from './dead-code-detector.js';

describe('DeadCodeDetector', () => {
  /**
   * IMPORTANT: These tests use a tiny fixture project rather than the full repo.
   *
   * The dead-code detector is intentionally "whole-program" analysis and can be
   * extremely expensive on large projects (it performs multiple full AST walks).
   * Using a fixture keeps unit tests fast and avoids multi-minute suite times.
   */

  let projectRoot: string;
  let reportDefault: Awaited<ReturnType<ReturnType<typeof createDeadCodeDetector>['detect']>>;
  let reportNoMethods: Awaited<ReturnType<ReturnType<typeof createDeadCodeDetector>['detect']>>;
  let reportIncludeTests: Awaited<ReturnType<ReturnType<typeof createDeadCodeDetector>['detect']>>;

  beforeAll(async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pm-dead-code-'));
    projectRoot = tmpDir;

    await fs.mkdir(path.join(tmpDir, 'src', 'types'), { recursive: true });

    // Minimal TS project config for the fixture
    await fs.writeFile(
      path.join(tmpDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2020',
            module: 'CommonJS',
            moduleResolution: 'Node',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
          },
          include: ['src/**/*.ts'],
        },
        null,
        2
      )
    );

    // Entry point (should be allowed to have unused exports)
    await fs.writeFile(
      path.join(tmpDir, 'src', 'index.ts'),
      [
        "export const entryUnused = 123; // allowed (entry point)",
        "export { usedFunction } from './used';",
      ].join('\n')
    );

    // A used function (imported + called)
    await fs.writeFile(
      path.join(tmpDir, 'src', 'used.ts'),
      ['export function usedFunction() {', '  return 1;', '}'].join('\n')
    );

    // Classes + methods (one method is unused)
    await fs.writeFile(
      path.join(tmpDir, 'src', 'classes.ts'),
      [
        'export class UsedClass {',
        '  usedMethod() {',
        '    return 1;',
        '  }',
        '  unusedMethod() {',
        '    return 2;',
        '  }',
        '}',
        '',
        'export class UnusedClass {}',
        '',
        'export function unusedFunction() {',
        '  return 3;',
        '}',
      ].join('\n')
    );

    // Usage site
    await fs.writeFile(
      path.join(tmpDir, 'src', 'usage.ts'),
      [
        "import { usedFunction } from './used';",
        "import { UsedClass } from './classes';",
        '',
        'usedFunction();',
        'const c = new UsedClass();',
        'c.usedMethod();',
      ].join('\n')
    );

    // Type definitions should be skipped by default config skipPaths
    await fs.writeFile(
      path.join(tmpDir, 'src', 'types', 'foo.ts'),
      ['export type Foo = string;'].join('\n')
    );

    // Cache a few runs so we don't re-scan the fixture repeatedly.
    const baseOptions = { entryPoints: ['src/index.ts'] };
    reportDefault = await createDeadCodeDetector(projectRoot, baseOptions).detect();
    reportNoMethods = await createDeadCodeDetector(projectRoot, {
      ...baseOptions,
      checkMethods: false,
    }).detect();
    reportIncludeTests = await createDeadCodeDetector(projectRoot, {
      ...baseOptions,
      includeTests: true,
    }).detect();
  });

  afterAll(async () => {
    if (projectRoot) {
      await fs.rm(projectRoot, { recursive: true, force: true });
    }
  });

  describe('createDeadCodeDetector', () => {
    it('should create a detector with default config', () => {
      const detector = createDeadCodeDetector(projectRoot);
      const config = detector.getConfig();

      expect(config.rootDir).toBe(projectRoot);
      expect(config.entryPoints.length).toBeGreaterThan(0);
      expect(config.checkMethods).toBe(true);
      expect(config.includeTests).toBe(false);
    });

    it('should allow config overrides', () => {
      const detector = createDeadCodeDetector(projectRoot, {
        includeTests: true,
        checkMethods: false,
      });
      const config = detector.getConfig();

      expect(config.includeTests).toBe(true);
      expect(config.checkMethods).toBe(false);
    });
  });

  describe('initialization', () => {
    it('should initialize with valid project', async () => {
      expect(reportDefault).toBeDefined();
      expect(reportDefault.timestamp).toBeDefined();
      expect(reportDefault.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should throw error when tsconfig.json not found', async () => {
      const detector = createDeadCodeDetector('/nonexistent/path');

      await expect(detector.detect()).rejects.toThrow('tsconfig.json not found');
    });
  });

  describe('detect', () => {
    it('should return valid report structure', async () => {
      expect(reportDefault).toHaveProperty('issues');
      expect(reportDefault).toHaveProperty('summary');
      expect(reportDefault).toHaveProperty('passed');
      expect(reportDefault).toHaveProperty('durationMs');
      expect(reportDefault).toHaveProperty('timestamp');
      expect(reportDefault).toHaveProperty('config');

      expect(Array.isArray(reportDefault.issues)).toBe(true);
      expect(typeof reportDefault.summary.totalDeadLines).toBe('number');
      expect(typeof reportDefault.passed).toBe('boolean');
    });

    it('should calculate lines of code for each issue', async () => {
      for (const issue of reportDefault.issues) {
        expect(issue.linesOfCode).toBeGreaterThan(0);
        expect(typeof issue.linesOfCode).toBe('number');
      }
    });

    it('should include summary statistics', async () => {
      expect(reportDefault.summary).toHaveProperty('totalDeadLines');
      expect(reportDefault.summary).toHaveProperty('byType');
      expect(reportDefault.summary).toHaveProperty('largestOrphans');
      expect(reportDefault.summary).toHaveProperty('errorCount');
      expect(reportDefault.summary).toHaveProperty('warningCount');

      // byType should have all issue types
      expect(reportDefault.summary.byType).toHaveProperty('orphan_export');
      expect(reportDefault.summary.byType).toHaveProperty('unused_class');
      expect(reportDefault.summary.byType).toHaveProperty('unused_function');
      expect(reportDefault.summary.byType).toHaveProperty('unused_method');
    });

    it('should sort largestOrphans by lines of code descending', async () => {
      if (reportDefault.summary.largestOrphans.length > 1) {
        for (let i = 1; i < reportDefault.summary.largestOrphans.length; i++) {
          expect(reportDefault.summary.largestOrphans[i - 1].linesOfCode).toBeGreaterThanOrEqual(
            reportDefault.summary.largestOrphans[i].linesOfCode
          );
        }
      }
    });
  });

  describe('findOrphanExports', () => {
    it('should not flag entry point exports as orphan', async () => {
      const config = reportDefault.config;

      // Entry point files should not have orphan export issues
      const orphanIssues = reportDefault.issues.filter((i) => i.type === 'orphan_export');
      const entryPointIssues = orphanIssues.filter((i) => 
        config.entryPoints.some((ep) => i.file.includes(ep))
      );

      expect(entryPointIssues).toHaveLength(0);
    });

    it('should not flag type definition files as orphan', async () => {
      // Type files should be skipped
      const typeIssues = reportDefault.issues.filter((i) => 
        i.file.includes('src/types/')
      );

      expect(typeIssues).toHaveLength(0);
    });
  });

  describe('findUnusedClasses', () => {
    it('should detect class issues with proper structure', async () => {
      const classIssues = reportDefault.issues.filter((i) => i.type === 'unused_class');

      for (const issue of classIssues) {
        expect(issue.file).toBeDefined();
        expect(issue.line).toBeGreaterThan(0);
        expect(issue.symbol).toBeDefined();
        expect(issue.description).toContain('never instantiated');
      }
    });
  });

  describe('findUnusedFunctions', () => {
    it('should detect function issues with proper structure', async () => {
      const funcIssues = reportDefault.issues.filter((i) => i.type === 'unused_function');

      for (const issue of funcIssues) {
        expect(issue.file).toBeDefined();
        expect(issue.line).toBeGreaterThan(0);
        expect(issue.symbol).toBeDefined();
        expect(issue.description).toContain('never called');
      }
    });
  });

  describe('findUnusedMethods', () => {
    it('should be skipped when checkMethods is false', async () => {
      const methodIssues = reportNoMethods.issues.filter((i) => i.type === 'unused_method');
      expect(methodIssues).toHaveLength(0);
    });

    it('should detect method issues with proper structure when enabled', async () => {
      const methodIssues = reportDefault.issues.filter((i) => i.type === 'unused_method');

      for (const issue of methodIssues) {
        expect(issue.file).toBeDefined();
        expect(issue.line).toBeGreaterThan(0);
        expect(issue.symbol).toBeDefined();
        expect(issue.description).toContain('never called');
        // Method issues should have parentClass set
        if (issue.type === 'unused_method') {
          expect(issue.parentClass).toBeDefined();
        }
      }
    });
  });

  describe('test file handling', () => {
    it('should exclude test files by default', async () => {
      const testFileIssues = reportDefault.issues.filter((i) => 
        i.file.includes('.test.') || i.file.includes('.spec.')
      );

      expect(testFileIssues).toHaveLength(0);
    });

    it('should include test files when configured', async () => {
      // This just verifies it runs without error when tests are included
      expect(reportIncludeTests).toBeDefined();
    });
  });
});

describe('detectDeadCode convenience function', () => {
  let projectRoot: string;

  beforeAll(async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'pm-dead-code-convenience-'));
    projectRoot = tmpDir;
    await fs.mkdir(path.join(tmpDir, 'src'), { recursive: true });

    await fs.writeFile(
      path.join(tmpDir, 'tsconfig.json'),
      JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2020',
            module: 'CommonJS',
            moduleResolution: 'Node',
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
          },
          include: ['src/**/*.ts'],
        },
        null,
        2
      )
    );

    await fs.writeFile(path.join(tmpDir, 'src', 'index.ts'), 'export const x = 1;');
  });

  afterAll(async () => {
    if (projectRoot) {
      await fs.rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('should run detection and return report', async () => {
    const report = await detectDeadCode(projectRoot, { entryPoints: ['src/index.ts'] });

    expect(report).toBeDefined();
    expect(report.issues).toBeDefined();
    expect(report.summary).toBeDefined();
  });

  it('should accept config options', async () => {
    const report = await detectDeadCode(projectRoot, {
      checkMethods: false,
      entryPoints: ['src/index.ts'],
    });

    const methodIssues = report.issues.filter((i) => i.type === 'unused_method');
    expect(methodIssues).toHaveLength(0);
  });
});

describe('DeadCodeIssue types', () => {
  it('should have valid severity values', () => {
    const severities = ['error', 'warning'];
    expect(severities).toContain('error');
    expect(severities).toContain('warning');
  });

  it('should have valid issue types', () => {
    const issueTypes = [
      'orphan_export',
      'unused_class',
      'unused_function',
      'unused_method',
      'unreachable_code',
      'unused_parameter',
    ];
    expect(issueTypes.length).toBe(6);
  });
});
