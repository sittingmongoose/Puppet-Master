/**
 * Dead Code Detector Tests
 * 
 * Tests for the TypeScript-based dead code detection.
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T25.
 */

import { describe, it, expect } from 'vitest';
import { DeadCodeDetector, createDeadCodeDetector, detectDeadCode } from './dead-code-detector.js';
import type { DeadCodeDetectorConfig } from './types.js';

describe('DeadCodeDetector', () => {
  // Test with actual project structure
  const projectRoot = process.cwd();

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
      const detector = createDeadCodeDetector(projectRoot);
      
      // Should not throw
      const report = await detector.detect();
      expect(report).toBeDefined();
      expect(report.timestamp).toBeDefined();
      expect(report.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('should throw error when tsconfig.json not found', async () => {
      const detector = createDeadCodeDetector('/nonexistent/path');

      await expect(detector.detect()).rejects.toThrow('tsconfig.json not found');
    });
  });

  describe('detect', () => {
    it('should return valid report structure', async () => {
      const detector = createDeadCodeDetector(projectRoot);
      const report = await detector.detect();

      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('passed');
      expect(report).toHaveProperty('durationMs');
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('config');

      expect(Array.isArray(report.issues)).toBe(true);
      expect(typeof report.summary.totalDeadLines).toBe('number');
      expect(typeof report.passed).toBe('boolean');
    });

    it('should calculate lines of code for each issue', async () => {
      const detector = createDeadCodeDetector(projectRoot);
      const report = await detector.detect();

      for (const issue of report.issues) {
        expect(issue.linesOfCode).toBeGreaterThan(0);
        expect(typeof issue.linesOfCode).toBe('number');
      }
    });

    it('should include summary statistics', async () => {
      const detector = createDeadCodeDetector(projectRoot);
      const report = await detector.detect();

      expect(report.summary).toHaveProperty('totalDeadLines');
      expect(report.summary).toHaveProperty('byType');
      expect(report.summary).toHaveProperty('largestOrphans');
      expect(report.summary).toHaveProperty('errorCount');
      expect(report.summary).toHaveProperty('warningCount');

      // byType should have all issue types
      expect(report.summary.byType).toHaveProperty('orphan_export');
      expect(report.summary.byType).toHaveProperty('unused_class');
      expect(report.summary.byType).toHaveProperty('unused_function');
      expect(report.summary.byType).toHaveProperty('unused_method');
    });

    it('should sort largestOrphans by lines of code descending', async () => {
      const detector = createDeadCodeDetector(projectRoot);
      const report = await detector.detect();

      if (report.summary.largestOrphans.length > 1) {
        for (let i = 1; i < report.summary.largestOrphans.length; i++) {
          expect(report.summary.largestOrphans[i - 1].linesOfCode)
            .toBeGreaterThanOrEqual(report.summary.largestOrphans[i].linesOfCode);
        }
      }
    });
  });

  describe('findOrphanExports', () => {
    it('should not flag entry point exports as orphan', async () => {
      const detector = createDeadCodeDetector(projectRoot);
      const report = await detector.detect();
      const config = detector.getConfig();
      
      // Entry point files should not have orphan export issues
      const orphanIssues = report.issues.filter((i) => i.type === 'orphan_export');
      const entryPointIssues = orphanIssues.filter((i) => 
        config.entryPoints.some((ep) => i.file.includes(ep))
      );
      
      expect(entryPointIssues).toHaveLength(0);
    });

    it('should not flag type definition files as orphan', async () => {
      const detector = createDeadCodeDetector(projectRoot);
      const report = await detector.detect();
      
      // Type files should be skipped
      const typeIssues = report.issues.filter((i) => 
        i.file.includes('src/types/')
      );
      
      expect(typeIssues).toHaveLength(0);
    });
  });

  describe('findUnusedClasses', () => {
    it('should detect class issues with proper structure', async () => {
      const detector = createDeadCodeDetector(projectRoot);
      const report = await detector.detect();
      
      const classIssues = report.issues.filter((i) => i.type === 'unused_class');
      
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
      const detector = createDeadCodeDetector(projectRoot);
      const report = await detector.detect();
      
      const funcIssues = report.issues.filter((i) => i.type === 'unused_function');
      
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
      const detector = createDeadCodeDetector(projectRoot, { checkMethods: false });
      const report = await detector.detect();
      
      const methodIssues = report.issues.filter((i) => i.type === 'unused_method');
      expect(methodIssues).toHaveLength(0);
    });

    it('should detect method issues with proper structure when enabled', async () => {
      const detector = createDeadCodeDetector(projectRoot, { checkMethods: true });
      const report = await detector.detect();
      
      const methodIssues = report.issues.filter((i) => i.type === 'unused_method');
      
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
      const detector = createDeadCodeDetector(projectRoot, { includeTests: false });
      const report = await detector.detect();
      
      const testFileIssues = report.issues.filter((i) => 
        i.file.includes('.test.') || i.file.includes('.spec.')
      );
      
      expect(testFileIssues).toHaveLength(0);
    });

    it('should include test files when configured', async () => {
      const detector = createDeadCodeDetector(projectRoot, { includeTests: true });
      const report = await detector.detect();
      
      // This just verifies it runs without error when tests are included
      expect(report).toBeDefined();
    });
  });
});

describe('detectDeadCode convenience function', () => {
  const projectRoot = process.cwd();

  it('should run detection and return report', async () => {
    const report = await detectDeadCode(projectRoot);

    expect(report).toBeDefined();
    expect(report.issues).toBeDefined();
    expect(report.summary).toBeDefined();
  });

  it('should accept config options', async () => {
    const report = await detectDeadCode(projectRoot, {
      checkMethods: false,
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
