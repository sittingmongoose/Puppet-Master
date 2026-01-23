/**
 * Coverage Validator Tests
 *
 * Comprehensive tests for the CoverageValidator class that validates
 * PRD coverage of source requirements documents.
 *
 * See P1-T02: Start Chain - Add Coverage Gate.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  CoverageValidator,
  DEFAULT_COVERAGE_CONFIG,
  type CoverageReport,
  type CoverageConfig,
} from './coverage-validator.js';
import type { ParsedRequirements, ParsedSection } from '../../types/requirements.js';
import type { PRD, Phase, Task, Subtask, SourceRef } from '../../types/prd.js';
import type { CoverageMetrics } from '../structure-detector.js';
import type { Criterion } from '../../types/tiers.js';

// ============================================================================
// Test Fixture Helpers
// ============================================================================

/**
 * Creates a test PRD with configurable options.
 */
function createTestPRD(options: {
  phasesCount?: number;
  hasSourceRefs?: boolean;
  genericCriteriaCount?: number;
  sectionPaths?: string[];
}): PRD {
  const {
    phasesCount = 2,
    hasSourceRefs = true,
    genericCriteriaCount = 0,
    sectionPaths = [],
  } = options;

  const phases: Phase[] = [];

  for (let i = 0; i < phasesCount; i++) {
    const phaseId = `PH-${String(i + 1).padStart(3, '0')}`;
    const phaseSourceRefs: SourceRef[] = hasSourceRefs && sectionPaths[i]
      ? [{
          sourcePath: '/test/requirements.md',
          sectionPath: sectionPaths[i],
          excerptHash: `hash-${i}`,
        }]
      : [];

    // Generate acceptance criteria, some generic if requested
    const acceptanceCriteria: Criterion[] = [];
    const genericCriteriaForThisPhase = Math.ceil(genericCriteriaCount / phasesCount);

    for (let g = 0; g < genericCriteriaForThisPhase; g++) {
      acceptanceCriteria.push({
        id: `${phaseId}-AC-${String(g + 1).padStart(3, '0')}`,
        description: g % 2 === 0 ? 'implementation complete' : 'tests pass',
        type: 'ai',
        target: 'AI_VERIFY:check',
      });
    }

    // Add a non-generic criterion
    acceptanceCriteria.push({
      id: `${phaseId}-AC-SPEC`,
      description: 'User can log in with valid credentials and see dashboard',
      type: 'command',
      target: 'TEST:npm run test:login',
    });

    const tasks: Task[] = [{
      id: `TK-${String(i + 1).padStart(3, '0')}-001`,
      phaseId,
      title: `Task ${i + 1}.1`,
      description: 'Task description',
      status: 'pending',
      priority: 1,
      acceptanceCriteria: [{
        id: `TK-${String(i + 1).padStart(3, '0')}-001-AC-001`,
        description: 'Task criterion met',
        type: 'command',
        target: 'TEST:npm test',
      }],
      testPlan: { commands: [], failFast: true },
      subtasks: [{
        id: `ST-${String(i + 1).padStart(3, '0')}-001-001`,
        taskId: `TK-${String(i + 1).padStart(3, '0')}-001`,
        title: `Subtask ${i + 1}.1.1`,
        description: 'Subtask description',
        status: 'pending',
        priority: 1,
        acceptanceCriteria: [{
          id: `ST-${String(i + 1).padStart(3, '0')}-001-001-AC-001`,
          description: 'Subtask criterion met',
          type: 'file_exists',
          target: 'FILE_VERIFY:src/file.ts',
        }],
        testPlan: { commands: [], failFast: true },
        iterations: [],
        maxIterations: 3,
        createdAt: new Date().toISOString(),
        notes: '',
        sourceRefs: hasSourceRefs && sectionPaths[i]
          ? [{
              sourcePath: '/test/requirements.md',
              sectionPath: sectionPaths[i],
              excerptHash: `subtask-hash-${i}`,
            }]
          : [],
      }],
      createdAt: new Date().toISOString(),
      notes: '',
      sourceRefs: hasSourceRefs && sectionPaths[i]
        ? [{
            sourcePath: '/test/requirements.md',
            sectionPath: sectionPaths[i],
            excerptHash: `task-hash-${i}`,
          }]
        : [],
    }];

    phases.push({
      id: phaseId,
      title: `Phase ${i + 1}`,
      description: `Phase ${i + 1} description`,
      status: 'pending',
      priority: i + 1,
      acceptanceCriteria,
      testPlan: { commands: [], failFast: true },
      tasks,
      createdAt: new Date().toISOString(),
      notes: '',
      sourceRefs: phaseSourceRefs,
    });
  }

  return {
    project: 'Test Project',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branchName: 'ralph/test-branch',
    description: 'Test project description',
    phases,
    metadata: {
      totalPhases: phasesCount,
      completedPhases: 0,
      totalTasks: phasesCount,
      completedTasks: 0,
      totalSubtasks: phasesCount,
      completedSubtasks: 0,
    },
  };
}

