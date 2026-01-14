/**
 * PRD Generator Tests
 * 
 * Tests for the PrdGenerator implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrdGenerator } from './prd-generator.js';
import type { ParsedRequirements, ParsedSection, RequirementsSource } from '../types/index.js';
import type { PRD } from '../types/prd.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { QuotaManager } from '../platforms/quota-manager.js';
import { UsageTracker } from '../memory/usage-tracker.js';
import { getDefaultConfig } from '../config/default-config.js';
import type { BasePlatformRunner } from '../platforms/base-runner.js';
import type { ExecutionRequest, ExecutionResult } from '../types/platforms.js';

describe('PrdGenerator', () => {
  let generator: PrdGenerator;

  const createSource = (path: string = 'test.md'): RequirementsSource => ({
    path,
    format: 'markdown',
    size: 0,
    lastModified: new Date().toISOString(),
  });

  const createParsedRequirements = (
    sections: ParsedSection[],
    title: string = 'Test Project'
  ): ParsedRequirements => ({
    source: createSource(),
    title,
    sections,
    extractedGoals: [],
    extractedConstraints: [],
    rawText: '',
    parseErrors: [],
  });

  beforeEach(() => {
    generator = new PrdGenerator({ projectName: 'test-project' });
  });

  describe('constructor', () => {
    it('should create generator with default options', () => {
      const gen = new PrdGenerator({ projectName: 'test' });
      expect(gen).toBeDefined();
    });

    it('should create generator with custom options', () => {
      const gen = new PrdGenerator({
        projectName: 'test',
        maxSubtasksPerTask: 10,
        maxTasksPerPhase: 20,
      });
      expect(gen).toBeDefined();
    });
  });

  describe('generatePhaseId', () => {
    it('should generate phase IDs in correct format', () => {
      expect(generator.generatePhaseId(1)).toBe('PH-001');
      expect(generator.generatePhaseId(2)).toBe('PH-002');
      expect(generator.generatePhaseId(100)).toBe('PH-100');
    });
  });

  describe('generateTaskId', () => {
    it('should generate task IDs in correct format', () => {
      expect(generator.generateTaskId(1, 1)).toBe('TK-001-001');
      expect(generator.generateTaskId(1, 2)).toBe('TK-001-002');
      expect(generator.generateTaskId(2, 1)).toBe('TK-002-001');
    });
  });

  describe('generateSubtaskId', () => {
    it('should generate subtask IDs in correct format', () => {
      expect(generator.generateSubtaskId(1, 1, 1)).toBe('ST-001-001-001');
      expect(generator.generateSubtaskId(1, 1, 2)).toBe('ST-001-001-002');
      expect(generator.generateSubtaskId(2, 3, 4)).toBe('ST-002-003-004');
    });
  });

  describe('extractAcceptanceCriteria', () => {
    it('should extract criteria from bullet points', () => {
      const content = `
- First requirement
- Second requirement
- Third requirement
      `.trim();

      const criteria = generator.extractAcceptanceCriteria(content, 'PH-001');
      expect(criteria).toHaveLength(3);
      expect(criteria[0].id).toBe('PH-001-AC-001');
      expect(criteria[0].description).toBe('First requirement');
      expect(criteria[0].type).toBe('manual');
      expect(criteria[1].id).toBe('PH-001-AC-002');
      expect(criteria[2].id).toBe('PH-001-AC-003');
    });

    it('should extract criteria from numbered lists', () => {
      const content = `
1. First requirement
2. Second requirement
      `.trim();

      const criteria = generator.extractAcceptanceCriteria(content, 'PH-001');
      expect(criteria).toHaveLength(2);
      expect(criteria[0].description).toBe('First requirement');
      expect(criteria[1].description).toBe('Second requirement');
    });

    it('should extract criteria from asterisk bullets', () => {
      const content = `
* Requirement one
* Requirement two
      `.trim();

      const criteria = generator.extractAcceptanceCriteria(content, 'TK-001-001');
      expect(criteria).toHaveLength(2);
      expect(criteria[0].description).toBe('Requirement one');
    });

    it('should create generic criterion if none found', () => {
      const content = 'Just plain text without any bullets or numbers.';
      const criteria = generator.extractAcceptanceCriteria(content, 'ST-001-001-001');
      expect(criteria).toHaveLength(1);
      expect(criteria[0].id).toBe('ST-001-001-001-AC-001');
      expect(criteria[0].description).toBe('Implementation complete');
      expect(criteria[0].type).toBe('manual');
    });

    it('should handle empty content', () => {
      const criteria = generator.extractAcceptanceCriteria('', 'PH-001');
      expect(criteria).toHaveLength(1);
      expect(criteria[0].description).toBe('Implementation complete');
    });
  });

  describe('createTestPlan', () => {
    it('should create default test plan', () => {
      const testPlan = generator.createTestPlan('some content');
      expect(testPlan).toEqual({
        commands: [],
        failFast: true,
      });
    });
  });

  describe('calculateMetadata', () => {
    it('should calculate metadata correctly', () => {
      const sections: ParsedSection[] = [
        {
          title: 'Phase 1',
          content: 'Phase 1 content',
          level: 1,
          children: [
            {
              title: 'Task 1',
              content: 'Task 1 content\n- Requirement 1',
              level: 2,
              children: [],
            },
            {
              title: 'Task 2',
              content: 'Task 2 content',
              level: 2,
              children: [],
            },
          ],
        },
        {
          title: 'Phase 2',
          content: 'Phase 2 content',
          level: 1,
          children: [
            {
              title: 'Task 3',
              content: 'Task 3 content',
              level: 2,
              children: [],
            },
          ],
        },
      ];

      const phases = generator.generatePhases(sections);
      const metadata = generator.calculateMetadata(phases);

      expect(metadata.totalPhases).toBe(2);
      expect(metadata.totalTasks).toBe(3);
      expect(metadata.completedPhases).toBe(0);
      expect(metadata.completedTasks).toBe(0);
      expect(metadata.totalSubtasks).toBeGreaterThan(0);
    });
  });

  describe('generatePhases', () => {
    it('should generate phases from sections', () => {
      const sections: ParsedSection[] = [
        {
          title: 'Phase 1',
          content: 'Phase 1 description',
          level: 1,
          children: [],
        },
        {
          title: 'Phase 2',
          content: 'Phase 2 description',
          level: 1,
          children: [],
        },
      ];

      const phases = generator.generatePhases(sections);
      expect(phases).toHaveLength(2);
      expect(phases[0].id).toBe('PH-001');
      expect(phases[0].title).toBe('Phase 1');
      expect(phases[0].description).toBe('Phase 1 description');
      expect(phases[0].status).toBe('pending');
      expect(phases[0].priority).toBe(1);
      expect(phases[0].acceptanceCriteria.length).toBeGreaterThan(0);
      expect(phases[1].id).toBe('PH-002');
    });

    it('should generate tasks from phase children', () => {
      const sections: ParsedSection[] = [
        {
          title: 'Phase 1',
          content: 'Phase 1 description',
          level: 1,
          children: [
            {
              title: 'Task 1',
              content: 'Task 1 content',
              level: 2,
              children: [],
            },
            {
              title: 'Task 2',
              content: 'Task 2 content',
              level: 2,
              children: [],
            },
          ],
        },
      ];

      const phases = generator.generatePhases(sections);
      expect(phases).toHaveLength(1);
      expect(phases[0].tasks).toHaveLength(2);
      expect(phases[0].tasks[0].id).toBe('TK-001-001');
      expect(phases[0].tasks[0].title).toBe('Task 1');
      expect(phases[0].tasks[0].phaseId).toBe('PH-001');
      expect(phases[0].tasks[1].id).toBe('TK-001-002');
    });

    it('should limit tasks per phase', () => {
      const customGenerator = new PrdGenerator({
        projectName: 'test',
        maxTasksPerPhase: 2,
      });

      const sections: ParsedSection[] = [
        {
          title: 'Phase 1',
          content: 'Phase 1 description',
          level: 1,
          children: [
            { title: 'Task 1', content: 'Content 1', level: 2, children: [] },
            { title: 'Task 2', content: 'Content 2', level: 2, children: [] },
            { title: 'Task 3', content: 'Content 3', level: 2, children: [] },
            { title: 'Task 4', content: 'Content 4', level: 2, children: [] },
          ],
        },
      ];

      const phases = customGenerator.generatePhases(sections);
      expect(phases[0].tasks).toHaveLength(2);
    });
  });

  describe('generateTasks', () => {
    it('should generate tasks from phase children', () => {
      const section: ParsedSection = {
        title: 'Phase 1',
        content: 'Phase content',
        level: 1,
        children: [
          {
            title: 'Task 1',
            content: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5',
            level: 2,
            children: [],
          },
        ],
      };

      const tasks = generator.generateTasks('PH-001', section, 1);
      expect(tasks).toHaveLength(1);
      expect(tasks[0].subtasks.length).toBeGreaterThan(0);
      expect(tasks[0].subtasks[0].taskId).toBe('TK-001-001');
    });

    it('should limit subtasks per task', () => {
      const customGenerator = new PrdGenerator({
        projectName: 'test',
        maxSubtasksPerTask: 2,
      });

      const section: ParsedSection = {
        title: 'Phase 1',
        content: 'Phase content',
        level: 1,
        children: [
          {
            title: 'Task 1',
            content: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10',
            level: 2,
            children: [],
          },
        ],
      };

      const tasks = customGenerator.generateTasks('PH-001', section, 1);
      expect(tasks[0].subtasks.length).toBeLessThanOrEqual(2);
    });
  });

  describe('generateSubtasks', () => {
    it('should generate subtasks with correct IDs', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const subtasks = generator.generateSubtasks('TK-001-001', content, 1, 1);

      expect(subtasks.length).toBeGreaterThan(0);
      expect(subtasks[0].id).toMatch(/^ST-001-001-\d{3}$/);
      expect(subtasks[0].taskId).toBe('TK-001-001');
      expect(subtasks[0].status).toBe('pending');
      expect(subtasks[0].maxIterations).toBe(3);
      expect(subtasks[0].iterations).toEqual([]);
    });

    it('should create at least one subtask even for short content', () => {
      const content = 'Short content';
      const subtasks = generator.generateSubtasks('TK-001-001', content, 1, 1);
      expect(subtasks.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('generate', () => {
    it('should generate complete PRD structure', () => {
      const sections: ParsedSection[] = [
        {
          title: 'Phase 1',
          content: 'Phase 1 description\n- Goal 1\n- Goal 2',
          level: 1,
          children: [
            {
              title: 'Task 1',
              content: 'Task 1 content\n- Requirement 1',
              level: 2,
              children: [],
            },
          ],
        },
      ];

      const parsed = createParsedRequirements(sections, 'Test Project');
      const prd = generator.generate(parsed);

      expect(prd.project).toBe('test-project');
      expect(prd.version).toBe('1.0.0');
      expect(prd.branchName).toBe('ralph/main');
      expect(prd.description).toBe('Test Project');
      expect(prd.phases).toHaveLength(1);
      expect(prd.metadata.totalPhases).toBe(1);
      expect(prd.metadata.totalTasks).toBe(1);
      expect(prd.metadata.totalSubtasks).toBeGreaterThan(0);
    });

    it('should handle empty sections', () => {
      const parsed = createParsedRequirements([], 'Empty Project');
      const prd = generator.generate(parsed);

      expect(prd.phases).toHaveLength(0);
      expect(prd.metadata.totalPhases).toBe(0);
      expect(prd.metadata.totalTasks).toBe(0);
      expect(prd.metadata.totalSubtasks).toBe(0);
    });

    it('should use parsed title for description', () => {
      const parsed = createParsedRequirements([], 'My Project Title');
      const prd = generator.generate(parsed);
      expect(prd.description).toBe('My Project Title');
    });

    it('should use default description if title is empty', () => {
      const parsed = createParsedRequirements([], '');
      const prd = generator.generate(parsed);
      expect(prd.description).toBe('Generated from requirements');
    });

    it('should set createdAt and updatedAt timestamps', () => {
      const parsed = createParsedRequirements([]);
      const before = new Date().toISOString();
      const prd = generator.generate(parsed);
      const after = new Date().toISOString();

      expect(prd.createdAt).toBeDefined();
      expect(prd.updatedAt).toBeDefined();
      expect(prd.createdAt >= before).toBe(true);
      expect(prd.createdAt <= after).toBe(true);
      expect(prd.updatedAt >= before).toBe(true);
      expect(prd.updatedAt <= after).toBe(true);
    });

    it('should generate valid PRD structure matching schema', () => {
      const sections: ParsedSection[] = [
        {
          title: 'Phase 1',
          content: 'Phase content',
          level: 1,
          children: [
            {
              title: 'Task 1',
              content: 'Task content',
              level: 2,
              children: [],
            },
          ],
        },
      ];

      const parsed = createParsedRequirements(sections);
      const prd = generator.generate(parsed);

      // Validate PRD structure
      expect(prd).toHaveProperty('project');
      expect(prd).toHaveProperty('version');
      expect(prd).toHaveProperty('createdAt');
      expect(prd).toHaveProperty('updatedAt');
      expect(prd).toHaveProperty('branchName');
      expect(prd).toHaveProperty('description');
      expect(prd).toHaveProperty('phases');
      expect(prd).toHaveProperty('metadata');

      // Validate phase structure
      const phase = prd.phases[0];
      expect(phase).toHaveProperty('id');
      expect(phase).toHaveProperty('title');
      expect(phase).toHaveProperty('description');
      expect(phase).toHaveProperty('status');
      expect(phase).toHaveProperty('priority');
      expect(phase).toHaveProperty('acceptanceCriteria');
      expect(phase).toHaveProperty('testPlan');
      expect(phase).toHaveProperty('tasks');
      expect(phase).toHaveProperty('createdAt');
      expect(phase).toHaveProperty('notes');

      // Validate task structure
      const task = phase.tasks[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('phaseId');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('acceptanceCriteria');
      expect(task).toHaveProperty('testPlan');
      expect(task).toHaveProperty('subtasks');
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('notes');

      // Validate subtask structure
      const subtask = task.subtasks[0];
      expect(subtask).toHaveProperty('id');
      expect(subtask).toHaveProperty('taskId');
      expect(subtask).toHaveProperty('title');
      expect(subtask).toHaveProperty('description');
      expect(subtask).toHaveProperty('status');
      expect(subtask).toHaveProperty('priority');
      expect(subtask).toHaveProperty('acceptanceCriteria');
      expect(subtask).toHaveProperty('testPlan');
      expect(subtask).toHaveProperty('iterations');
      expect(subtask).toHaveProperty('maxIterations');
      expect(subtask).toHaveProperty('createdAt');
      expect(subtask).toHaveProperty('notes');
    });
  });

  describe('AI integration', () => {
    let mockRunner: BasePlatformRunner;
    let platformRegistry: PlatformRegistry;
    let quotaManager: QuotaManager;
    let usageTracker: UsageTracker;
    let config: ReturnType<typeof getDefaultConfig>;

    beforeEach(() => {
      config = getDefaultConfig();
      usageTracker = new UsageTracker('.puppet-master/usage/usage.jsonl');
      quotaManager = new QuotaManager(usageTracker, config.budgets);
      platformRegistry = PlatformRegistry.createDefault(config);

      // Create mock runner
      mockRunner = {
        execute: vi.fn(),
      } as unknown as BasePlatformRunner;

      // Register mock runner
      platformRegistry.register('claude', mockRunner);
    });

    it('should use rule-based generation when AI dependencies not provided', async () => {
      const gen = new PrdGenerator({ projectName: 'test' });
      const parsed = createParsedRequirements([
        {
          title: 'Phase 1',
          content: 'Phase 1 content',
          level: 1,
          children: [],
        },
      ]);

      const prd = await gen.generateWithAI(parsed, true);
      expect(prd).toBeDefined();
      expect(prd.phases).toHaveLength(1);
    });

    it('should fallback to rule-based when quota exhausted', async () => {
      const gen = new PrdGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      // Mock quota check to return exhausted
      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({
        allowed: false,
        reason: 'Quota exhausted',
      });

      const parsed = createParsedRequirements([
        {
          title: 'Phase 1',
          content: 'Phase 1 content',
          level: 1,
          children: [],
        },
      ]);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const prd = await gen.generateWithAI(parsed, true);

      // Should have been called with quota exhausted warning
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnMessages = consoleWarnSpy.mock.calls.map(call => call[0]?.toString() || '');
      expect(warnMessages.some(msg => msg.includes('Quota exhausted'))).toBe(true);
      expect(prd).toBeDefined();
      expect(prd.phases).toHaveLength(1);
      expect(mockRunner.execute).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should fallback to rule-based when platform runner unavailable', async () => {
      const emptyRegistry = new PlatformRegistry();
      const gen = new PrdGenerator(
        { projectName: 'test' },
        emptyRegistry,
        quotaManager,
        config,
        usageTracker
      );

      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });

      const parsed = createParsedRequirements([
        {
          title: 'Phase 1',
          content: 'Phase 1 content',
          level: 1,
          children: [],
        },
      ]);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const prd = await gen.generateWithAI(parsed, true);

      // Should have been called with platform unavailable warning
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnMessages = consoleWarnSpy.mock.calls.map(call => call[0]?.toString() || '');
      expect(warnMessages.some(msg => msg.includes('Platform runner not available') || msg.includes('not available'))).toBe(true);
      expect(prd).toBeDefined();
      expect(prd.phases).toHaveLength(1);

      consoleWarnSpy.mockRestore();
    });

    it('should fallback to rule-based when JSON parsing fails', async () => {
      const gen = new PrdGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });
      vi.spyOn(mockRunner, 'execute').mockResolvedValue({
        success: true,
        output: 'Invalid JSON response',
        exitCode: 0,
        duration: 1000,
        processId: 12345,
      });

      const parsed = createParsedRequirements([
        {
          title: 'Phase 1',
          content: 'Phase 1 content',
          level: 1,
          children: [],
        },
      ]);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const prd = await gen.generateWithAI(parsed, true);

      // Should have been called with parse error warning
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnMessages = consoleWarnSpy.mock.calls.map(call => call[0]?.toString() || '');
      expect(warnMessages.some(msg => msg.includes('Failed to parse AI response') || msg.includes('parse'))).toBe(true);
      expect(prd).toBeDefined();
      expect(prd.phases).toHaveLength(1);

      consoleWarnSpy.mockRestore();
    });

    it('should successfully generate PRD with AI when all conditions met', async () => {
      const gen = new PrdGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const mockPrd: PRD = {
        project: 'test',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        branchName: 'ralph/main',
        description: 'AI Generated PRD',
        phases: [
          {
            id: 'PH-001',
            title: 'AI Phase',
            description: 'AI generated phase',
            status: 'pending',
            priority: 1,
            acceptanceCriteria: [],
            testPlan: { commands: [], failFast: true },
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
      };

      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });
      vi.spyOn(mockRunner, 'execute').mockResolvedValue({
        success: true,
        output: JSON.stringify(mockPrd),
        exitCode: 0,
        duration: 1000,
        processId: 12345,
        tokensUsed: 5000,
      });

      const trackSpy = vi.spyOn(usageTracker, 'track').mockResolvedValue(undefined);

      const parsed = createParsedRequirements([
        {
          title: 'Phase 1',
          content: 'Phase 1 content',
          level: 1,
          children: [],
        },
      ]);

      const prd = await gen.generateWithAI(parsed, true);

      expect(prd).toBeDefined();
      expect(prd.project).toBe('test');
      expect(prd.phases).toHaveLength(1);
      expect(prd.phases[0].title).toBe('AI Phase');
      expect(mockRunner.execute).toHaveBeenCalled();
      expect(trackSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'claude',
          action: 'prd_generation',
          success: true,
        })
      );

      trackSpy.mockRestore();
    });

    it('should extract JSON from markdown code blocks', async () => {
      const gen = new PrdGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const mockPrd: PRD = {
        project: 'test',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        branchName: 'ralph/main',
        description: 'AI Generated PRD',
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

      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });
      vi.spyOn(mockRunner, 'execute').mockResolvedValue({
        success: true,
        output: `Here is the PRD:\n\n\`\`\`json\n${JSON.stringify(mockPrd)}\n\`\`\``,
        exitCode: 0,
        duration: 1000,
        processId: 12345,
      });

      const parsed = createParsedRequirements([]);
      const prd = await gen.generateWithAI(parsed, true);

      expect(prd).toBeDefined();
      expect(prd.project).toBe('test');
    });
  });
});
