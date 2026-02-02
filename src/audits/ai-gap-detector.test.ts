/**
 * AI Gap Detector Tests
 *
 * Tests for the AI-assisted gap detection system.
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T26.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AIGapDetector, createAIGapDetector } from './ai-gap-detector.js';
import type {
  GapDetectionInput,
} from '../types/gap-detection.js';
import type { PRD } from '../types/prd.js';
import { tmpdir } from 'os';
import { join } from 'path';
import { mkdir, writeFile, rm } from 'fs/promises';
import { randomUUID } from 'crypto';

describe('AIGapDetector', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = join(tmpdir(), `ai-gap-detector-test-${randomUUID()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('constructor', () => {
    it('creates instance with default config', () => {
      const detector = new AIGapDetector();
      expect(detector).toBeInstanceOf(AIGapDetector);
    });

    it('merges partial config with defaults', () => {
      const detector = new AIGapDetector({
        platform: 'cursor',
        temperature: 0.3,
      });
      expect(detector).toBeInstanceOf(AIGapDetector);
    });
  });

  describe('createAIGapDetector', () => {
    it('creates detector via factory function', () => {
      const detector = createAIGapDetector();
      expect(detector).toBeInstanceOf(AIGapDetector);
    });

    it('accepts partial config via factory', () => {
      const detector = createAIGapDetector({ platform: 'codex' });
      expect(detector).toBeInstanceOf(AIGapDetector);
    });
  });

  describe('buildPrompt', () => {
    it('builds comprehensive prompt with all sections', () => {
      const detector = new AIGapDetector();

      const input: GapDetectionInput = {
        prd: {
          project: 'test-project',
          phaseCount: 2,
          taskCount: 4,
          subtaskCount: 8,
          phases: [
            {
              id: 'PH-001',
              title: 'Phase 1',
              tasks: [
                {
                  id: 'TK-001-001',
                  title: 'Task 1',
                  subtasks: [
                    {
                      id: 'ST-001-001-001',
                      title: 'Subtask 1',
                      acceptanceCriteria: ['Criterion 1', 'Criterion 2'],
                    },
                  ],
                },
              ],
            },
          ],
        },
        architecture: '# Architecture\n\n## Components\n- Component A\n- Component B',
        codebaseStructure: {
          projectRoot: '/test',
          sourceDirs: ['src'],
          files: [],
          modules: [],
          entryPoints: [],
          configFiles: [],
        },
        existingTests: [],
      };

      const prompt = detector.buildPrompt(input);

      // Verify prompt contains key sections
      expect(prompt).toContain('senior software architect');
      expect(prompt).toContain('gap analysis');
      expect(prompt).toContain('PRD Summary');
      expect(prompt).toContain('Architecture');
      expect(prompt).toContain('Codebase Structure');
      expect(prompt).toContain('Gap Categories');
      expect(prompt).toContain('missing_implementation');
      expect(prompt).toContain('integration_gap');
      expect(prompt).toContain('Output Format');
      expect(prompt).toContain('test-project');
      expect(prompt).toContain('PH-001');
      expect(prompt).toContain('ST-001-001-001');
    });

    it('includes test information in prompt', () => {
      const detector = new AIGapDetector();

      const input: GapDetectionInput = {
        prd: {
          project: 'test',
          phaseCount: 1,
          taskCount: 1,
          subtaskCount: 1,
          phases: [],
        },
        architecture: 'Test arch',
        codebaseStructure: {
          projectRoot: '/test',
          sourceDirs: ['src'],
          files: [],
          modules: [],
          entryPoints: [],
          configFiles: [],
        },
        existingTests: [
          {
            file: 'src/utils.test.ts',
            testCount: 10,
            coveragePatterns: ['Utils', 'Helpers'],
            framework: 'vitest',
          },
        ],
      };

      const prompt = detector.buildPrompt(input);

      expect(prompt).toContain('src/utils.test.ts');
      expect(prompt).toContain('10 tests');
      expect(prompt).toContain('vitest');
    });
  });

  describe('detectGaps', () => {
    it('returns empty result when no platform registry', async () => {
      const detector = new AIGapDetector();

      const input: GapDetectionInput = {
        prd: {
          project: 'test',
          phaseCount: 1,
          taskCount: 1,
          subtaskCount: 1,
          phases: [],
        },
        architecture: 'Test',
        codebaseStructure: {
          projectRoot: '/test',
          sourceDirs: ['src'],
          files: [],
          modules: [],
          entryPoints: [],
          configFiles: [],
        },
        existingTests: [],
      };

      const result = await detector.detectGaps(input);

      expect(result.gaps).toEqual([]);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.some(w => w.includes('mock mode'))).toBe(true);
    });
  });

  describe('buildCodebaseStructure (static)', () => {
    it('builds structure from project directory', async () => {
      // Create test files
      await mkdir(join(testDir, 'src'), { recursive: true });
      await writeFile(
        join(testDir, 'src/index.ts'),
        'export const foo = "bar";\nexport function hello() {}\n'
      );
      await writeFile(
        join(testDir, 'src/utils.ts'),
        'import { foo } from "./index.js";\nexport const baz = foo;\n'
      );
      await writeFile(join(testDir, 'package.json'), '{}');
      await writeFile(join(testDir, 'tsconfig.json'), '{}');

      const structure = await AIGapDetector.buildCodebaseStructure(testDir);

      expect(structure.projectRoot).toBe(testDir);
      expect(structure.sourceDirs).toContain('src');
      expect(structure.files.length).toBeGreaterThan(0);
      expect(structure.configFiles).toContain('package.json');
      expect(structure.configFiles).toContain('tsconfig.json');
    });

    it('extracts exports from source files', async () => {
      await mkdir(join(testDir, 'src'), { recursive: true });
      await writeFile(
        join(testDir, 'src/exports.ts'),
        `export const foo = 1;
export function bar() {}
export class Baz {}
export { qux } from './other.js';
`
      );

      const structure = await AIGapDetector.buildCodebaseStructure(testDir);
      const exportsFile = structure.files.find(f => f.path.includes('exports.ts'));

      expect(exportsFile).toBeDefined();
      expect(exportsFile?.exports).toContain('foo');
      expect(exportsFile?.exports).toContain('bar');
      expect(exportsFile?.exports).toContain('Baz');
    });

    it('excludes test files from source files', async () => {
      await mkdir(join(testDir, 'src'), { recursive: true });
      await writeFile(join(testDir, 'src/index.ts'), 'export const x = 1;');
      await writeFile(join(testDir, 'src/index.test.ts'), 'describe("test", () => {});');
      await writeFile(join(testDir, 'src/index.spec.ts'), 'describe("spec", () => {});');

      const structure = await AIGapDetector.buildCodebaseStructure(testDir);

      expect(structure.files.some(f => f.path.includes('index.ts') && !f.path.includes('.test.') && !f.path.includes('.spec.'))).toBe(true);
      expect(structure.files.some(f => f.path.includes('.test.'))).toBe(false);
      expect(structure.files.some(f => f.path.includes('.spec.'))).toBe(false);
    });

    it('handles non-existent directory gracefully', async () => {
      const structure = await AIGapDetector.buildCodebaseStructure('/nonexistent/path/12345');

      expect(structure.files).toEqual([]);
      expect(structure.modules).toEqual([]);
    });
  });

  describe('findExistingTests (static)', () => {
    it('finds test files in project', async () => {
      await mkdir(join(testDir, 'src'), { recursive: true });
      await writeFile(
        join(testDir, 'src/utils.test.ts'),
        `import { describe, it, expect } from 'vitest';
describe('Utils', () => {
  it('should work', () => {});
  it('should also work', () => {});
});
`
      );

      const tests = await AIGapDetector.findExistingTests(testDir);

      expect(tests.length).toBe(1);
      expect(tests[0].file).toContain('utils.test.ts');
      expect(tests[0].testCount).toBe(2);
      expect(tests[0].framework).toBe('vitest');
      expect(tests[0].coveragePatterns).toContain('Utils');
    });

    it('detects Jest framework', async () => {
      await mkdir(join(testDir, 'src'), { recursive: true });
      await writeFile(
        join(testDir, 'src/app.test.ts'),
        `import { jest } from '@jest/globals';
describe('App', () => {
  test('should run', () => {});
});
`
      );

      const tests = await AIGapDetector.findExistingTests(testDir);

      expect(tests.length).toBe(1);
      expect(tests[0].framework).toBe('jest');
    });

    it('handles project with no tests', async () => {
      await mkdir(join(testDir, 'src'), { recursive: true });
      await writeFile(join(testDir, 'src/index.ts'), 'export const x = 1;');

      const tests = await AIGapDetector.findExistingTests(testDir);

      expect(tests.length).toBe(0);
    });
  });

  describe('summarizePRD (static)', () => {
    it('summarizes PRD structure', () => {
      const prd: PRD = {
        project: 'test-project',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        branchName: 'main',
        description: 'Test PRD',
        phases: [
          {
            id: 'PH-001',
            title: 'Phase 1',
            description: 'First phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [],
            testPlan: { commands: [], failFast: false },
            tasks: [
              {
                id: 'TK-001-001',
                phaseId: 'PH-001',
                title: 'Task 1',
                description: 'First task',
                status: 'pending',
                priority: 1,
                acceptanceCriteria: [],
                testPlan: { commands: [], failFast: false },
                subtasks: [
                  {
                    id: 'ST-001-001-001',
                    taskId: 'TK-001-001',
                    title: 'Subtask 1',
                    description: 'First subtask',
                    status: 'pending',
                    priority: 1,
                    acceptanceCriteria: [
                      { id: 'AC-001', type: 'command', description: 'Test criterion', target: 'npm test' },
                    ],
                    testPlan: { commands: [], failFast: false },
                    iterations: [],
                    maxIterations: 3,
                    createdAt: new Date().toISOString(),
                    notes: '',
                  },
                ],
                createdAt: new Date().toISOString(),
                notes: '',
              },
            ],
            createdAt: new Date().toISOString(),
            notes: '',
          },
        ],
        metadata: {
          totalPhases: 1,
          completedPhases: 0,
          totalTasks: 1,
          completedTasks: 0,
          totalSubtasks: 1,
          completedSubtasks: 0,
        },
      };

      const summary = AIGapDetector.summarizePRD(prd);

      expect(summary.project).toBe('test-project');
      expect(summary.phaseCount).toBe(1);
      expect(summary.taskCount).toBe(1);
      expect(summary.subtaskCount).toBe(1);
      expect(summary.phases[0].id).toBe('PH-001');
      expect(summary.phases[0].tasks[0].id).toBe('TK-001-001');
      expect(summary.phases[0].tasks[0].subtasks[0].id).toBe('ST-001-001-001');
      expect(summary.phases[0].tasks[0].subtasks[0].acceptanceCriteria).toContain('Test criterion');
    });
  });

  describe('gap type validation', () => {
    it('validates known gap types', () => {
      const detector = new AIGapDetector();

      // Access private method via cast for testing
      const validateGapType = (
        detector as unknown as { validateGapType: (value: string) => string }
      ).validateGapType.bind(detector);

      expect(validateGapType('missing_implementation')).toBe('missing_implementation');
      expect(validateGapType('integration_gap')).toBe('integration_gap');
      expect(validateGapType('architectural_mismatch')).toBe('architectural_mismatch');
      expect(validateGapType('missing_error_handling')).toBe('missing_error_handling');
      expect(validateGapType('missing_edge_case')).toBe('missing_edge_case');
      expect(validateGapType('incomplete_feature')).toBe('incomplete_feature');
      expect(validateGapType('untested_path')).toBe('untested_path');
      expect(validateGapType('config_gap')).toBe('config_gap');
    });

    it('normalizes unknown gap types to missing_implementation', () => {
      const detector = new AIGapDetector();
      const validateGapType = (
        detector as unknown as { validateGapType: (value: string) => string }
      ).validateGapType.bind(detector);

      expect(validateGapType('unknown_type')).toBe('missing_implementation');
      expect(validateGapType('')).toBe('missing_implementation');
    });
  });

  describe('severity validation', () => {
    it('validates known severities', () => {
      const detector = new AIGapDetector();
      const validateSeverity = (
        detector as unknown as { validateSeverity: (value: string) => string }
      ).validateSeverity.bind(detector);

      expect(validateSeverity('critical')).toBe('critical');
      expect(validateSeverity('high')).toBe('high');
      expect(validateSeverity('medium')).toBe('medium');
      expect(validateSeverity('low')).toBe('low');
    });

    it('defaults unknown severity to medium', () => {
      const detector = new AIGapDetector();
      const validateSeverity = (
        detector as unknown as { validateSeverity: (value: string) => string }
      ).validateSeverity.bind(detector);

      expect(validateSeverity('unknown')).toBe('medium');
      expect(validateSeverity('')).toBe('medium');
    });
  });
});