/**
 * Creates test parsed requirements with configurable options.
 */
function createTestParsedRequirements(options: {
  sectionsCount?: number;
  totalChars?: number;
  sectionTitles?: string[];
}): ParsedRequirements {
  const {
    sectionsCount = 3,
    totalChars = 5000,
    sectionTitles,
  } = options;

  const sections: ParsedSection[] = [];
  const contentPerSection = Math.floor(totalChars / sectionsCount);

  for (let i = 0; i < sectionsCount; i++) {
    const title = sectionTitles?.[i] || `Section ${i + 1}`;
    sections.push({
      title,
      content: 'x'.repeat(contentPerSection),
      level: 2,
      children: [],
    });
  }

  return {
    source: {
      path: '/test/requirements.md',
      format: 'markdown',
      size: totalChars,
      lastModified: new Date().toISOString(),
    },
    title: 'Test Requirements',
    sections,
    extractedGoals: ['Goal 1', 'Goal 2'],
    extractedConstraints: ['Constraint 1'],
    rawText: 'x'.repeat(totalChars),
    parseErrors: [],
  };
}

/**
 * Creates test coverage metrics with configurable options.
 */
function createTestMetrics(options: {
  totalChars?: number;
  coverageRatio?: number;
  phasesCount?: number;
  headingsCount?: number;
  bulletsCount?: number;
}): CoverageMetrics {
  const {
    totalChars = 5000,
    coverageRatio = 0.7,
    phasesCount = 2,
    headingsCount = 5,
    bulletsCount = 10,
  } = options;

  return {
    totalChars,
    parsedChars: Math.floor(totalChars * coverageRatio),
    coverageRatio,
    phasesCount,
    headingsCount,
    bulletsCount,
  };
}

// ============================================================================
// Test Suites
// ============================================================================

