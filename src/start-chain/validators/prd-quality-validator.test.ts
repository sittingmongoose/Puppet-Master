/**
 * Tests for PRD Quality Validator
 * 
 * Tests all 5 quality checks: verifiability, specificity, test completeness, traceability, structural sanity.
 */

import { describe, it, expect } from 'vitest';
import { PrdQualityValidator } from './prd-quality-validator.js';
import type { PRD } from '../../types/prd.js';
import type { ParsedRequirements } from '../../types/requirements.js';
import type { Criterion, TestPlan } from '../../types/tiers.js';

/**
 * Helper to create a minimal valid PRD.
 */
function createMinimalPRD(): PRD {
  return {
    project: 'test-project',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branchName: 'main',
    description: 'Test project',
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
}

/**
 * Helper to create a valid criterion.
 */
function createCriterion(
  id: string,
  description: string,
  type: Criterion['type'],
  target: string
): Criterion {
  return {
    id,
    description,
    type,
    target,
  };
}

/**
 * Helper to create a test plan.
 */
function createTestPlan(commands: string[]): TestPlan {
  return {
    commands: commands.map(cmd => ({ command: cmd })),
    failFast: false,
  };
}

/**
 * Helper to create a source reference.
 */
function createSourceRef(): { sourcePath: string; sectionPath: string; excerptHash: string } {
  return {
    sourcePath: 'requirements.md',
    sectionPath: 'Section 4.2',
    excerptHash: 'abc123',
  };
}

describe('PrdQualityValidator', () => {
  describe('Check 1: Verifiability', () => {
    it('should pass when all criteria have valid targets', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [
              createCriterion('C1', 'All unit tests pass with 100% coverage', 'command', 'npm test'),
              createCriterion('C2', 'File exists', 'file_exists', 'src/index.ts'),
            ],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
            sourceRefs: [createSourceRef()], // Add traceability to avoid that error
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator({ requireTraceability: false }); // Disable traceability check for this test
      const result = validator.validate(prd);

      // Debug: log errors if test fails
      if (!result.valid) {
        console.log('Errors:', JSON.stringify(result.errors, null, 2));
      }

      expect(result.valid).toBe(true);
      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_MISSING_TARGET')).toHaveLength(0);
    });

    it('should fail when criterion has missing target', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [
              createCriterion('C1', 'Test passes', 'command', 'npm test'),
              { id: 'C2', description: 'File exists', type: 'file_exists', target: '' }, // Missing target
            ],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator();
      const result = validator.validate(prd);

      expect(result.valid).toBe(false);
      const missingTargetErrors = result.errors.filter(e => e.code === 'PRD_QUALITY_MISSING_TARGET');
      expect(missingTargetErrors.length).toBeGreaterThan(0);
      expect(missingTargetErrors[0].path).toContain('acceptanceCriteria');
      expect(missingTargetErrors[0].suggestion).toBeDefined();
    });

    it('should fail when criterion has empty target string', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [
              { id: 'C1', description: 'Test', type: 'command', target: '   ' }, // Whitespace only
            ],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator();
      const result = validator.validate(prd);

      expect(result.valid).toBe(false);
      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_MISSING_TARGET').length).toBeGreaterThan(0);
    });
  });

  describe('Check 2: Specificity / Anti-Filler', () => {
    it('should warn on generic criteria but not fail if under threshold', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [
              createCriterion('C1', 'Implementation complete', 'command', 'npm test'), // Generic (1 out of 10 = 10% < 30%)
              createCriterion('C2', 'Specific test passes', 'command', 'npm test'),
              createCriterion('C3', 'Another specific test', 'command', 'npm test'),
              createCriterion('C4', 'Third specific test', 'command', 'npm test'),
              createCriterion('C5', 'Fourth specific test', 'command', 'npm test'),
              createCriterion('C6', 'Fifth specific test', 'command', 'npm test'),
              createCriterion('C7', 'Sixth specific test', 'command', 'npm test'),
              createCriterion('C8', 'Seventh specific test', 'command', 'npm test'),
              createCriterion('C9', 'Eighth specific test', 'command', 'npm test'),
              createCriterion('C10', 'Ninth specific test', 'command', 'npm test'),
            ],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
            sourceRefs: [createSourceRef()], // Add traceability
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator();
      const result = validator.validate(prd);

      // Should have warnings but not errors (1 generic out of 10 = 10% < 30% and < 5 absolute)
      expect(result.warnings.filter(w => w.code === 'PRD_QUALITY_GENERIC_CRITERIA').length).toBeGreaterThan(0);
      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_EXCESSIVE_FILLER').length).toBe(0);
    });

    it('should fail when generic criteria exceed percentage threshold', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [
              createCriterion('C1', 'Implementation complete', 'command', 'npm test'), // Generic
              createCriterion('C2', 'Code works', 'command', 'npm test'), // Generic
              createCriterion('C3', 'Tests pass', 'command', 'npm test'), // Generic
              createCriterion('C4', 'Feature complete', 'command', 'npm test'), // Generic
              createCriterion('C5', 'Specific requirement', 'command', 'npm test'),
            ],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator({ maxGenericCriteriaPercent: 30 });
      const result = validator.validate(prd);

      // 4 out of 5 = 80% > 30% threshold
      expect(result.valid).toBe(false);
      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_EXCESSIVE_FILLER').length).toBeGreaterThan(0);
    });

    it('should fail when generic criteria exceed absolute threshold', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [
              createCriterion('C1', 'Implementation complete', 'command', 'npm test'),
              createCriterion('C2', 'Code works', 'command', 'npm test'),
              createCriterion('C3', 'Tests pass', 'command', 'npm test'),
              createCriterion('C4', 'Feature complete', 'command', 'npm test'),
              createCriterion('C5', 'Done', 'command', 'npm test'),
              createCriterion('C6', 'Functionality works', 'command', 'npm test'),
            ],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator({ maxGenericCriteriaAbsolute: 5 });
      const result = validator.validate(prd);

      // 6 generic > 5 absolute threshold
      expect(result.valid).toBe(false);
      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_EXCESSIVE_FILLER').length).toBeGreaterThan(0);
    });

    it('should warn on TODO/tbd language', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [
              createCriterion('C1', 'TODO: figure out the details', 'command', 'npm test'),
              createCriterion('C2', 'Maybe we should do this', 'command', 'npm test'),
            ],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator();
      const result = validator.validate(prd);

      expect(result.warnings.filter(w => w.code === 'PRD_QUALITY_GENERIC_CRITERIA').length).toBeGreaterThan(0);
    });
  });

  describe('Check 3: Test Plan Completeness', () => {
    it('should fail when test plan is empty', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [createCriterion('C1', 'Test', 'command', 'npm test')],
            testPlan: { commands: [], failFast: false },
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator();
      const result = validator.validate(prd);

      expect(result.valid).toBe(false);
      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_EMPTY_TEST_PLAN').length).toBeGreaterThan(0);
    });

    it('should pass when test plan has commands', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [createCriterion('C1', 'Test', 'command', 'npm test')],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator();
      const result = validator.validate(prd);

      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_EMPTY_TEST_PLAN').length).toBe(0);
    });
  });

  describe('Check 4: Traceability', () => {
    it('should fail when traceability is required but missing', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [createCriterion('C1', 'Test', 'command', 'npm test')],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
            // No sourceRefs
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator({ requireTraceability: true });
      const result = validator.validate(prd);

      expect(result.valid).toBe(false);
      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_MISSING_TRACEABILITY').length).toBeGreaterThan(0);
    });

    it('should pass when traceability is present', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [createCriterion('C1', 'Test', 'command', 'npm test')],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
            sourceRefs: [createSourceRef()],
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator({ requireTraceability: true });
      const result = validator.validate(prd);

      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_MISSING_TRACEABILITY').length).toBe(0);
    });

    it('should pass when traceability is not required', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [createCriterion('C1', 'Test', 'command', 'npm test')],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
            // No sourceRefs
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator({ requireTraceability: false });
      const result = validator.validate(prd);

      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_MISSING_TRACEABILITY').length).toBe(0);
    });
  });

  describe('Check 5: Structural Sanity', () => {
    it('should fail when large document produces only 1 phase', () => {
      const largeText = 'x'.repeat(6000); // > 5000 chars
      const parsed: ParsedRequirements = {
        source: {
          path: 'requirements.md',
          format: 'markdown',
          size: largeText.length,
          lastModified: new Date().toISOString(),
        },
        title: 'Large Requirements',
        sections: [],
        extractedGoals: [],
        extractedConstraints: [],
        rawText: largeText,
        parseErrors: [],
      };

      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Only Phase',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [createCriterion('C1', 'Test', 'command', 'npm test')],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
            sourceRefs: [createSourceRef()],
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator({ largeDocThreshold: 5000, minPhasesForLargeDoc: 2 });
      const result = validator.validate(prd, parsed);

      // Should have error or warning about structural issue
      const structuralIssues = result.errors.filter(e => e.code === 'PRD_QUALITY_STRUCTURAL_ISSUE');
      const structuralWarnings = result.warnings.filter(w => w.code === 'PRD_QUALITY_STRUCTURAL_ISSUE');
      expect(structuralIssues.length + structuralWarnings.length).toBeGreaterThan(0);
    });

    it('should pass when large document has multiple phases', () => {
      const largeText = 'x'.repeat(6000);
      const parsed: ParsedRequirements = {
        source: {
          path: 'requirements.md',
          format: 'markdown',
          size: largeText.length,
          lastModified: new Date().toISOString(),
        },
        title: 'Large Requirements',
        sections: [],
        extractedGoals: [],
        extractedConstraints: [],
        rawText: largeText,
        parseErrors: [],
      };

      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [createCriterion('C1', 'Test', 'command', 'npm test')],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
            sourceRefs: [createSourceRef()],
          },
          {
            id: 'PH-002',
            title: 'Phase 2',
            description: 'Test phase 2',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [createCriterion('C2', 'Test', 'command', 'npm test')],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
            sourceRefs: [createSourceRef()],
          },
        ],
        metadata: { totalPhases: 2, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator({ largeDocThreshold: 5000, minPhasesForLargeDoc: 2 });
      const result = validator.validate(prd, parsed);

      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_STRUCTURAL_ISSUE').length).toBe(0);
    });
  });

  describe('Metrics', () => {
    it('should calculate metrics correctly', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [
              createCriterion('C1', 'Implementation complete', 'command', 'npm test'), // Generic
              createCriterion('C2', 'Specific test', 'command', 'npm test'),
            ],
            testPlan: createTestPlan(['npm test', 'npm run typecheck']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
            sourceRefs: [createSourceRef()],
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator();
      const result = validator.validate(prd);

      expect(result.metrics.totalCriteria).toBe(2);
      expect(result.metrics.genericCriteriaCount).toBe(1);
      expect(result.metrics.genericCriteriaPercent).toBe(50);
      expect(result.metrics.testCommandsCount).toBe(2);
      expect(result.metrics.itemsWithTraceability).toBe(1);
      expect(result.metrics.itemsWithoutTraceability).toBe(0);
    });
  });

  describe('Comprehensive Bad PRD Fixture', () => {
    it('should catch all quality issues in a deliberately bad PRD', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Bad Phase',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [
              { id: 'C1', description: 'Implementation complete', type: 'command', target: '' }, // Missing target
              createCriterion('C2', 'Code works', 'command', 'npm test'), // Generic
              createCriterion('C3', 'Tests pass', 'command', 'npm test'), // Generic
              createCriterion('C4', 'TODO: figure this out', 'command', 'npm test'), // TODO
            ],
            testPlan: { commands: [], failFast: false }, // Empty
            tasks: [
              {
                id: 'TK-001-001',
                phaseId: 'PH-001',
                title: 'Bad Task',
                description: 'Test task',
                status: 'pending',
                priority: 1,
                acceptanceCriteria: [createCriterion('C5', 'Done', 'command', 'npm test')], // Generic
                testPlan: { commands: [], failFast: false }, // Empty
                subtasks: [],
                createdAt: new Date().toISOString(),
                notes: '',
                // No traceability
              },
            ],
            createdAt: new Date().toISOString(),
            notes: '',
            // No traceability
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 1, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator({ requireTraceability: true });
      const result = validator.validate(prd);

      expect(result.valid).toBe(false);
      
      // Should have multiple error types
      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_MISSING_TARGET').length).toBeGreaterThan(0);
      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_EXCESSIVE_FILLER').length).toBeGreaterThan(0);
      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_EMPTY_TEST_PLAN').length).toBeGreaterThan(0);
      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_MISSING_TRACEABILITY').length).toBeGreaterThan(0);
      
      // Should have warnings for TODO
      expect(result.warnings.filter(w => w.code === 'PRD_QUALITY_GENERIC_CRITERIA').length).toBeGreaterThan(0);
    });
  });

  describe('Configurable Thresholds', () => {
    it('should respect custom maxGenericCriteriaPercent', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [
              createCriterion('C1', 'Implementation complete', 'command', 'npm test'), // Generic
              createCriterion('C2', 'Code works', 'command', 'npm test'), // Generic
              createCriterion('C3', 'Specific test', 'command', 'npm test'),
            ],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
            sourceRefs: [createSourceRef()],
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      // 2 out of 3 = 66.7% > 50% threshold
      const validator = new PrdQualityValidator({ maxGenericCriteriaPercent: 50 });
      const result = validator.validate(prd);

      expect(result.valid).toBe(false);
      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_EXCESSIVE_FILLER').length).toBeGreaterThan(0);
    });

    it('should respect custom requireTraceability setting', () => {
      const prd: PRD = {
        ...createMinimalPRD(),
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'Test phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [createCriterion('C1', 'Test', 'command', 'npm test')],
            testPlan: createTestPlan(['npm test']),
            tasks: [],
            createdAt: new Date().toISOString(),
            notes: '',
            // No traceability
          },
        ],
        metadata: { totalPhases: 1, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 },
      };

      const validator = new PrdQualityValidator({ requireTraceability: false });
      const result = validator.validate(prd);

      expect(result.errors.filter(e => e.code === 'PRD_QUALITY_MISSING_TRACEABILITY').length).toBe(0);
    });
  });
});
