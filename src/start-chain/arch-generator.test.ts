/**
 * Architecture Generator Tests
 * 
 * Tests for the ArchGenerator implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ArchGenerator } from './arch-generator.js';
import type { ArchGeneratorOptions } from './arch-generator.js';
import type { ParsedRequirements, ParsedSection, RequirementsSource } from '../types/index.js';
import type { PRD, Phase, Task } from '../types/prd.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { QuotaManager } from '../platforms/quota-manager.js';
import { UsageTracker } from '../memory/usage-tracker.js';
import { getDefaultConfig } from '../config/default-config.js';
import type { BasePlatformRunner } from '../platforms/base-runner.js';

describe('ArchGenerator', () => {
  let generator: ArchGenerator;

  const createSource = (path: string = 'test.md'): RequirementsSource => ({
    path,
    format: 'markdown',
    size: 0,
    lastModified: new Date().toISOString(),
  });

  const createParsedRequirements = (
    sections: ParsedSection[] = [],
    title: string = 'Test Project',
    rawText: string = '',
    extractedGoals: string[] = [],
    extractedConstraints: string[] = []
  ): ParsedRequirements => ({
    source: createSource(),
    title,
    sections,
    extractedGoals,
    extractedConstraints,
    rawText: rawText || sections.map(s => s.content).join('\n'),
    parseErrors: [],
  });

  const createPRD = (phases: Phase[] = []): PRD => {
    const now = new Date().toISOString();
    return {
      project: 'test-project',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      branchName: 'ralph/main',
      description: 'Test PRD',
      phases,
      metadata: {
        totalPhases: phases.length,
        completedPhases: 0,
        totalTasks: phases.reduce((sum, p) => sum + p.tasks.length, 0),
        completedTasks: 0,
        totalSubtasks: phases.reduce((sum, p) => sum + p.tasks.reduce((s, t) => s + t.subtasks.length, 0), 0),
        completedSubtasks: 0,
      },
    };
  };

  const createPhase = (id: string, title: string, tasks: Task[] = []): Phase => {
    const now = new Date().toISOString();
    return {
      id,
      title,
      description: `${title} description`,
      status: 'pending',
      priority: 1,
      acceptanceCriteria: [],
      testPlan: { commands: [], failFast: true },
      tasks,
      createdAt: now,
      notes: '',
    };
  };

  const createTask = (id: string, title: string, phaseId: string): Task => {
    const now = new Date().toISOString();
    return {
      id,
      phaseId,
      title,
      description: `${title} description`,
      status: 'pending',
      priority: 1,
      acceptanceCriteria: [],
      testPlan: { commands: [], failFast: true },
      subtasks: [],
      createdAt: now,
      notes: '',
    };
  };

  beforeEach(() => {
    generator = new ArchGenerator({ projectName: 'test-project' });
  });

  describe('constructor', () => {
    it('should create generator with default options', () => {
      const gen = new ArchGenerator({ projectName: 'test' });
      expect(gen).toBeDefined();
    });

    it('should create generator with custom options', () => {
      const gen = new ArchGenerator({
        projectName: 'test',
        includeTestStrategy: false,
      });
      expect(gen).toBeDefined();
    });
  });

  describe('generate', () => {
    it('should generate complete architecture document', () => {
      const parsed = createParsedRequirements([], 'Test Project');
      const prd = createPRD();
      const result = generator.generate(parsed, prd);

      expect(result).toContain('# Architecture Document');
      expect(result).toContain('## Overview');
      expect(result).toContain('## Module Breakdown');
      expect(result).toContain('## Dependencies');
      expect(result).toContain('## Tech Stack');
      expect(result).toContain('## Test Strategy');
      expect(result).toContain('## Directory Structure');
    });

    it('should not include test strategy when option is false', () => {
      const gen = new ArchGenerator({
        projectName: 'test',
        includeTestStrategy: false,
      });
      const parsed = createParsedRequirements();
      const prd = createPRD();
      const result = gen.generate(parsed, prd);

      expect(result).not.toContain('## Test Strategy');
      expect(result).toContain('## Directory Structure');
    });

    it('should handle empty PRD', () => {
      const parsed = createParsedRequirements([], 'Test Project');
      const prd = createPRD([]);
      const result = generator.generate(parsed, prd);

      expect(result).toContain('# Architecture Document');
      expect(result).toContain('No modules defined yet');
      expect(result).toContain('No dependencies defined yet');
    });

    it('should include goals in overview when present', () => {
      const parsed = createParsedRequirements(
        [],
        'Test Project',
        '',
        ['Goal 1', 'Goal 2']
      );
      const prd = createPRD();
      const result = generator.generate(parsed, prd);

      expect(result).toContain('### Goals');
      expect(result).toContain('- Goal 1');
      expect(result).toContain('- Goal 2');
    });
  });

  describe('generateOverview', () => {
    it('should generate overview from parsed title', () => {
      const parsed = createParsedRequirements([], 'My Project');
      const prd = createPRD();
      const result = generator.generateOverview(parsed, prd);

      expect(result).toContain('## Overview');
      expect(result).toContain('My Project');
    });

    it('should use PRD description if parsed title is empty', () => {
      const parsed = createParsedRequirements([], '');
      const prd = createPRD();
      prd.description = 'PRD Description';
      const result = generator.generateOverview(parsed, prd);

      expect(result).toContain('PRD Description');
    });

    it('should use default message if no description available', () => {
      const parsed = createParsedRequirements([], '');
      const prd = createPRD();
      prd.description = '';
      const result = generator.generateOverview(parsed, prd);

      expect(result).toContain('Architecture for test-project');
    });
  });

  describe('generateModuleBreakdown', () => {
    it('should generate module breakdown from phases', () => {
      const phase1 = createPhase('PH-001', 'Phase 1', [
        createTask('TK-001-001', 'Task 1', 'PH-001'),
        createTask('TK-001-002', 'Task 2', 'PH-001'),
      ]);
      const prd = createPRD([phase1]);
      const result = generator.generateModuleBreakdown(prd);

      expect(result).toContain('## Module Breakdown');
      expect(result).toContain('### Phase 1');
      expect(result).toContain('**Components:**');
      expect(result).toContain('- Task 1');
      expect(result).toContain('- Task 2');
    });

    it('should handle empty PRD', () => {
      const prd = createPRD([]);
      const result = generator.generateModuleBreakdown(prd);

      expect(result).toContain('## Module Breakdown');
      expect(result).toContain('No modules defined yet');
    });

    it('should handle phases without tasks', () => {
      const phase = createPhase('PH-001', 'Phase 1', []);
      const prd = createPRD([phase]);
      const result = generator.generateModuleBreakdown(prd);

      expect(result).toContain('### Phase 1');
      expect(result).not.toContain('**Components:**');
    });
  });

  describe('generateDependencyGraph', () => {
    it('should generate dependency graph from phases and tasks', () => {
      const phase = createPhase('PH-001', 'Phase 1', [
        createTask('TK-001-001', 'Task 1', 'PH-001'),
        createTask('TK-001-002', 'Task 2', 'PH-001'),
        createTask('TK-001-003', 'Task 3', 'PH-001'),
      ]);
      const prd = createPRD([phase]);
      const result = generator.generateDependencyGraph(prd);

      expect(result).toContain('## Dependencies');
      expect(result).toContain('### Phase Dependencies');
    });

    it('should handle empty PRD', () => {
      const prd = createPRD([]);
      const result = generator.generateDependencyGraph(prd);

      expect(result).toContain('## Dependencies');
      expect(result).toContain('No dependencies defined yet');
    });

    it('should handle phases with single task', () => {
      const phase = createPhase('PH-001', 'Phase 1', [
        createTask('TK-001-001', 'Task 1', 'PH-001'),
      ]);
      const prd = createPRD([phase]);
      const result = generator.generateDependencyGraph(prd);

      expect(result).toContain('Dependencies will be identified during implementation');
    });
  });

  describe('generateTechStack', () => {
    it('should extract tech stack from requirements text', () => {
      const rawText = 'This project uses TypeScript, React, and PostgreSQL for the database.';
      const parsed = createParsedRequirements([], 'Test', rawText);
      const result = generator.generateTechStack(parsed);

      expect(result).toContain('## Tech Stack');
      expect(result).toContain('TypeScript');
      expect(result).toContain('React');
      expect(result).toContain('PostgreSQL');
    });

    it('should categorize technologies', () => {
      const rawText = 'Using TypeScript with Node.js, Express, MongoDB, and Vitest for testing.';
      const parsed = createParsedRequirements([], 'Test', rawText);
      const result = generator.generateTechStack(parsed);

      expect(result).toContain('### Language');
      expect(result).toContain('TypeScript');
      expect(result).toContain('### Framework');
      expect(result).toContain('Node.js');
      expect(result).toContain('Express');
      expect(result).toContain('### Database');
      expect(result).toContain('MongoDB');
      expect(result).toContain('### Testing');
      expect(result).toContain('Vitest');
    });

    it('should handle empty requirements', () => {
      const parsed = createParsedRequirements([], 'Test', '');
      const result = generator.generateTechStack(parsed);

      expect(result).toContain('## Tech Stack');
      expect(result).toContain('Tech stack to be determined');
    });
  });

  describe('generateTestStrategy', () => {
    it('should generate test strategy from PRD test plans', () => {
      const task1 = createTask('TK-001-001', 'Task 1', 'PH-001');
      task1.testPlan = { commands: [{ command: 'npm', args: ['test'] }], failFast: true };
      const phase = createPhase('PH-001', 'Phase 1', [task1]);
      const prd = createPRD([phase]);
      const result = generator.generateTestStrategy(prd);

      expect(result).toContain('## Test Strategy');
      expect(result).toContain('### Test Coverage');
      expect(result).toContain('**Task: Task 1**');
      expect(result).toContain('`npm test`');
    });

    it('should handle empty PRD', () => {
      const prd = createPRD([]);
      const result = generator.generateTestStrategy(prd);

      expect(result).toContain('## Test Strategy');
      expect(result).toContain('Test strategy to be defined');
    });

    it('should handle PRD without test plans', () => {
      const phase = createPhase('PH-001', 'Phase 1', [
        createTask('TK-001-001', 'Task 1', 'PH-001'),
      ]);
      const prd = createPRD([phase]);
      const result = generator.generateTestStrategy(prd);

      // P1-T19: Now includes default test commands even when no test plans defined
      expect(result).toContain('### Default Test Commands');
      expect(result).toContain('Test plans will be developed');
    });

    it('should include phase-level test plans', () => {
      const phase = createPhase('PH-001', 'Phase 1', []);
      phase.testPlan = { commands: [{ command: 'npm', args: ['run', 'test:phase'] }], failFast: true };
      const prd = createPRD([phase]);
      const result = generator.generateTestStrategy(prd);

      expect(result).toContain('**Phase: Phase 1**');
      expect(result).toContain('`npm run test:phase`');
    });
  });

  describe('generateDirectoryStructure', () => {
    it('should generate directory structure from phases', () => {
      const phase = createPhase('PH-001', 'Authentication System', [
        createTask('TK-001-001', 'User Login', 'PH-001'),
      ]);
      const prd = createPRD([phase]);
      const result = generator.generateDirectoryStructure(prd);

      expect(result).toContain('## Directory Structure');
      expect(result).toContain('```');
      expect(result).toContain('src/');
      expect(result).toContain('tests/');
      expect(result).toContain('docs/');
    });

    it('should handle empty PRD', () => {
      const prd = createPRD([]);
      const result = generator.generateDirectoryStructure(prd);

      expect(result).toContain('## Directory Structure');
      expect(result).toContain('Directory structure to be determined');
    });

    it('should convert phase and task titles to directory names', () => {
      const phase = createPhase('PH-001', 'API Gateway', [
        createTask('TK-001-001', 'Request Handler', 'PH-001'),
      ]);
      const prd = createPRD([phase]);
      const result = generator.generateDirectoryStructure(prd);

      expect(result).toContain('api-gateway');
      expect(result).toContain('request-handler');
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
      quotaManager = new QuotaManager(usageTracker, config.budgets, config.budgetEnforcement);
      platformRegistry = PlatformRegistry.createDefault(config);

      // Create mock runner
      mockRunner = {
        execute: vi.fn(),
      } as unknown as BasePlatformRunner;

      // Register mock runner
      platformRegistry.register('claude', mockRunner);
    });

    it('should use template-based generation when AI dependencies not provided', async () => {
      const gen = new ArchGenerator({ projectName: 'test' });
      const parsed = createParsedRequirements([]);
      const prd = createPRD([]);

      const arch = await gen.generateWithAI(parsed, prd, true);
      expect(arch).toBeDefined();
      expect(arch).toContain('# Architecture Document');
    });

    it('should fallback to template-based when quota exhausted', async () => {
      const gen = new ArchGenerator(
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

      const parsed = createParsedRequirements([]);
      const prd = createPRD([]);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const arch = await gen.generateWithAI(parsed, prd, true);

      // Should have been called with quota exhausted warning
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnMessages = consoleWarnSpy.mock.calls.map(call => call[0]?.toString() || '');
      expect(warnMessages.some(msg => msg.includes('Quota exhausted'))).toBe(true);
      expect(arch).toBeDefined();
      expect(arch).toContain('# Architecture Document');
      expect(mockRunner.execute).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should fallback to template-based when platform runner unavailable', async () => {
      const emptyRegistry = new PlatformRegistry();
      const gen = new ArchGenerator(
        { projectName: 'test' },
        emptyRegistry,
        quotaManager,
        config,
        usageTracker
      );

      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });

      const parsed = createParsedRequirements([]);
      const prd = createPRD([]);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const arch = await gen.generateWithAI(parsed, prd, true);

      // Should have been called with platform unavailable warning
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnMessages = consoleWarnSpy.mock.calls.map(call => call[0]?.toString() || '');
      expect(warnMessages.some(msg => msg.includes('Platform runner not available') || msg.includes('not available'))).toBe(true);
      expect(arch).toBeDefined();
      expect(arch).toContain('# Architecture Document');

      consoleWarnSpy.mockRestore();
    });

    it('should fallback to template-based when response too short', async () => {
      const gen = new ArchGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });
      vi.spyOn(mockRunner, 'execute').mockResolvedValue({
        success: true,
        output: 'Short',
        exitCode: 0,
        duration: 1000,
        processId: 12345,
      });

      const parsed = createParsedRequirements([]);
      const prd = createPRD([]);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const arch = await gen.generateWithAI(parsed, prd, true);

      // Should have been called with response too short warning
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnMessages = consoleWarnSpy.mock.calls.map(call => call[0]?.toString() || '');
      expect(warnMessages.some(msg => msg.includes('AI response too short') || msg.includes('too short'))).toBe(true);
      expect(arch).toBeDefined();
      expect(arch).toContain('# Architecture Document');

      consoleWarnSpy.mockRestore();
    });

    it('should successfully generate architecture with AI when all conditions met', async () => {
      const gen = new ArchGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const mockArchitecture = `# Architecture Document

## Overview
This is an AI-generated architecture document for the test project.

## Module Breakdown
- Module 1: Core functionality
- Module 2: Integration layer

## Dependencies
- Module 1 depends on Module 2

## Tech Stack
- TypeScript
- Node.js

## Test Strategy
- Unit tests
- Integration tests

## Directory Structure
\`\`\`
src/
tests/
\`\`\`
`;

      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });
      vi.spyOn(mockRunner, 'execute').mockResolvedValue({
        success: true,
        output: mockArchitecture,
        exitCode: 0,
        duration: 1000,
        processId: 12345,
        tokensUsed: 3000,
      });

      const trackSpy = vi.spyOn(usageTracker, 'track').mockResolvedValue(undefined);

      const parsed = createParsedRequirements([]);
      const prd = createPRD([]);

      const arch = await gen.generateWithAI(parsed, prd, true);

      expect(arch).toBeDefined();
      expect(arch).toContain('# Architecture Document');
      // The architecture should contain content from the mock
      expect(arch.length).toBeGreaterThan(100);
      expect(mockRunner.execute).toHaveBeenCalled();
      // P1-T19: Action name changed to indicate single-pass
      expect(trackSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          platform: 'claude',
          action: 'architecture_single_pass',
          success: true,
        })
      );

      trackSpy.mockRestore();
    });

    it('should extract markdown from code blocks', async () => {
      const gen = new ArchGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const mockArchitecture = '# Architecture Document\n\nContent here.';

      vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });
      vi.spyOn(mockRunner, 'execute').mockResolvedValue({
        success: true,
        output: `Here is the architecture:\n\n\`\`\`markdown\n${mockArchitecture}\n\`\`\``,
        exitCode: 0,
        duration: 1000,
        processId: 12345,
      });

      const parsed = createParsedRequirements([]);
      const prd = createPRD([]);
      const arch = await gen.generateWithAI(parsed, prd, true);

      expect(arch).toBeDefined();
      expect(arch).toContain('# Architecture Document');
      // The extracted markdown should contain the architecture content
      expect(arch.length).toBeGreaterThan(50);
    });
  });

  describe('P1-T19: Architecture validation', () => {
    it('should validate architecture document has required sections', () => {
      const gen = new ArchGenerator({ projectName: 'test' });
      
      const validArch = `# Architecture Document: test

## Overview
This is the system overview.

## Data Model & Persistence
Database design here.

## API/Service Boundaries
Service interfaces here.

## Deployment & Environments
Deployment strategy here.

## Observability
Logging and metrics here.

## Security
Authentication and authorization here.

## Test Strategy
- Command: \`npm test\`

## Directory Structure
\`\`\`
src/
tests/
\`\`\`
`;

      const result = gen.validateArchitecture(validArch);
      
      expect(result.detectedSections.length).toBeGreaterThan(0);
      expect(result.detectedSections).toContain('overview');
      expect(result.documentLength).toBeGreaterThan(0);
    });

    it('should detect missing required sections', () => {
      const gen = new ArchGenerator({ 
        projectName: 'test',
        multiPassConfig: { requireAllSections: true }
      });
      
      const incompleteArch = `# Architecture Document

## Overview
Just an overview, nothing else.
`;

      const result = gen.validateArchitecture(incompleteArch);
      
      expect(result.valid).toBe(false);
      expect(result.missingSections.length).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should detect manual-only verification', () => {
      const gen = new ArchGenerator({ 
        projectName: 'test',
        multiPassConfig: { rejectManualOnly: true }
      });
      
      const archWithManual = `# Architecture Document

## Overview
System overview.

## Test Strategy
Please manually verify the UI looks correct.
Visual inspection required for design review.
`;

      const result = gen.validateArchitecture(archWithManual);
      
      expect(result.hasManualOnlyVerification).toBe(true);
      expect(result.errors.some(e => e.includes('manual-only'))).toBe(true);
    });

    it('should fail validation for documents that are too short', () => {
      const gen = new ArchGenerator({ 
        projectName: 'test',
        multiPassConfig: { minDocLength: 1000 }
      });
      
      const shortArch = '# Architecture\n\nShort.';

      const result = gen.validateArchitecture(shortArch);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('too short'))).toBe(true);
    });
  });

  describe('P1-T19: Template-based generation enhancements', () => {
    it('should include all required sections in template-based generation', () => {
      const gen = new ArchGenerator({ projectName: 'test' });
      const parsed = createParsedRequirements([], 'Test Project');
      const prd = createPRD([createPhase('PH-001', 'Phase 1', [
        createTask('TK-001-001', 'Task 1', 'PH-001'),
      ])]);

      const arch = gen.generate(parsed, prd);

      // Check all required sections are present
      expect(arch).toContain('## Overview');
      expect(arch).toContain('## Data Model & Persistence');
      expect(arch).toContain('## API/Service Boundaries');
      expect(arch).toContain('## Deployment & Environments');
      expect(arch).toContain('## Observability');
      expect(arch).toContain('## Security');
      expect(arch).toContain('## Test Strategy');
      expect(arch).toContain('## Directory Structure');
    });

    it('should include test commands in test strategy', () => {
      const gen = new ArchGenerator({ projectName: 'test' });
      const parsed = createParsedRequirements([], 'Test Project');
      const prd = createPRD([]);

      const arch = gen.generate(parsed, prd);
      const testSection = arch.substring(arch.indexOf('## Test Strategy'));

      // Should have executable commands
      expect(testSection).toMatch(/`npm\s+\w+`/);
    });

    it('should extract relevant content for security section', () => {
      const generator = new ArchGenerator({ projectName: 'test' });
      const rawText = 'The system must use JWT tokens for authentication. Users must be authorized before accessing admin features.';
      const parsed = createParsedRequirements(
        [{ title: 'Security', content: rawText, level: 2, children: [] }],
        'Secure App',
        rawText
      );
      const prd = createPRD([]);

      const arch = generator.generate(parsed, prd);

      expect(arch).toContain('## Security');
      // Should extract security-related content
      expect(arch.toLowerCase()).toContain('auth');
    });
  });

  describe('P1-T19: Multi-pass configuration', () => {
    it('should respect custom multi-pass configuration', () => {
      const gen = new ArchGenerator({
        projectName: 'test',
        multiPassConfig: {
          enabled: true,
          largeDocThreshold: 100, // Very low threshold
          minDocLength: 50,
          requireAllSections: false,
          rejectManualOnly: false,
        }
      });

      // With low threshold, even small docs should be considered for multi-pass
      // (though multi-pass requires AI dependencies)
      expect(gen).toBeDefined();
    });

    it('should disable multi-pass when configured', async () => {
      const gen = new ArchGenerator({
        projectName: 'test',
        multiPassConfig: {
          enabled: false,
        }
      });
      
      const parsed = createParsedRequirements([], 'Test');
      const prd = createPRD([]);

      // Should use template-based generation
      const arch = await gen.generateWithAI(parsed, prd, false);
      
      expect(arch).toContain('# Architecture Document');
    });
  });
});