describe('CoverageValidator', () => {
  let validator: CoverageValidator;

  beforeEach(() => {
    validator = new CoverageValidator();
  });

  describe('constructor', () => {
    it('should use DEFAULT_COVERAGE_CONFIG when no config provided', () => {
      const defaultValidator = new CoverageValidator();
      // Validate defaults are applied by testing boundary conditions
      const parsed = createTestParsedRequirements({ sectionsCount: 5, totalChars: 6000 });
      const prd = createTestPRD({
        phasesCount: 2,
        hasSourceRefs: true,
        sectionPaths: ['Test Requirements > Section 1', 'Test Requirements > Section 2'],
      });
      const metrics = createTestMetrics({ totalChars: 6000, coverageRatio: 0.6, phasesCount: 2 });

      const result = defaultValidator.validateCoverage(parsed, prd, metrics);
      // With default minCoverageRatio of 0.5, 0.6 should pass
      expect(result.errors.some(e => e.code === 'COVERAGE_TOO_LOW')).toBe(false);
    });

    it('should merge custom config with defaults', () => {
      const customValidator = new CoverageValidator({ minCoverageRatio: 0.8 });
      const parsed = createTestParsedRequirements({ sectionsCount: 5, totalChars: 6000 });
      const prd = createTestPRD({
        phasesCount: 2,
        hasSourceRefs: true,
        sectionPaths: ['Test Requirements > Section 1', 'Test Requirements > Section 2'],
      });
      const metrics = createTestMetrics({ totalChars: 6000, coverageRatio: 0.6, phasesCount: 2 });

      const result = customValidator.validateCoverage(parsed, prd, metrics);
      // With custom minCoverageRatio of 0.8, 0.6 should fail
      expect(result.errors.some(e => e.code === 'COVERAGE_TOO_LOW')).toBe(true);
    });
  });

  describe('validateCoverage', () => {
    it('should pass for well-covered PRD', () => {
      const sectionTitles = ['Authentication', 'Database', 'API', 'UI', 'Deployment'];
      const sectionPaths = sectionTitles.map(t => `Test Requirements > ${t}`);

      const parsed = createTestParsedRequirements({
        sectionsCount: 5,
        totalChars: 8000,
        sectionTitles,
      });
      const prd = createTestPRD({
        phasesCount: 3,
        hasSourceRefs: true,
        sectionPaths: sectionPaths.slice(0, 3),
      });
      const metrics = createTestMetrics({
        totalChars: 8000,
        coverageRatio: 0.7,
        phasesCount: 3,
      });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when coverage ratio is too low for large docs', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 10, totalChars: 10000 });
      const prd = createTestPRD({ phasesCount: 2, hasSourceRefs: true });
      const metrics = createTestMetrics({
        totalChars: 10000,
        coverageRatio: 0.3,
        phasesCount: 2,
      });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'COVERAGE_TOO_LOW')).toBe(true);
      const error = result.errors.find(e => e.code === 'COVERAGE_TOO_LOW');
      expect(error?.message).toContain('30.0%');
      expect(error?.message).toContain('50.0%');
    });

    it('should fail when large doc has only 1 phase', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 10, totalChars: 15000 });
      const prd = createTestPRD({ phasesCount: 1, hasSourceRefs: true });
      const metrics = createTestMetrics({
        totalChars: 15000,
        coverageRatio: 0.7,
        phasesCount: 1,
      });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'COVERAGE_SINGLE_PHASE')).toBe(true);
      const error = result.errors.find(e => e.code === 'COVERAGE_SINGLE_PHASE');
      expect(error?.message).toContain('1 phase');
      expect(error?.message).toContain('15000 chars');
    });

    it('should fail when section coverage is below 30%', () => {
      // Create parsed requirements with many sections
      const sectionTitles = ['Auth', 'DB', 'API', 'UI', 'Deploy', 'Logging', 'Monitoring'];
      const parsed = createTestParsedRequirements({
        sectionsCount: 7,
        totalChars: 8000,
        sectionTitles,
      });

      // Create PRD with NO sourceRefs (won't cover any sections)
      const prd = createTestPRD({
        phasesCount: 2,
        hasSourceRefs: false, // This is key - no source refs means no coverage
      });

      const metrics = createTestMetrics({
        totalChars: 8000,
        coverageRatio: 0.7,
        phasesCount: 2,
      });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'COVERAGE_MISSING_SECTIONS')).toBe(true);
      const error = result.errors.find(e => e.code === 'COVERAGE_MISSING_SECTIONS');
      expect(error?.message).toContain('0.0%');
    });

    it('should warn when generic criteria exceed threshold', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 3, totalChars: 5000 });
      // Create PRD with 6 generic criteria (default max is 5)
      const prd = createTestPRD({
        phasesCount: 2,
        hasSourceRefs: true,
        genericCriteriaCount: 6,
        sectionPaths: ['Test Requirements > Section 1', 'Test Requirements > Section 2'],
      });
      const metrics = createTestMetrics({
        totalChars: 5000,
        coverageRatio: 0.7,
        phasesCount: 2,
      });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result.warnings.some(w => w.code === 'COVERAGE_GENERIC_CRITERIA')).toBe(true);
      const warning = result.warnings.find(w => w.code === 'COVERAGE_GENERIC_CRITERIA');
      expect(warning?.message).toContain('6 generic');
      expect(warning?.message).toContain('max 5');
    });

    it('should pass for small documents even with low coverage', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 2, totalChars: 3000 });
      const prd = createTestPRD({ phasesCount: 1, hasSourceRefs: true });
      const metrics = createTestMetrics({
        totalChars: 3000, // Below largeDocThreshold (5000)
        coverageRatio: 0.2, // Low coverage
        phasesCount: 1,
      });

      const result = validator.validateCoverage(parsed, prd, metrics);

      // Should NOT fail for coverage too low (below threshold)
      expect(result.errors.some(e => e.code === 'COVERAGE_TOO_LOW')).toBe(false);
      // Should NOT fail for single phase (below very large doc threshold)
      expect(result.errors.some(e => e.code === 'COVERAGE_SINGLE_PHASE')).toBe(false);
    });

    it('should respect custom config thresholds', () => {
      const customValidator = new CoverageValidator({
        minCoverageRatio: 0.8,
        largeDocThreshold: 3000,
        veryLargeDocThreshold: 6000,
        minPhasesForVeryLargeDoc: 3,
      });

      const parsed = createTestParsedRequirements({ sectionsCount: 5, totalChars: 4000 });
      const prd = createTestPRD({ phasesCount: 2, hasSourceRefs: true });
      const metrics = createTestMetrics({
        totalChars: 4000,
        coverageRatio: 0.6, // Below 0.8 threshold
        phasesCount: 2,
      });

      const result = customValidator.validateCoverage(parsed, prd, metrics);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'COVERAGE_TOO_LOW')).toBe(true);
    });

    it('should warn when section coverage is between 30% and 50%', () => {
      // Create parsed requirements with 5 sections
      const sectionTitles = ['Auth', 'DB', 'API', 'UI', 'Deploy'];
      const parsed = createTestParsedRequirements({
        sectionsCount: 5,
        totalChars: 8000,
        sectionTitles,
      });

      // Create PRD that covers 2 of 5 sections (40% coverage)
      const prd = createTestPRD({
        phasesCount: 2,
        hasSourceRefs: true,
        sectionPaths: ['Test Requirements > Auth', 'Test Requirements > DB'],
      });

      const metrics = createTestMetrics({
        totalChars: 8000,
        coverageRatio: 0.7,
        phasesCount: 2,
      });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result.warnings.some(w => w.code === 'COVERAGE_LOW_SECTION_COVERAGE')).toBe(true);
    });

    it('should accumulate multiple errors and warnings', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 10, totalChars: 15000 });
      const prd = createTestPRD({
        phasesCount: 1,
        hasSourceRefs: false,
        genericCriteriaCount: 8,
      });
      const metrics = createTestMetrics({
        totalChars: 15000,
        coverageRatio: 0.3,
        phasesCount: 1,
      });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result.valid).toBe(false);
      // Should have multiple errors
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
      expect(result.errors.some(e => e.code === 'COVERAGE_TOO_LOW')).toBe(true);
      expect(result.errors.some(e => e.code === 'COVERAGE_SINGLE_PHASE')).toBe(true);
    });
  });

  describe('generic criteria detection', () => {
    it('should detect "implementation complete" patterns', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 2, totalChars: 5000 });

      // Create PRD with generic criteria manually
      const prd = createTestPRD({ phasesCount: 1, hasSourceRefs: true });
      prd.phases[0].acceptanceCriteria = [
        { id: 'AC-1', description: 'implementation complete', type: 'ai', target: 'check' },
        { id: 'AC-2', description: 'Implementation Complete', type: 'ai', target: 'check' },
        { id: 'AC-3', description: 'IMPLEMENTATION COMPLETE', type: 'ai', target: 'check' },
        { id: 'AC-4', description: 'code complete', type: 'ai', target: 'check' },
        { id: 'AC-5', description: 'feature implemented', type: 'ai', target: 'check' },
        { id: 'AC-6', description: 'done', type: 'ai', target: 'check' },
      ];

      const metrics = createTestMetrics({ totalChars: 5000, coverageRatio: 0.7, phasesCount: 1 });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result.warnings.some(w => w.code === 'COVERAGE_GENERIC_CRITERIA')).toBe(true);
      const warning = result.warnings.find(w => w.code === 'COVERAGE_GENERIC_CRITERIA');
      expect(warning?.message).toContain('6 generic');
    });

    it('should detect "tests pass" patterns', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 2, totalChars: 5000 });

      const prd = createTestPRD({ phasesCount: 1, hasSourceRefs: true });
      prd.phases[0].acceptanceCriteria = [
        { id: 'AC-1', description: 'tests pass', type: 'ai', target: 'check' },
        { id: 'AC-2', description: 'all tests pass', type: 'ai', target: 'check' },
        { id: 'AC-3', description: 'no errors', type: 'ai', target: 'check' },
        { id: 'AC-4', description: 'no errors occur', type: 'ai', target: 'check' },
        { id: 'AC-5', description: 'verified', type: 'ai', target: 'check' },
        { id: 'AC-6', description: 'working', type: 'ai', target: 'check' },
      ];

      const metrics = createTestMetrics({ totalChars: 5000, coverageRatio: 0.7, phasesCount: 1 });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result.warnings.some(w => w.code === 'COVERAGE_GENERIC_CRITERIA')).toBe(true);
    });

    it('should not flag specific machine-verifiable criteria', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 2, totalChars: 5000 });

      const prd = createTestPRD({ phasesCount: 1, hasSourceRefs: true });
      prd.phases[0].acceptanceCriteria = [
        {
          id: 'AC-1',
          description: 'User can log in with valid credentials',
          type: 'command',
          target: 'TEST:npm run test:auth',
        },
        {
          id: 'AC-2',
          description: 'API returns 200 for GET /users',
          type: 'command',
          target: 'TEST:npm run test:api',
        },
        {
          id: 'AC-3',
          description: 'File src/index.ts exists',
          type: 'file_exists',
          target: 'FILE_VERIFY:src/index.ts',
        },
        {
          id: 'AC-4',
          description: 'Response time under 200ms',
          type: 'command',
          target: 'PERF_VERIFY:npm run perf',
        },
      ];

      const metrics = createTestMetrics({ totalChars: 5000, coverageRatio: 0.7, phasesCount: 1 });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result.warnings.some(w => w.code === 'COVERAGE_GENERIC_CRITERIA')).toBe(false);
    });

    it('should detect generic criteria in subtasks', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 2, totalChars: 5000 });

      const prd = createTestPRD({ phasesCount: 1, hasSourceRefs: true });
      // Add generic criteria to subtask
      prd.phases[0].tasks[0].subtasks[0].acceptanceCriteria = [
        { id: 'AC-1', description: 'implementation complete', type: 'ai', target: 'check' },
        { id: 'AC-2', description: 'tests pass', type: 'ai', target: 'check' },
        { id: 'AC-3', description: 'works as expected', type: 'ai', target: 'check' },
        { id: 'AC-4', description: 'functionality verified', type: 'ai', target: 'check' },
        { id: 'AC-5', description: 'all requirements met', type: 'ai', target: 'check' },
        { id: 'AC-6', description: 'everything works', type: 'ai', target: 'check' },
      ];

      const metrics = createTestMetrics({ totalChars: 5000, coverageRatio: 0.7, phasesCount: 1 });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result.warnings.some(w => w.code === 'COVERAGE_GENERIC_CRITERIA')).toBe(true);
    });

    it('should check target field for generic patterns', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 2, totalChars: 5000 });

      const prd = createTestPRD({ phasesCount: 1, hasSourceRefs: true });
      prd.phases[0].acceptanceCriteria = [
        { id: 'AC-1', description: 'Check status', type: 'ai', target: 'complete' },
        { id: 'AC-2', description: 'Verify result', type: 'ai', target: 'done' },
        { id: 'AC-3', description: 'Confirm', type: 'ai', target: 'implemented' },
        { id: 'AC-4', description: 'Status', type: 'ai', target: 'verified' },
        { id: 'AC-5', description: 'Check', type: 'ai', target: 'functional' },
        { id: 'AC-6', description: 'Result', type: 'ai', target: 'delivered' },
      ];

      const metrics = createTestMetrics({ totalChars: 5000, coverageRatio: 0.7, phasesCount: 1 });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result.warnings.some(w => w.code === 'COVERAGE_GENERIC_CRITERIA')).toBe(true);
    });
  });

  describe('computeCoverageReport', () => {
    it('should include all metrics', async () => {
      const sectionTitles = ['Auth', 'DB', 'API'];
      const sectionPaths = sectionTitles.map(t => `Test Requirements > ${t}`);

      const parsed = createTestParsedRequirements({
        sectionsCount: 3,
        totalChars: 6000,
        sectionTitles,
      });
      const prd = createTestPRD({
        phasesCount: 2,
        hasSourceRefs: true,
        sectionPaths: sectionPaths.slice(0, 2),
      });
      const metrics = createTestMetrics({
        totalChars: 6000,
        coverageRatio: 0.7,
        phasesCount: 2,
        headingsCount: 5,
        bulletsCount: 12,
      });

      const report = await validator.computeCoverageReport(parsed, prd, metrics);

      expect(report.sourceChars).toBe(6000);
      expect(report.coverageRatio).toBe(0.7);
      expect(report.headingsCount).toBe(5);
      expect(report.bulletsCount).toBe(12);
      expect(report.phasesCount).toBe(2);
      expect(report.totalRequirementSections).toBe(3);
      expect(report.timestamp).toBeDefined();
      expect(report.sourceDocument).toBe('/test/requirements.md');
    });

    it('should list missing requirements', async () => {
      const sectionTitles = ['Auth', 'DB', 'API', 'UI', 'Deploy'];
      const parsed = createTestParsedRequirements({
        sectionsCount: 5,
        totalChars: 8000,
        sectionTitles,
      });

      // Only cover 2 of 5 sections
      const prd = createTestPRD({
        phasesCount: 2,
        hasSourceRefs: true,
        sectionPaths: ['Test Requirements > Auth', 'Test Requirements > DB'],
      });

      const metrics = createTestMetrics({
        totalChars: 8000,
        coverageRatio: 0.7,
        phasesCount: 2,
      });

      const report = await validator.computeCoverageReport(parsed, prd, metrics);

      expect(report.missingRequirements.length).toBeGreaterThan(0);
      // Should have uncovered sections
      const uncoveredPaths = report.missingRequirements.map(m => m.sectionPath);
      expect(uncoveredPaths.some(p => p.includes('API'))).toBe(true);
      expect(uncoveredPaths.some(p => p.includes('UI'))).toBe(true);
      expect(uncoveredPaths.some(p => p.includes('Deploy'))).toBe(true);
    });

    it('should handle PRD with no sourceRefs', async () => {
      const sectionTitles = ['Section 1', 'Section 2', 'Section 3'];
      const parsed = createTestParsedRequirements({
        sectionsCount: 3,
        totalChars: 6000,
        sectionTitles,
      });

      const prd = createTestPRD({
        phasesCount: 2,
        hasSourceRefs: false, // No source refs
      });

      const metrics = createTestMetrics({
        totalChars: 6000,
        coverageRatio: 0.7,
        phasesCount: 2,
      });

      const report = await validator.computeCoverageReport(parsed, prd, metrics);

      // All sections should be missing
      expect(report.coveredRequirementSections).toBe(0);
      expect(report.sectionCoverageRatio).toBe(0);
      expect(report.missingRequirements).toHaveLength(3);
    });

    it('should calculate extracted chars from PRD content', async () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 2, totalChars: 5000 });
      const prd = createTestPRD({ phasesCount: 2, hasSourceRefs: true });
      const metrics = createTestMetrics({ totalChars: 5000, coverageRatio: 0.7, phasesCount: 2 });

      const report = await validator.computeCoverageReport(parsed, prd, metrics);

      expect(report.extractedChars).toBeGreaterThan(0);
    });

    it('should include generic criteria count and examples', async () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 2, totalChars: 5000 });
      const prd = createTestPRD({
        phasesCount: 1,
        hasSourceRefs: true,
        genericCriteriaCount: 4,
      });
      const metrics = createTestMetrics({ totalChars: 5000, coverageRatio: 0.7, phasesCount: 1 });

      const report = await validator.computeCoverageReport(parsed, prd, metrics);

      expect(report.genericCriteriaCount).toBe(4);
      expect(report.genericCriteriaExamples.length).toBeGreaterThan(0);
    });

    it('should set passed based on errors', async () => {
      // Scenario 1: Should pass
      const parsedGood = createTestParsedRequirements({ sectionsCount: 2, totalChars: 5000 });
      const prdGood = createTestPRD({
        phasesCount: 2,
        hasSourceRefs: true,
        sectionPaths: ['Test Requirements > Section 1', 'Test Requirements > Section 2'],
      });
      const metricsGood = createTestMetrics({
        totalChars: 5000,
        coverageRatio: 0.7,
        phasesCount: 2,
      });

      const reportGood = await validator.computeCoverageReport(parsedGood, prdGood, metricsGood);
      expect(reportGood.passed).toBe(true);
      expect(reportGood.errors).toHaveLength(0);

      // Scenario 2: Should fail
      const parsedBad = createTestParsedRequirements({ sectionsCount: 10, totalChars: 15000 });
      const prdBad = createTestPRD({ phasesCount: 1, hasSourceRefs: false });
      const metricsBad = createTestMetrics({
        totalChars: 15000,
        coverageRatio: 0.3,
        phasesCount: 1,
      });

      const reportBad = await validator.computeCoverageReport(parsedBad, prdBad, metricsBad);
      expect(reportBad.passed).toBe(false);
      expect(reportBad.errors.length).toBeGreaterThan(0);
    });

    it('should include warnings in report', async () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 3, totalChars: 5000 });
      const prd = createTestPRD({
        phasesCount: 2,
        hasSourceRefs: true,
        genericCriteriaCount: 8, // Exceeds threshold
      });
      const metrics = createTestMetrics({ totalChars: 5000, coverageRatio: 0.7, phasesCount: 2 });

      const report = await validator.computeCoverageReport(parsed, prd, metrics);

      expect(report.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('DEFAULT_COVERAGE_CONFIG', () => {
    it('should have expected default values', () => {
      expect(DEFAULT_COVERAGE_CONFIG.minCoverageRatio).toBe(0.5);
      expect(DEFAULT_COVERAGE_CONFIG.largeDocThreshold).toBe(5000);
      expect(DEFAULT_COVERAGE_CONFIG.veryLargeDocThreshold).toBe(10000);
      expect(DEFAULT_COVERAGE_CONFIG.minPhasesForVeryLargeDoc).toBe(2);
      expect(DEFAULT_COVERAGE_CONFIG.maxGenericCriteria).toBe(5);
      expect(DEFAULT_COVERAGE_CONFIG.enableAICoverageDiff).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty phases array', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 2, totalChars: 5000 });
      const prd: PRD = {
        project: 'Test',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        branchName: 'test',
        description: 'Test',
        phases: [],
        metadata: {
          totalPhases: 0,
          completedPhases: 0,
          totalTasks: 0,
          completedTasks: 0,
          totalSubtasks: 0,
          completedSubtasks: 0,
        },
      };
      const metrics = createTestMetrics({ totalChars: 5000, coverageRatio: 0.7, phasesCount: 0 });

      const result = validator.validateCoverage(parsed, prd, metrics);

      // Should not crash, but may have errors for missing sections
      expect(result).toBeDefined();
    });

    it('should handle empty sections array', () => {
      const parsed: ParsedRequirements = {
        source: {
          path: '/test/requirements.md',
          format: 'markdown',
          size: 0,
          lastModified: new Date().toISOString(),
        },
        title: 'Empty',
        sections: [],
        extractedGoals: [],
        extractedConstraints: [],
        rawText: '',
        parseErrors: [],
      };
      const prd = createTestPRD({ phasesCount: 2, hasSourceRefs: true });
      const metrics = createTestMetrics({ totalChars: 0, coverageRatio: 0, phasesCount: 2 });

      const result = validator.validateCoverage(parsed, prd, metrics);

      expect(result).toBeDefined();
    });

    it('should handle PRD with undefined acceptanceCriteria', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 2, totalChars: 5000 });
      const prd = createTestPRD({ phasesCount: 1, hasSourceRefs: true });

      // Remove acceptanceCriteria from all levels
      prd.phases[0].acceptanceCriteria = undefined as unknown as Criterion[];
      prd.phases[0].tasks[0].acceptanceCriteria = undefined as unknown as Criterion[];
      prd.phases[0].tasks[0].subtasks[0].acceptanceCriteria = undefined as unknown as Criterion[];

      const metrics = createTestMetrics({ totalChars: 5000, coverageRatio: 0.7, phasesCount: 1 });

      const result = validator.validateCoverage(parsed, prd, metrics);

      // Should not crash
      expect(result).toBeDefined();
      expect(result.warnings.some(w => w.code === 'COVERAGE_GENERIC_CRITERIA')).toBe(false);
    });

    it('should handle criteria with empty description and target', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 2, totalChars: 5000 });
      const prd = createTestPRD({ phasesCount: 1, hasSourceRefs: true });

      prd.phases[0].acceptanceCriteria = [
        { id: 'AC-1', description: '', type: 'ai', target: '' },
        { id: 'AC-2', description: '   ', type: 'ai', target: '   ' },
      ];

      const metrics = createTestMetrics({ totalChars: 5000, coverageRatio: 0.7, phasesCount: 1 });

      const result = validator.validateCoverage(parsed, prd, metrics);

      // Should not crash or flag empty strings as generic
      expect(result).toBeDefined();
    });

    it('should handle nested sections in requirements', () => {
      const parsed: ParsedRequirements = {
        source: {
          path: '/test/requirements.md',
          format: 'markdown',
          size: 5000,
          lastModified: new Date().toISOString(),
        },
        title: 'Nested Requirements',
        sections: [
          {
            title: 'Section 1',
            content: 'Content',
            level: 1,
            children: [
              {
                title: 'Section 1.1',
                content: 'Nested content',
                level: 2,
                children: [
                  {
                    title: 'Section 1.1.1',
                    content: 'Deep nested',
                    level: 3,
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
        extractedGoals: [],
        extractedConstraints: [],
        rawText: 'x'.repeat(5000),
        parseErrors: [],
      };

      const prd = createTestPRD({ phasesCount: 2, hasSourceRefs: false });
      const metrics = createTestMetrics({ totalChars: 5000, coverageRatio: 0.7, phasesCount: 2 });

      const result = validator.validateCoverage(parsed, prd, metrics);

      // Should count all 3 nested sections
      expect(result.errors.some(e => e.code === 'COVERAGE_MISSING_SECTIONS')).toBe(true);
    });

    it('should handle boundary values for coverage ratio', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 5, totalChars: 6000 });
      const prd = createTestPRD({ phasesCount: 2, hasSourceRefs: true });

      // Exactly at threshold (0.5)
      const metricsAtThreshold = createTestMetrics({
        totalChars: 6000,
        coverageRatio: 0.5,
        phasesCount: 2,
      });

      const resultAtThreshold = validator.validateCoverage(parsed, prd, metricsAtThreshold);
      expect(resultAtThreshold.errors.some(e => e.code === 'COVERAGE_TOO_LOW')).toBe(false);

      // Just below threshold (0.49)
      const metricsBelowThreshold = createTestMetrics({
        totalChars: 6000,
        coverageRatio: 0.49,
        phasesCount: 2,
      });

      const resultBelowThreshold = validator.validateCoverage(parsed, prd, metricsBelowThreshold);
      expect(resultBelowThreshold.errors.some(e => e.code === 'COVERAGE_TOO_LOW')).toBe(true);
    });

    it('should handle boundary values for document size', () => {
      const parsed = createTestParsedRequirements({ sectionsCount: 5, totalChars: 5000 });
      const prd = createTestPRD({ phasesCount: 2, hasSourceRefs: true });

      // Exactly at threshold (5000)
      const metricsAtThreshold = createTestMetrics({
        totalChars: 5000,
        coverageRatio: 0.4,
        phasesCount: 2,
      });

      const resultAtThreshold = validator.validateCoverage(parsed, prd, metricsAtThreshold);
      // At exactly 5000, should NOT trigger (need > 5000)
      expect(resultAtThreshold.errors.some(e => e.code === 'COVERAGE_TOO_LOW')).toBe(false);

      // Just above threshold (5001)
      const metricsAboveThreshold = createTestMetrics({
        totalChars: 5001,
        coverageRatio: 0.4,
        phasesCount: 2,
      });

      const resultAboveThreshold = validator.validateCoverage(parsed, prd, metricsAboveThreshold);
      expect(resultAboveThreshold.errors.some(e => e.code === 'COVERAGE_TOO_LOW')).toBe(true);
    });
  });

  describe('checkInventory', () => {
    it('should return undefined when inventory file does not exist', async () => {
      const result = await validator.checkInventory('/nonexistent/path');
      expect(result).toBeUndefined();
    });

    it('should return undefined for invalid project path', async () => {
      const result = await validator.checkInventory('');
      expect(result).toBeUndefined();
    });
  });
});

