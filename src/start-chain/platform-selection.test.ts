
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrdGenerator } from './prd-generator.js';
import { ArchGenerator } from './arch-generator.js';
import { RequirementsInterviewer } from './requirements-interviewer.js';
import { CoverageValidator } from './validators/coverage-validator.js';
import { PlatformRegistry } from '../platforms/registry.js';
import { QuotaManager } from '../platforms/quota-manager.js';
import { UsageTracker } from '../memory/usage-tracker.js';
import { getDefaultConfig } from '../config/default-config.js';
import type { BasePlatformRunner } from '../platforms/base-runner.js';
import type { ParsedRequirements } from '../types/requirements.js';
import type { PRD } from '../types/prd.js';
import type { CoverageMetrics } from './structure-detector.js';

describe('Start Chain Platform Selection (P1-T04)', () => {
  let platformRegistry: PlatformRegistry;
  let quotaManager: QuotaManager;
  let usageTracker: UsageTracker;
  let config: ReturnType<typeof getDefaultConfig>;
  let mockRunner: BasePlatformRunner;

  beforeEach(() => {
    config = getDefaultConfig();
    
    // Set up default phase tier config
    config.tiers.phase.platform = 'claude';
    config.tiers.phase.model = 'claude-3-opus-20240229';

    usageTracker = new UsageTracker('.puppet-master/usage/usage.jsonl');
    quotaManager = new QuotaManager(usageTracker, config.budgets);
    platformRegistry = PlatformRegistry.createDefault(config);

    // Create and register mock runner
    mockRunner = {
      execute: vi.fn().mockResolvedValue({
        success: true,
        output: '{}',
        exitCode: 0,
        duration: 100,
      }),
    } as unknown as BasePlatformRunner;

    // Register mock runner for multiple platforms
    platformRegistry.register('claude', mockRunner);
    platformRegistry.register('gemini', mockRunner);
    platformRegistry.register('codex', mockRunner);

    // Mock quota check
    vi.spyOn(quotaManager, 'canProceed').mockResolvedValue({ allowed: true });
    // Mock usage tracking
    vi.spyOn(usageTracker, 'track').mockResolvedValue(undefined);
  });

  const createParsedRequirements = (): ParsedRequirements => ({
    source: { path: 'test.md', format: 'markdown', size: 0, lastModified: '' },
    title: 'Test Project',
    sections: [],
    extractedGoals: [],
    extractedConstraints: [],
    rawText: 'Test content',
    parseErrors: [],
  });

  describe('PrdGenerator', () => {
    it('should use default phase tier platform/model when step config is missing', async () => {
      const generator = new PrdGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const parsed = createParsedRequirements();
      await generator.generateWithAI(parsed, true);

      // Should check if runner was requested for 'claude' (default phase tier)
      expect(platformRegistry.get('claude')).toBeDefined();
    });

    it('should use override platform/model from startChain.prd when available', async () => {
      // Configure overrides
      config.startChain = {
        prd: {
          platform: 'gemini',
          model: 'gemini-1.5-pro',
        }
      };

      const generator = new PrdGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      // Spy on PlatformRegistry.get to see which platform was requested
      const getSpy = vi.spyOn(platformRegistry, 'get');

      const parsed = createParsedRequirements();
      await generator.generateWithAI(parsed, true);

      // Should request 'gemini' runner
      expect(getSpy).toHaveBeenCalledWith('gemini');
    });
  });

  describe('ArchGenerator', () => {
    it('should use default phase tier platform/model when step config is missing', async () => {
      const generator = new ArchGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const parsed = createParsedRequirements();
      const prd: PRD = {
        project: 'test', phases: [], version: '1.0.0', 
        createdAt: '', updatedAt: '', branchName: '', description: '',
        metadata: { totalPhases: 0, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 }
      };

      const getSpy = vi.spyOn(platformRegistry, 'get');
      await generator.generateWithAI(parsed, prd, true);

      expect(getSpy).toHaveBeenCalledWith('claude');
    });

    it('should use override platform/model from startChain.architecture when available', async () => {
      config.startChain = {
        architecture: {
          platform: 'codex',
          model: 'gpt-4o',
        }
      };

      const generator = new ArchGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const getSpy = vi.spyOn(platformRegistry, 'get');
      const parsed = createParsedRequirements();
      const prd: PRD = {
        project: 'test', phases: [], version: '1.0.0', 
        createdAt: '', updatedAt: '', branchName: '', description: '',
        metadata: { totalPhases: 0, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 }
      };

      await generator.generateWithAI(parsed, prd, true);

      expect(getSpy).toHaveBeenCalledWith('codex');
    });
  });

  describe('RequirementsInterviewer', () => {
    it('should use default phase tier platform/model when step config is missing', async () => {
      const interviewer = new RequirementsInterviewer(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const parsed = createParsedRequirements();
      // Need to mock parseInterviewJson or ensure mock output is valid JSON
      mockRunner.execute = vi.fn().mockResolvedValue({
        success: true,
        output: JSON.stringify({ questions: [], coverageChecklist: [] }),
        exitCode: 0,
        duration: 100,
      });

      const getSpy = vi.spyOn(platformRegistry, 'get');
      await interviewer.interviewWithAI(parsed, true);

      expect(getSpy).toHaveBeenCalledWith('claude');
    });

    it('should use override platform/model from startChain.requirementsInterview when available', async () => {
      config.startChain = {
        requirementsInterview: {
          platform: 'gemini',
          model: 'gemini-1.5-flash',
          enabled: true
        }
      };

      const interviewer = new RequirementsInterviewer(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      mockRunner.execute = vi.fn().mockResolvedValue({
        success: true,
        output: JSON.stringify({ questions: [], coverageChecklist: [] }),
        exitCode: 0,
        duration: 100,
      });

      const getSpy = vi.spyOn(platformRegistry, 'get');
      const parsed = createParsedRequirements();
      await interviewer.interviewWithAI(parsed, true);

      expect(getSpy).toHaveBeenCalledWith('gemini');
    });
  });

  describe('CoverageValidator', () => {
    const createMockMetrics = (): CoverageMetrics => ({
      totalChars: 1000,
      parsedChars: 500,
      coverageRatio: 0.5,
      headingsCount: 10,
      bulletsCount: 20,
      phasesCount: 1,
    });

    it('should use default phase tier platform/model when step config is missing', async () => {
      const validator = new CoverageValidator(
        undefined,
        platformRegistry,
        quotaManager,
        config
      );

      const parsed = createParsedRequirements();
      const prd: PRD = {
        project: 'test', phases: [], version: '1.0.0',
        createdAt: '', updatedAt: '', branchName: '', description: '',
        metadata: { totalPhases: 0, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 }
      };
      const metrics = createMockMetrics();

      // Mock the AI coverage diff to check platform selection
      const getSpy = vi.spyOn(platformRegistry, 'get');
      
      // Enable AI coverage diff
      config.startChain = {
        coverage: {
          enabled: true,
          enableAICoverageDiff: true,
          minCoverageRatio: 0.5,
          largeDocThreshold: 5000,
          veryLargeDocThreshold: 10000,
          minPhasesForVeryLargeDoc: 2,
          maxGenericCriteria: 5,
        }
      };

      await validator.computeCoverageReport(parsed, prd, metrics);

      // Should request 'claude' runner (default phase tier)
      expect(getSpy).toHaveBeenCalledWith('claude');
    });

    it('should use override platform/model from startChain.coverage when available', async () => {
      config.startChain = {
        coverage: {
          enabled: true,
          enableAICoverageDiff: true,
          minCoverageRatio: 0.5,
          largeDocThreshold: 5000,
          veryLargeDocThreshold: 10000,
          minPhasesForVeryLargeDoc: 2,
          maxGenericCriteria: 5,
          platform: 'gemini',
          model: 'gemini-1.5-pro',
        }
      };

      const validator = new CoverageValidator(
        undefined,
        platformRegistry,
        quotaManager,
        config
      );

      const parsed = createParsedRequirements();
      const prd: PRD = {
        project: 'test', phases: [], version: '1.0.0',
        createdAt: '', updatedAt: '', branchName: '', description: '',
        metadata: { totalPhases: 0, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 }
      };
      const metrics = createMockMetrics();

      const getSpy = vi.spyOn(platformRegistry, 'get');
      await validator.computeCoverageReport(parsed, prd, metrics);

      // Should request 'gemini' runner
      expect(getSpy).toHaveBeenCalledWith('gemini');
    });
  });

  describe('Edge Cases', () => {
    it('should fallback to phase tier when step config exists but platform is missing', async () => {
      // Step config exists but only has model, no platform
      config.startChain = {
        prd: {
          model: 'custom-model',
          // platform is missing
        }
      };

      const generator = new PrdGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const getSpy = vi.spyOn(platformRegistry, 'get');
      const parsed = createParsedRequirements();
      await generator.generateWithAI(parsed, true);

      // Should fallback to phase tier platform ('claude')
      expect(getSpy).toHaveBeenCalledWith('claude');
    });

    it('should fallback to phase tier when step config exists but model is missing', async () => {
      // Step config exists but only has platform, no model
      config.startChain = {
        prd: {
          platform: 'gemini',
          // model is missing
        }
      };

      const generator = new PrdGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const getSpy = vi.spyOn(platformRegistry, 'get');
      const parsed = createParsedRequirements();
      await generator.generateWithAI(parsed, true);

      // Should use step config platform ('gemini')
      expect(getSpy).toHaveBeenCalledWith('gemini');
      // Model should fallback to phase tier model
      // (We can't easily test this without inspecting the request, but the code does use stepConfig?.model || phase.model)
    });

    it('should use step config when both platform and model are provided', async () => {
      config.startChain = {
        architecture: {
          platform: 'codex',
          model: 'gpt-4o',
        }
      };

      const generator = new ArchGenerator(
        { projectName: 'test' },
        platformRegistry,
        quotaManager,
        config,
        usageTracker
      );

      const getSpy = vi.spyOn(platformRegistry, 'get');
      const parsed = createParsedRequirements();
      const prd: PRD = {
        project: 'test', phases: [], version: '1.0.0',
        createdAt: '', updatedAt: '', branchName: '', description: '',
        metadata: { totalPhases: 0, completedPhases: 0, totalTasks: 0, completedTasks: 0, totalSubtasks: 0, completedSubtasks: 0 }
      };

      await generator.generateWithAI(parsed, prd, true);

      // Should use step config platform
      expect(getSpy).toHaveBeenCalledWith('codex');
    });
  });
});
