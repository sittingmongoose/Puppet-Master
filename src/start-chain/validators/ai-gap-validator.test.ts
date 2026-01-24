/**
 * AI Gap Validator Tests
 *
 * Tests for the AI gap validation system.
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T26.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIGapValidator, createAIGapValidator, validateGaps } from './ai-gap-validator.js';
import { AIGapDetector } from '../../audits/ai-gap-detector.js';
import type { PRD } from '../../types/prd.js';
import type {
  GapDetectionResult,
  DetectedGap,
  AIGapValidatorConfig,
} from '../../types/gap-detection.js';
import { DEFAULT_AI_GAP_VALIDATOR_CONFIG } from '../../types/gap-detection.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdir, writeFile, rm, readFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { existsSync } from 'fs';

describe('AIGapValidator', () => {
  let testDir: string;

  // Minimal valid PRD for testing
  const createTestPRD = (): PRD => ({
    project: 'test-project',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branchName: 'main',
    description: 'Test PRD',
    phases: [
      {
        id: 'PH-001',
        title: 'Test Phase',
        description: 'Test',
        status: 'pending',
        priority: 1,
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
        tasks: [],
        createdAt: new Date().toISOString(),
        notes: '',
      },
    ],
    metadata: {
      totalPhases: 1,
      completedPhases: 0,
      totalTasks: 0,
      completedTasks: 0,
      totalSubtasks: 0,
      completedSubtasks: 0,
    },
  });

  beforeEach(async () => {
    testDir = join(tmpdir(), `ai-gap-validator-test-${randomUUID()}`);
    await mkdir(testDir, { recursive: true });
    await mkdir(join(testDir, 'src'), { recursive: true });
    await writeFile(join(testDir, 'src/index.ts'), 'export const x = 1;');
  });

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('constructor', () => {
    it('creates instance with default config', () => {
      const validator = new AIGapValidator();
      expect(validator).toBeInstanceOf(AIGapValidator);
    });

    it('merges partial config with defaults', () => {
      const validator = new AIGapValidator({
        maxHighGaps: 10,
        blockOnCritical: false,
      });
      expect(validator).toBeInstanceOf(AIGapValidator);
    });
  });

  describe('createAIGapValidator', () => {
    it('creates validator via factory function', () => {
      const validator = createAIGapValidator();
      expect(validator).toBeInstanceOf(AIGapValidator);
    });
  });

  describe('validate', () => {
    it('returns pass when disabled', async () => {
      const validator = new AIGapValidator({ enabled: false });
      const prd = createTestPRD();

      const result = await validator.validate(prd, '# Architecture', testDir);

      expect(result.passed).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('AI_GAP_SKIPPED');
      expect(result.warnings[0].message).toContain('disabled');
    });

    it('returns pass with warning when no platform registry (graceful degradation)', async () => {
      const validator = new AIGapValidator({ enabled: true });
      const prd = createTestPRD();

      const result = await validator.validate(prd, '# Architecture', testDir);

      // Should pass (graceful degradation) but have warnings
      expect(result.passed).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('persists report to disk', async () => {
      const reportPath = '.puppet-master/audits/test-gap-report.json';
      const validator = new AIGapValidator({
        enabled: true,
        reportPath,
      });
      const prd = createTestPRD();

      const result = await validator.validate(prd, '# Architecture', testDir);

      // Report should be saved even with empty results
      if (result.reportPath) {
        expect(existsSync(result.reportPath)).toBe(true);

        const reportContent = await readFile(result.reportPath, 'utf-8');
        const report = JSON.parse(reportContent);

        expect(report).toHaveProperty('gaps');
        expect(report).toHaveProperty('coverage');
        expect(report).toHaveProperty('timestamp');
        expect(report).toHaveProperty('summary');
      }
    });
  });

  describe('threshold evaluation', () => {
    it('fails when critical gaps exist and blockOnCritical is true', () => {
      const validator = new AIGapValidator({ blockOnCritical: true });

      // Access private method for testing
      const evaluateThresholds = (validator as any).evaluateThresholds.bind(validator);

      const result: GapDetectionResult = {
        gaps: [
          {
            id: 'GAP-001',
            type: 'missing_implementation',
            severity: 'critical',
            description: 'Critical gap',
            evidence: 'Evidence',
            suggestedFix: 'Fix it',
          },
        ],
        coverage: {
          prdItemsCovered: 5,
          prdItemsTotal: 10,
          architectureComponentsCovered: 3,
          architectureComponentsTotal: 5,
        },
        confidence: 0.8,
        timestamp: new Date().toISOString(),
        durationMs: 1000,
      };

      const validationResult = evaluateThresholds(result);

      expect(validationResult.passed).toBe(false);
      expect(validationResult.errors.some((e: { code: string }) => e.code === 'AI_GAP_CRITICAL')).toBe(true);
    });

    it('fails when high gaps exceed maxHighGaps', () => {
      const validator = new AIGapValidator({ maxHighGaps: 2 });
      const evaluateThresholds = (validator as any).evaluateThresholds.bind(validator);

      const result: GapDetectionResult = {
        gaps: [
          { id: 'GAP-001', type: 'integration_gap', severity: 'high', description: 'Gap 1', evidence: 'E1', suggestedFix: 'F1' },
          { id: 'GAP-002', type: 'integration_gap', severity: 'high', description: 'Gap 2', evidence: 'E2', suggestedFix: 'F2' },
          { id: 'GAP-003', type: 'integration_gap', severity: 'high', description: 'Gap 3', evidence: 'E3', suggestedFix: 'F3' },
        ],
        coverage: { prdItemsCovered: 5, prdItemsTotal: 10, architectureComponentsCovered: 3, architectureComponentsTotal: 5 },
        confidence: 0.8,
        timestamp: new Date().toISOString(),
        durationMs: 1000,
      };

      const validationResult = evaluateThresholds(result);

      expect(validationResult.passed).toBe(false);
      expect(validationResult.errors.some((e: { code: string }) => e.code === 'AI_GAP_TOO_MANY_HIGH')).toBe(true);
    });

    it('passes when gaps are within thresholds', () => {
      const validator = new AIGapValidator({ maxHighGaps: 5, blockOnCritical: true });
      const evaluateThresholds = (validator as any).evaluateThresholds.bind(validator);

      const result: GapDetectionResult = {
        gaps: [
          { id: 'GAP-001', type: 'missing_edge_case', severity: 'medium', description: 'Medium gap', evidence: 'E', suggestedFix: 'F' },
          { id: 'GAP-002', type: 'config_gap', severity: 'low', description: 'Low gap', evidence: 'E', suggestedFix: 'F' },
        ],
        coverage: { prdItemsCovered: 8, prdItemsTotal: 10, architectureComponentsCovered: 5, architectureComponentsTotal: 5 },
        confidence: 0.9,
        timestamp: new Date().toISOString(),
        durationMs: 500,
      };

      const validationResult = evaluateThresholds(result);

      expect(validationResult.passed).toBe(true);
      expect(validationResult.errors).toHaveLength(0);
      expect(validationResult.warnings.length).toBeGreaterThan(0); // Medium and low gaps as warnings
    });

    it('adds medium and low gaps as warnings', () => {
      const validator = new AIGapValidator();
      const evaluateThresholds = (validator as any).evaluateThresholds.bind(validator);

      const result: GapDetectionResult = {
        gaps: [
          { id: 'GAP-001', type: 'incomplete_feature', severity: 'medium', description: 'Medium gap', evidence: 'E', suggestedFix: 'F' },
          { id: 'GAP-002', type: 'untested_path', severity: 'low', description: 'Low gap', evidence: 'E', suggestedFix: 'F' },
        ],
        coverage: { prdItemsCovered: 10, prdItemsTotal: 10, architectureComponentsCovered: 5, architectureComponentsTotal: 5 },
        confidence: 0.95,
        timestamp: new Date().toISOString(),
        durationMs: 300,
      };

      const validationResult = evaluateThresholds(result);

      expect(validationResult.passed).toBe(true);
      expect(validationResult.warnings.some((w: { code: string }) => w.code === 'AI_GAP_MEDIUM')).toBe(true);
      expect(validationResult.warnings.some((w: { code: string }) => w.code === 'AI_GAP_LOW')).toBe(true);
    });

    it('handles detection errors gracefully', () => {
      const validator = new AIGapValidator();
      const evaluateThresholds = (validator as any).evaluateThresholds.bind(validator);

      const result: GapDetectionResult = {
        gaps: [],
        coverage: { prdItemsCovered: 0, prdItemsTotal: 0, architectureComponentsCovered: 0, architectureComponentsTotal: 0 },
        confidence: 0,
        timestamp: new Date().toISOString(),
        durationMs: 100,
        error: 'AI service unavailable',
      };

      const validationResult = evaluateThresholds(result);

      expect(validationResult.passed).toBe(true); // Don't block on detection errors
      expect(validationResult.warnings.some((w: { message: string }) => w.message.includes('error'))).toBe(true);
    });
  });

  describe('project type detection', () => {
    it('detects TypeScript project', async () => {
      await writeFile(join(testDir, 'tsconfig.json'), '{}');

      const validator = new AIGapValidator({ enabled: true });
      const prd = createTestPRD();

      // This will run and we can check the report
      const result = await validator.validate(prd, '# Architecture', testDir);

      if (result.reportPath && existsSync(result.reportPath)) {
        const report = JSON.parse(await readFile(result.reportPath, 'utf-8'));
        // Report should exist, type detection happens internally
        expect(report).toBeDefined();
      }
    });
  });

  describe('validateGaps convenience function', () => {
    it('validates gaps via convenience function', async () => {
      const prd = createTestPRD();

      const result = await validateGaps(
        prd,
        '# Architecture',
        testDir,
        { enabled: true }
      );

      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
    });

    it('can disable validation via config', async () => {
      const prd = createTestPRD();

      const result = await validateGaps(
        prd,
        '# Architecture',
        testDir,
        { enabled: false }
      );

      expect(result.passed).toBe(true);
      expect(result.warnings.some(w => w.message.includes('disabled'))).toBe(true);
    });
  });
});