describe('CoverageValidator integration', () => {
  it('should work end-to-end with realistic data', async () => {
    const validator = new CoverageValidator();

    // Realistic requirements document
    const parsed: ParsedRequirements = {
      source: {
        path: '/project/REQUIREMENTS.md',
        format: 'markdown',
        size: 12000,
        lastModified: new Date().toISOString(),
      },
      title: 'E-Commerce Platform Requirements',
      sections: [
        {
          title: 'User Authentication',
          content: '- Users must be able to register with email\n- Password must be 8+ chars\n- Support OAuth2',
          level: 2,
          children: [],
        },
        {
          title: 'Product Catalog',
          content: '- Display products with images\n- Search and filter\n- Categories',
          level: 2,
          children: [],
        },
        {
          title: 'Shopping Cart',
          content: '- Add/remove items\n- Update quantities\n- Save cart',
          level: 2,
          children: [],
        },
        {
          title: 'Checkout',
          content: '- Multiple payment methods\n- Address validation\n- Order confirmation',
          level: 2,
          children: [],
        },
        {
          title: 'Admin Panel',
          content: '- Manage products\n- View orders\n- User management',
          level: 2,
          children: [],
        },
      ],
      extractedGoals: [
        'Build a scalable e-commerce platform',
        'Support 10,000 concurrent users',
      ],
      extractedConstraints: [
        'Must use TypeScript',
        'Deploy to AWS',
      ],
      rawText: 'x'.repeat(12000),
      parseErrors: [],
    };

    // PRD covering 4 of 5 sections
    const prd = createTestPRD({
      phasesCount: 4,
      hasSourceRefs: true,
      sectionPaths: [
        'E-Commerce Platform Requirements > User Authentication',
        'E-Commerce Platform Requirements > Product Catalog',
        'E-Commerce Platform Requirements > Shopping Cart',
        'E-Commerce Platform Requirements > Checkout',
      ],
    });

    const metrics = createTestMetrics({
      totalChars: 12000,
      coverageRatio: 0.75,
      phasesCount: 4,
      headingsCount: 6,
      bulletsCount: 15,
    });

    const report = await validator.computeCoverageReport(parsed, prd, metrics);

    expect(report.passed).toBe(true);
    expect(report.sourceChars).toBe(12000);
    expect(report.phasesCount).toBe(4);
    expect(report.totalRequirementSections).toBe(5);
    expect(report.coveredRequirementSections).toBe(4);
    expect(report.sectionCoverageRatio).toBe(0.8);
    expect(report.missingRequirements).toHaveLength(1);
    expect(report.missingRequirements[0].sectionPath).toContain('Admin Panel');
  });
});
