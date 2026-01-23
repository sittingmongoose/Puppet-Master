/**
 * Requirements Interviewer Tests
 *
 * Tests for the RequirementsInterviewer implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RequirementsInterviewer } from './requirements-interviewer.js';
import type { ParsedRequirements, ParsedSection, RequirementsSource } from '../types/index.js';
import type { InterviewResult } from './requirements-interviewer.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { QuotaManager } from '../platforms/quota-manager.js';
import { UsageTracker } from '../memory/usage-tracker.js';
import { getDefaultConfig } from '../config/default-config.js';
import type { BasePlatformRunner } from '../platforms/base-runner.js';
import type { ExecutionRequest, ExecutionResult } from '../types/platforms.js';

describe('RequirementsInterviewer', () => {
  let interviewer: RequirementsInterviewer;

  const createSource = (path: string = 'test.md'): RequirementsSource => ({
    path,
    format: 'markdown',
    size: 0,
    lastModified: new Date().toISOString(),
  });

  const createParsedSection = (
    title: string,
    content: string,
    level: number = 1
  ): ParsedSection => ({
    title,
    content,
    level,
    children: [],
  });

  const createParsedRequirements = (
    sections: ParsedSection[],
    title: string = 'Test Project',
    rawText?: string
  ): ParsedRequirements => ({
    source: createSource(),
    title,
    sections,
    extractedGoals: [],
    extractedConstraints: [],
    rawText: rawText || sections.map(s => `${s.title}\n${s.content}`).join('\n'),
    parseErrors: [],
  });

  beforeEach(() => {
    interviewer = new RequirementsInterviewer({ projectName: 'test-project' });
  });

  describe('constructor', () => {
    it('should create interviewer with default options', () => {
      const inter = new RequirementsInterviewer({ projectName: 'test' });
      expect(inter).toBeDefined();
    });

    it('should create interviewer with custom options', () => {
      const inter = new RequirementsInterviewer({
        projectName: 'test',
        maxQuestions: 5,
        includeCoverageChecklist: false,
      });
      expect(inter).toBeDefined();
    });
  });

  describe('generateQuestions (rule-based)', () => {
    it('should generate questions for missing categories', () => {
      const parsed = createParsedRequirements([
        createParsedSection('User Interface', 'Build a login screen'),
      ]);

      const result = interviewer.generateQuestions(parsed);

      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.coverageChecklist.length).toBe(9); // All 9 categories
      expect(result.timestamp).toBeDefined();
      expect(result.sourceDocument.title).toBe('Test Project');
    });

    it('should mark covered categories correctly', () => {
      const parsed = createParsedRequirements(
        [
          createParsedSection('Security', 'Use JWT authentication with bcrypt hashing'),
          createParsedSection('Database', 'PostgreSQL with Prisma ORM and migrations'),
        ],
        'Test Project',
        'Security: Use JWT authentication with bcrypt hashing. Database: PostgreSQL with Prisma ORM and migrations.'
      );

      const result = interviewer.generateQuestions(parsed);

      const securityCoverage = result.coverageChecklist.find(
        c => c.category === 'security_secrets'
      );
      expect(securityCoverage?.status).toBe('covered');
      expect(securityCoverage?.citations).toBeDefined();
      expect(securityCoverage?.citations!.length).toBeGreaterThan(0);

      const dataCoverage = result.coverageChecklist.find(
        c => c.category === 'data_persistence'
      );
      expect(dataCoverage?.status).toBe('covered');
      expect(dataCoverage?.citations).toBeDefined();
    });

    it('should respect maxQuestions limit', () => {
      const parsed = createParsedRequirements([
        createParsedSection('Overview', 'Build an app'),
      ]);

      const interviewerLimited = new RequirementsInterviewer({
        projectName: 'test',
        maxQuestions: 3,
      });
      const result = interviewerLimited.generateQuestions(parsed);

      expect(result.questions.length).toBeLessThanOrEqual(3);
    });

    it('should include default assumptions for all questions', () => {
      const parsed = createParsedRequirements([
        createParsedSection('Overview', 'Build an app'),
      ]);

      const result = interviewer.generateQuestions(parsed);

      for (const question of result.questions) {
        expect(question.defaultAssumption).toBeDefined();
        expect(question.defaultAssumption.length).toBeGreaterThan(0);
        expect(question.rationale).toBeDefined();
        expect(question.rationale.length).toBeGreaterThan(0);
      }
    });

    it('should assign correct priority levels', () => {
      const parsed = createParsedRequirements([
        createParsedSection('Overview', 'Build an app'),
      ]);

      const result = interviewer.generateQuestions(parsed);

      // Should have some critical priority questions (security, testing, compatibility)
      const criticalQuestions = result.questions.filter(q => q.priority === 'critical');
      expect(criticalQuestions.length).toBeGreaterThan(0);

      // Questions should be sorted by priority (critical first)
      if (result.questions.length >= 2) {
        const priorities = ['critical', 'high', 'medium', 'low'];
        for (let i = 0; i < result.questions.length - 1; i++) {
          const currentPriority = priorities.indexOf(result.questions[i].priority);
          const nextPriority = priorities.indexOf(result.questions[i + 1].priority);
          expect(currentPriority).toBeLessThanOrEqual(nextPriority);
        }
      }
    });

    it('should generate IDs in correct format', () => {
      const parsed = createParsedRequirements([
        createParsedSection('Overview', 'Build an app'),
      ]);

      const result = interviewer.generateQuestions(parsed);

      for (const question of result.questions) {
        expect(question.id).toMatch(/^Q-\d{3}$/);
      }
    });

    it('should detect keywords in nested sections', () => {
      const securitySection = createParsedSection(
        'Requirements',
        'General requirements',
        1
      );
      const authSubsection = createParsedSection(
        'Authentication',
        'Use OAuth 2.0 for user authentication',
        2
      );
      securitySection.children = [authSubsection];

      const parsed = createParsedRequirements(
        [securitySection],
        'Test Project',
        'Requirements\nGeneral requirements\nAuthentication\nUse OAuth 2.0 for user authentication'
      );

      const result = interviewer.generateQuestions(parsed);

      const securityCoverage = result.coverageChecklist.find(
        c => c.category === 'security_secrets'
      );
      expect(securityCoverage?.status).toBe('covered');
    });

    it('should include coverage checklist with all categories', () => {
      const parsed = createParsedRequirements([
        createParsedSection('Overview', 'Build an app'),
      ]);

      const result = interviewer.generateQuestions(parsed);

      expect(result.coverageChecklist.length).toBe(9);

      const categories = result.coverageChecklist.map(c => c.category);
      expect(categories).toContain('product_ux');
      expect(categories).toContain('data_persistence');
      expect(categories).toContain('security_secrets');
      expect(categories).toContain('deployment_environments');
      expect(categories).toContain('observability');
      expect(categories).toContain('performance_budgets');
      expect(categories).toContain('reliability');
      expect(categories).toContain('compatibility');
      expect(categories).toContain('testing_verification');
    });
  });

  describe('interviewWithAI', () => {
    it('should use rule-based fallback when AI dependencies not provided', async () => {
      const parsed = createParsedRequirements([
        createParsedSection('Overview', 'Build an app'),
      ]);

      const result = await interviewer.interviewWithAI(parsed, true);

      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.coverageChecklist.length).toBe(9);
    });

    it('should use AI when dependencies available', async () => {
      const mockResult: ExecutionResult = {
        success: true,
        exitCode: 0,
        duration: 1000,
        processId: 12345,
        output: JSON.stringify({
          questions: [
            {
              id: 'Q-001',
              category: 'security_secrets',
              question: 'How should secrets be managed?',
              rationale: 'Affects verification approach',
              defaultAssumption: 'Use environment variables',
              priority: 'critical',
            },
          ],
          assumptions: ['Use environment variables'],
          coverageChecklist: [
            {
              category: 'security_secrets',
              status: 'missing',
              topQuestion: 'How should secrets be managed?',
              defaultAssumption: 'Use environment variables',
            },
            {
              category: 'product_ux',
              status: 'covered',
              citations: ['Test Project > Overview'],
            },
            {
              category: 'data_persistence',
              status: 'missing',
              topQuestion: 'What database?',
              defaultAssumption: 'SQLite',
            },
            {
              category: 'deployment_environments',
              status: 'missing',
              topQuestion: 'What environments?',
              defaultAssumption: 'Dev/Prod',
            },
            {
              category: 'observability',
              status: 'missing',
              topQuestion: 'What logging?',
              defaultAssumption: 'Console logs',
            },
            {
              category: 'performance_budgets',
              status: 'missing',
              topQuestion: 'What performance targets?',
              defaultAssumption: 'Best effort',
            },
            {
              category: 'reliability',
              status: 'missing',
              topQuestion: 'What reliability?',
              defaultAssumption: 'Basic retry',
            },
            {
              category: 'compatibility',
              status: 'missing',
              topQuestion: 'What platforms?',
              defaultAssumption: 'Linux/macOS',
            },
            {
              category: 'testing_verification',
              status: 'missing',
              topQuestion: 'What testing?',
              defaultAssumption: 'Unit tests',
            },
          ],
          timestamp: new Date().toISOString(),
          sourceDocument: {
            path: 'test.md',
            title: 'Test Project',
            sectionCount: 1,
          },
        }),
      };

      const mockRunner: BasePlatformRunner = {
        execute: vi.fn().mockResolvedValue(mockResult),
        getTranscript: vi.fn().mockResolvedValue(''),
        captureStdout: vi.fn(),
        captureStderr: vi.fn(),
      } as unknown as BasePlatformRunner;

      const config = getDefaultConfig();
      const usageTracker = new UsageTracker(':memory:');
      const quotaManager = new QuotaManager(usageTracker, config.budgets);
      const platformRegistry = PlatformRegistry.createDefault(config);
      platformRegistry.register('claude', mockRunner);

      // Mock quota check to allow the call
      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });

      const interviewerWithAI = new RequirementsInterviewer(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const parsed = createParsedRequirements([
        createParsedSection('Overview', 'Build an app'),
      ]);

      const result = await interviewerWithAI.interviewWithAI(parsed, true);

      expect(result.questions.length).toBe(1);
      expect(result.questions[0].id).toBe('Q-001');
      expect(result.questions[0].category).toBe('security_secrets');
      expect(mockRunner.execute).toHaveBeenCalled();
    });

    it('should fall back to rule-based when AI fails', async () => {
      const mockRunner: BasePlatformRunner = {
        execute: vi.fn().mockResolvedValue({
          success: false,
          output: '',
          exitCode: 1,
        }),
        getTranscript: vi.fn().mockResolvedValue(''),
        captureStdout: vi.fn(),
        captureStderr: vi.fn(),
      } as unknown as BasePlatformRunner;

      const config = getDefaultConfig();
      const usageTracker = new UsageTracker(':memory:');
      const quotaManager = new QuotaManager(usageTracker, config.budgets);
      const platformRegistry = PlatformRegistry.createDefault(config);
      platformRegistry.register('claude', mockRunner);

      // Mock quota check to allow the call
      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });

      const interviewerWithAI = new RequirementsInterviewer(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const parsed = createParsedRequirements([
        createParsedSection('Overview', 'Build an app'),
      ]);

      const result = await interviewerWithAI.interviewWithAI(parsed, true);

      // Should fall back to rule-based generation
      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.coverageChecklist.length).toBe(9);
    });

    it('should fall back when AI returns invalid JSON', async () => {
      const mockRunner: BasePlatformRunner = {
        execute: vi.fn().mockResolvedValue({
          success: true,
          output: 'Invalid JSON response',
          exitCode: 0,
        }),
        getTranscript: vi.fn().mockResolvedValue(''),
        captureStdout: vi.fn(),
        captureStderr: vi.fn(),
      } as unknown as BasePlatformRunner;

      const config = getDefaultConfig();
      const usageTracker = new UsageTracker(':memory:');
      const quotaManager = new QuotaManager(usageTracker, config.budgets);
      const platformRegistry = PlatformRegistry.createDefault(config);
      platformRegistry.register('claude', mockRunner);

      // Mock quota check to allow the call
      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });

      const interviewerWithAI = new RequirementsInterviewer(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const parsed = createParsedRequirements([
        createParsedSection('Overview', 'Build an app'),
      ]);

      const result = await interviewerWithAI.interviewWithAI(parsed, true);

      // Should fall back to rule-based generation
      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.coverageChecklist.length).toBe(9);
    });

    it('should handle markdown-wrapped JSON response', async () => {
      const validJson = {
        questions: [
          {
            id: 'Q-001',
            category: 'security_secrets',
            question: 'How should secrets be managed?',
            rationale: 'Affects verification approach',
            defaultAssumption: 'Use environment variables',
            priority: 'critical',
          },
        ],
        assumptions: ['Use environment variables'],
        coverageChecklist: [
          {
            category: 'security_secrets',
            status: 'missing',
            topQuestion: 'How should secrets be managed?',
            defaultAssumption: 'Use environment variables',
          },
          {
            category: 'product_ux',
            status: 'covered',
            citations: [],
          },
          {
            category: 'data_persistence',
            status: 'missing',
          },
          {
            category: 'deployment_environments',
            status: 'missing',
          },
          {
            category: 'observability',
            status: 'missing',
          },
          {
            category: 'performance_budgets',
            status: 'missing',
          },
          {
            category: 'reliability',
            status: 'missing',
          },
          {
            category: 'compatibility',
            status: 'missing',
          },
          {
            category: 'testing_verification',
            status: 'missing',
          },
        ],
        timestamp: new Date().toISOString(),
        sourceDocument: {
          path: 'test.md',
          title: 'Test Project',
          sectionCount: 1,
        },
      };

      const mockRunner: BasePlatformRunner = {
        execute: vi.fn().mockResolvedValue({
          success: true,
          output: `\`\`\`json\n${JSON.stringify(validJson)}\n\`\`\``,
          exitCode: 0,
        }),
        getTranscript: vi.fn().mockResolvedValue(''),
        captureStdout: vi.fn(),
        captureStderr: vi.fn(),
      } as unknown as BasePlatformRunner;

      const config = getDefaultConfig();
      const usageTracker = new UsageTracker(':memory:');
      const quotaManager = new QuotaManager(usageTracker, config.budgets);
      const platformRegistry = PlatformRegistry.createDefault(config);
      platformRegistry.register('claude', mockRunner);

      // Mock quota check to allow the call
      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });

      const interviewerWithAI = new RequirementsInterviewer(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const parsed = createParsedRequirements([
        createParsedSection('Overview', 'Build an app'),
      ]);

      const result = await interviewerWithAI.interviewWithAI(parsed, true);

      expect(result.questions.length).toBe(1);
      expect(result.questions[0].id).toBe('Q-001');
    });
  });
});
