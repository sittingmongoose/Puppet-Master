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
      const quotaManager = new QuotaManager(usageTracker, config.budgets, config.budgetEnforcement);
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
      const quotaManager = new QuotaManager(usageTracker, config.budgets, config.budgetEnforcement);
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
      const quotaManager = new QuotaManager(usageTracker, config.budgets, config.budgetEnforcement);
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
      const quotaManager = new QuotaManager(usageTracker, config.budgets, config.budgetEnforcement);
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

  describe('out-of-scope detection (FIX 3)', () => {
    it('should detect explicit "out of scope" statements', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Security', 'Authentication is out of scope for this project')],
        'Test Project',
        'Security: Authentication is out of scope for this project'
      );

      const result = interviewer.generateQuestions(parsed);

      const securityCoverage = result.coverageChecklist.find(
        c => c.category === 'security_secrets'
      );
      expect(securityCoverage?.status).toBe('out_of_scope');
      expect(securityCoverage?.rationale).toContain('out of scope');
    });

    it('should detect "n/a" and "not applicable" statements', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Deployment', 'Deployment configuration is N/A for this phase')],
        'Test Project',
        'Deployment: Deployment configuration is N/A for this phase'
      );

      const result = interviewer.generateQuestions(parsed);

      const deploymentCoverage = result.coverageChecklist.find(
        c => c.category === 'deployment_environments'
      );
      expect(deploymentCoverage?.status).toBe('out_of_scope');
    });

    it('should detect "future version" statements', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Testing', 'Automated testing will be added in a future version')],
        'Test Project',
        'Testing: Automated testing will be added in a future version'
      );

      const result = interviewer.generateQuestions(parsed);

      const testingCoverage = result.coverageChecklist.find(
        c => c.category === 'testing_verification'
      );
      expect(testingCoverage?.status).toBe('out_of_scope');
    });

    it('should detect "deferred" statements', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Monitoring', 'Metrics and monitoring are deferred to phase 2')],
        'Test Project',
        'Monitoring: Metrics and monitoring are deferred to phase 2'
      );

      const result = interviewer.generateQuestions(parsed);

      const observabilityCoverage = result.coverageChecklist.find(
        c => c.category === 'observability'
      );
      expect(observabilityCoverage?.status).toBe('out_of_scope');
    });
  });

  describe('ambiguity detection (FIX 4)', () => {
    it('should detect uncertain language ("maybe", "possibly")', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Features', 'We maybe need caching. It could possibly help. Users might need this feature.')],
        'Test Project',
        'Features: We maybe need caching. It could possibly help. Users might need this feature.'
      );

      const result = interviewer.generateQuestions(parsed);

      const ambiguityQuestion = result.questions.find(q => q.id.startsWith('Q-AMB'));
      expect(ambiguityQuestion).toBeDefined();
      expect(ambiguityQuestion?.priority).toBe('high');
    });

    it('should detect TBD/pending items', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Architecture', 'Database choice is TBD. Storage layer is pending. Final decision to be determined later.')],
        'Test Project',
        'Architecture: Database choice is TBD. Storage layer is pending. Final decision to be determined later.'
      );

      const result = interviewer.generateQuestions(parsed);

      const ambiguityQuestion = result.questions.find(q => q.id.startsWith('Q-AMB'));
      expect(ambiguityQuestion).toBeDefined();
    });

    it('should detect alternative choices ("or", "either")', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Tech Stack', 'We can use React or Vue. Either would work. We could alternatively use Angular or Svelte.')],
        'Test Project',
        'Tech Stack: We can use React or Vue. Either would work. We could alternatively use Angular or Svelte.'
      );

      const result = interviewer.generateQuestions(parsed);

      const ambiguityQuestion = result.questions.find(q => q.id.startsWith('Q-AMB'));
      expect(ambiguityQuestion).toBeDefined();
    });
  });

  describe('conflict detection (FIX 4)', () => {
    it('should detect conflicting terms (SQL vs NoSQL)', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Database', 'Use SQL for transactions and NoSQL for caching')],
        'Test Project',
        'Database: Use SQL for transactions and NoSQL for caching'
      );

      const result = interviewer.generateQuestions(parsed);

      const conflictQuestion = result.questions.find(q => q.id.startsWith('Q-CONFLICT'));
      expect(conflictQuestion).toBeDefined();
      expect(conflictQuestion?.priority).toBe('critical');
      expect(conflictQuestion?.question).toContain('sql');
    });

    it('should detect conflicting terms (synchronous vs asynchronous)', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Architecture', 'Use synchronous requests for API and asynchronous for background jobs')],
        'Test Project',
        'Architecture: Use synchronous requests for API and asynchronous for background jobs'
      );

      const result = interviewer.generateQuestions(parsed);

      const conflictQuestion = result.questions.find(q => q.id.startsWith('Q-CONFLICT'));
      expect(conflictQuestion).toBeDefined();
      expect(conflictQuestion?.category).toBe('data_persistence');
    });

    it('should detect conflicting terms (monolithic vs microservices)', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Deployment', 'Start with monolithic architecture, then move to microservices')],
        'Test Project',
        'Deployment: Start with monolithic architecture, then move to microservices'
      );

      const result = interviewer.generateQuestions(parsed);

      const conflictQuestion = result.questions.find(q => q.id.startsWith('Q-CONFLICT'));
      expect(conflictQuestion).toBeDefined();
      expect(conflictQuestion?.category).toBe('deployment_environments');
    });

    it('should mark conflict questions as critical priority', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('API', 'Consider both REST and GraphQL approaches')],
        'Test Project',
        'API: Consider both REST and GraphQL approaches'
      );

      const result = interviewer.generateQuestions(parsed);

      const conflictQuestion = result.questions.find(q => q.id.startsWith('Q-CONFLICT'));
      expect(conflictQuestion?.priority).toBe('critical');
    });
  });

  describe('all category detection', () => {
    it('should detect deployment_environments category', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Infra', 'Deploy to Docker containers with Kubernetes orchestration')],
        'Test Project',
        'Infra: Deploy to Docker containers with Kubernetes orchestration'
      );

      const result = interviewer.generateQuestions(parsed);

      const coverage = result.coverageChecklist.find(c => c.category === 'deployment_environments');
      expect(coverage?.status).toBe('covered');
    });

    it('should detect observability category', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Monitoring', 'Implement structured logging and metrics collection')],
        'Test Project',
        'Monitoring: Implement structured logging and metrics collection'
      );

      const result = interviewer.generateQuestions(parsed);

      const coverage = result.coverageChecklist.find(c => c.category === 'observability');
      expect(coverage?.status).toBe('covered');
    });

    it('should detect performance_budgets category', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Performance', 'API latency should be under 100ms with high throughput')],
        'Test Project',
        'Performance: API latency should be under 100ms with high throughput'
      );

      const result = interviewer.generateQuestions(parsed);

      const coverage = result.coverageChecklist.find(c => c.category === 'performance_budgets');
      expect(coverage?.status).toBe('covered');
    });

    it('should detect reliability category', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Reliability', 'Implement retry logic with circuit breaker pattern for failover')],
        'Test Project',
        'Reliability: Implement retry logic with circuit breaker pattern for failover'
      );

      const result = interviewer.generateQuestions(parsed);

      const coverage = result.coverageChecklist.find(c => c.category === 'reliability');
      expect(coverage?.status).toBe('covered');
    });

    it('should detect compatibility category', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Platforms', 'Support Windows, Linux, and macOS cross-platform')],
        'Test Project',
        'Platforms: Support Windows, Linux, and macOS cross-platform'
      );

      const result = interviewer.generateQuestions(parsed);

      const coverage = result.coverageChecklist.find(c => c.category === 'compatibility');
      expect(coverage?.status).toBe('covered');
    });

    it('should detect testing_verification category', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('QA', 'Unit test coverage should validate all acceptance criteria')],
        'Test Project',
        'QA: Unit test coverage should validate all acceptance criteria'
      );

      const result = interviewer.generateQuestions(parsed);

      const coverage = result.coverageChecklist.find(c => c.category === 'testing_verification');
      expect(coverage?.status).toBe('covered');
    });

    it('should detect product_ux category', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('UX', 'Design user interface with accessibility in mind')],
        'Test Project',
        'UX: Design user interface with accessibility in mind'
      );

      const result = interviewer.generateQuestions(parsed);

      const coverage = result.coverageChecklist.find(c => c.category === 'product_ux');
      expect(coverage?.status).toBe('covered');
    });
  });

  describe('edge cases', () => {
    it('should handle empty requirements document', () => {
      const parsed = createParsedRequirements([], 'Empty Project', '');

      const result = interviewer.generateQuestions(parsed);

      // Should generate questions for all missing categories
      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.coverageChecklist.length).toBe(9);
      // All should be missing
      const missingCount = result.coverageChecklist.filter(c => c.status === 'missing').length;
      expect(missingCount).toBe(9);
    });

    it('should handle single section only', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Overview', 'Simple project')],
        'Single Section'
      );

      const result = interviewer.generateQuestions(parsed);

      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.sourceDocument.sectionCount).toBe(1);
    });

    it('should handle deeply nested sections (3+ levels)', () => {
      const level1 = createParsedSection('Level 1', 'Content 1', 1);
      const level2 = createParsedSection('Level 2', 'Content 2 with auth security', 2);
      const level3 = createParsedSection('Level 3', 'Content 3 with database storage', 3);
      level2.children = [level3];
      level1.children = [level2];

      const parsed = createParsedRequirements(
        [level1],
        'Nested Project',
        'Level 1\nContent 1\nLevel 2\nContent 2 with auth security\nLevel 3\nContent 3 with database storage'
      );

      const result = interviewer.generateQuestions(parsed);

      // Should detect keywords in nested content
      const securityCoverage = result.coverageChecklist.find(c => c.category === 'security_secrets');
      expect(securityCoverage?.status).toBe('covered');
    });

    it('should handle empty section content', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Empty', '', 1)],
        'Empty Content'
      );

      const result = interviewer.generateQuestions(parsed);

      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.coverageChecklist.length).toBe(9);
    });

    it('should handle very long rawText', () => {
      const longContent = 'This is a test. '.repeat(1000);
      const parsed = createParsedRequirements(
        [createParsedSection('Long', longContent)],
        'Long Project',
        longContent
      );

      const result = interviewer.generateQuestions(parsed);

      expect(result.questions.length).toBeGreaterThan(0);
    });

    it('should handle special characters in content', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Special', 'Use JWT auth <token> & password_hash()')],
        'Special Chars',
        'Use JWT auth <token> & password_hash()'
      );

      const result = interviewer.generateQuestions(parsed);

      const securityCoverage = result.coverageChecklist.find(c => c.category === 'security_secrets');
      expect(securityCoverage?.status).toBe('covered');
    });
  });

  describe('assumptions array', () => {
    it('should populate assumptions array from questions', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Overview', 'Build an app')],
        'Test Project'
      );

      const result = interviewer.generateQuestions(parsed);

      expect(result.assumptions.length).toBe(result.questions.length);
      for (const assumption of result.assumptions) {
        expect(assumption).toBeDefined();
        expect(assumption.length).toBeGreaterThan(0);
      }
    });

    it('should include assumptions from both ambiguity and category questions', () => {
      const parsed = createParsedRequirements(
        [createParsedSection('Overview', 'We maybe need a database. It could be SQL or NoSQL.')],
        'Test Project',
        'We maybe need a database. It could be SQL or NoSQL.'
      );

      const result = interviewer.generateQuestions(parsed);

      // Should have both ambiguity/conflict questions and category questions
      expect(result.assumptions.length).toBe(result.questions.length);
    });
  });
});
