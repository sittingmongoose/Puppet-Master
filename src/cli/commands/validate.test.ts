/**
 * Tests for validate command
 * 
 * Tests the validate command implementation with ConfigManager, PrdManager,
 * ValidationGate, and AgentsManager integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import {
  ValidateCommand,
  validateAction,
  type ValidateOptions,
} from './validate.js';
import type { PuppetMasterConfig } from '../../types/config.js';
import type { PRD } from '../../types/prd.js';
import type { ValidationResult as GateValidationResult } from '../../start-chain/validation-gate.js';
import type { AgentsContent } from '../../memory/agents-manager.js';

// Mock dependencies
vi.mock('../../config/config-manager.js', () => ({
  ConfigManager: vi.fn(),
}));

vi.mock('../../config/config-schema.js', () => ({
  ConfigValidationError: class extends Error {
    constructor(message: string, public readonly path: string[] = []) {
      super(message);
      this.name = 'ConfigValidationError';
    }
  },
}));

vi.mock('../../memory/prd-manager.js', () => ({
  PrdManager: vi.fn(),
}));

vi.mock('../../start-chain/validation-gate.js', () => ({
  ValidationGate: vi.fn(),
}));

vi.mock('../../memory/agents-manager.js', () => ({
  AgentsManager: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(),
}));

import { ConfigManager } from '../../config/config-manager.js';
import { ConfigValidationError } from '../../config/config-schema.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { ValidationGate } from '../../start-chain/validation-gate.js';
import { AgentsManager } from '../../memory/agents-manager.js';
import { existsSync } from 'fs';

// Mock console methods
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock process.exit
const processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as never);

describe('ValidateCommand', () => {
  let command: ValidateCommand;
  let mockProgram: Command;

  beforeEach(() => {
    command = new ValidateCommand();
    mockProgram = new Command();
    vi.clearAllMocks();
  });

  describe('CommandModule implementation', () => {
    it('should implement CommandModule interface', () => {
      expect(command).toBeDefined();
      expect(typeof command.register).toBe('function');
    });

    it('should register validate command with program', () => {
      const registerSpy = vi.spyOn(mockProgram, 'command');
      command.register(mockProgram);

      expect(registerSpy).toHaveBeenCalledWith('validate');
    });

    it('should set correct description', () => {
      const descriptionSpy = vi.spyOn(Command.prototype, 'description');
      command.register(mockProgram);

      expect(descriptionSpy).toHaveBeenCalledWith('Validate project configuration and state files');
    });

    it('should register all expected options', () => {
      const optionSpy = vi.spyOn(Command.prototype, 'option');
      command.register(mockProgram);

      const optionCalls = optionSpy.mock.calls.map(call => call[0]);
      expect(optionCalls).toContain('-c, --config <path>');
      expect(optionCalls).toContain('--target <type>');
      expect(optionCalls).toContain('--fix');
      expect(optionCalls).toContain('--json');
      expect(optionCalls).toContain('-v, --verbose');
    });
  });
});

describe('validateAction', () => {
  let mockConfig: PuppetMasterConfig;
  let mockConfigManager: {
    load: ReturnType<typeof vi.fn>;
    validate: ReturnType<typeof vi.fn>;
  };
  let mockPrdManager: {
    load: ReturnType<typeof vi.fn>;
  };
  let mockValidationGate: {
    validatePrd: ReturnType<typeof vi.fn>;
  };
  let mockAgentsManager: {
    loadFile: ReturnType<typeof vi.fn>;
  };

  /**
   * Helper to create a sample config
   */
  function createSampleConfig(): PuppetMasterConfig {
    return {
      project: {
        name: 'TestProject',
        workingDirectory: '/test/project',
      },
      tiers: {
        phase: {
          platform: 'cursor',
          model: 'gpt-4',
          selfFix: false,
          maxIterations: 3,
          escalation: null,
        },
        task: {
          platform: 'cursor',
          model: 'gpt-4',
          selfFix: false,
          maxIterations: 3,
          escalation: 'phase',
        },
        subtask: {
          platform: 'cursor',
          model: 'gpt-4',
          selfFix: false,
          maxIterations: 3,
          escalation: 'task',
        },
        iteration: {
          platform: 'cursor',
          model: 'gpt-4',
          selfFix: false,
          maxIterations: 3,
          escalation: 'subtask',
        },
      },
      branching: {
        baseBranch: 'main',
        namingPattern: 'ralph/{phase}',
        granularity: 'single',
        pushPolicy: 'per-iteration',
        mergePolicy: 'merge',
        autoPr: false,
      },
      verification: {
        browserAdapter: 'playwright',
        screenshotOnFailure: true,
        evidenceDirectory: '.puppet-master/evidence',
      },
      memory: {
        progressFile: 'progress.txt',
        agentsFile: 'AGENTS.md',
        prdFile: '.puppet-master/prd.json',
        multiLevelAgents: false,
        agentsEnforcement: {
          requireUpdateOnFailure: false,
          requireUpdateOnGotcha: false,
          gateFailsOnMissingUpdate: false,
          reviewerMustAcknowledge: false,
        },
      },
      budgets: {
        cursor: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 500,
          fallbackPlatform: null,
        },
        codex: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 500,
          fallbackPlatform: null,
        },
        claude: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 500,
          fallbackPlatform: null,
        },
        gemini: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
        copilot: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
        antigravity: {
          maxCallsPerRun: 100,
          maxCallsPerHour: 50,
          maxCallsPerDay: 200,
          fallbackPlatform: null,
        },
      },
      budgetEnforcement: {
        onLimitReached: 'pause',
        warnAtPercentage: 80,
        notifyOnFallback: true,
      },
      logging: {
        level: 'info',
        retentionDays: 30,
      },
      cliPaths: {
        cursor: 'cursor',
        codex: 'codex',
        claude: 'claude',
        gemini: 'gemini',
        copilot: 'copilot',
        antigravity: 'agy',
      },
    };
  }

  /**
   * Helper to create a sample PRD
   */
  function createSamplePRD(): PRD {
    const now = new Date().toISOString();
    return {
      project: 'TestProject',
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      branchName: 'main',
      description: 'Test PRD',
      phases: [
        {
          id: 'PH-001',
          title: 'Test Phase',
          description: 'Test phase description',
          status: 'pending',
          priority: 1,
          acceptanceCriteria: [],
          testPlan: {
            commands: [],
            failFast: false,
          },
          createdAt: now,
          notes: '',
          tasks: [],
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
  }

  /**
   * Helper to create a sample AgentsContent
   */
  function createSampleAgentsContent(): AgentsContent {
    return {
      level: 'root',
      path: '/test/project/AGENTS.md',
      content: '# Test Project - Agent Instructions\n\n## Project Overview\nTest project overview.\n\n## Architecture Notes\n- Note 1\n\n## Codebase Patterns\n- Pattern 1\n\n## Common Failure Modes\n- Failure 1\n\n## DO\n- Do item 1\n\n## DON\'T\n- Don\'t item 1\n',
      sections: {
        overview: 'Test project overview.',
        architectureNotes: ['Note 1'],
        codebasePatterns: ['Pattern 1'],
        toolingRules: [],
        commonFailureModes: [{ description: 'Failure 1', fix: 'Fix 1' }],
        doItems: ['Do item 1'],
        dontItems: ['Don\'t item 1'],
        testing: [],
        directoryStructure: [],
      },
    };
  }

  beforeEach(() => {
    mockConfig = createSampleConfig();
    mockConfigManager = {
      load: vi.fn().mockResolvedValue(mockConfig),
      validate: vi.fn().mockReturnValue(mockConfig),
    };
    mockPrdManager = {
      load: vi.fn().mockResolvedValue(createSamplePRD()),
    };
    mockValidationGate = {
      validatePrd: vi.fn().mockReturnValue({
        valid: true,
        errors: [],
        warnings: [],
      } as GateValidationResult),
    };
    mockAgentsManager = {
      loadFile: vi.fn().mockResolvedValue(createSampleAgentsContent()),
    };

    (ConfigManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockConfigManager);
    (PrdManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockPrdManager);
    (ValidationGate as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockValidationGate);
    (AgentsManager as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => mockAgentsManager);
    (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('validating valid files', () => {
    it('should validate all files successfully', async () => {
      const options: ValidateOptions = {
        target: 'all',
      };

      await validateAction(options);

      expect(mockConfigManager.load).toHaveBeenCalled();
      expect(mockPrdManager.load).toHaveBeenCalled();
      expect(mockValidationGate.validatePrd).toHaveBeenCalled();
      expect(mockAgentsManager.loadFile).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should validate only config when target is config', async () => {
      const options: ValidateOptions = {
        target: 'config',
      };

      await validateAction(options);

      expect(mockConfigManager.load).toHaveBeenCalled();
      expect(mockPrdManager.load).not.toHaveBeenCalled();
      expect(mockAgentsManager.loadFile).not.toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should validate only prd when target is prd', async () => {
      const options: ValidateOptions = {
        target: 'prd',
      };

      await validateAction(options);

      expect(mockConfigManager.load).toHaveBeenCalled();
      expect(mockPrdManager.load).toHaveBeenCalled();
      expect(mockValidationGate.validatePrd).toHaveBeenCalled();
      expect(mockAgentsManager.loadFile).not.toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should validate only agents when target is agents', async () => {
      const options: ValidateOptions = {
        target: 'agents',
      };

      await validateAction(options);

      expect(mockConfigManager.load).toHaveBeenCalled();
      expect(mockPrdManager.load).not.toHaveBeenCalled();
      expect(mockAgentsManager.loadFile).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });
  });

  describe('detecting invalid config', () => {
    it('should detect config validation errors', async () => {
      const validationError = new ConfigValidationError('Missing required key: project', ['project']);
      mockConfigManager.validate = vi.fn().mockImplementation(() => {
        throw validationError;
      });

      const options: ValidateOptions = {
        target: 'config',
      };

      await validateAction(options);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle config load errors', async () => {
      mockConfigManager.load = vi.fn().mockRejectedValue(new Error('Config file not found'));

      const options: ValidateOptions = {
        target: 'config',
      };

      await validateAction(options);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('detecting invalid PRD', () => {
    it('should detect PRD validation errors', async () => {
      mockValidationGate.validatePrd = vi.fn().mockReturnValue({
        valid: false,
        errors: [
          {
            code: 'PRD_MISSING_ID',
            message: 'Phase at index 0 is missing an ID',
            path: 'phases[0].id',
            suggestion: 'Add a unique ID to the phase (format: PH-001)',
          },
        ],
        warnings: [],
      } as GateValidationResult);

      const options: ValidateOptions = {
        target: 'prd',
      };

      await validateAction(options);

      expect(mockValidationGate.validatePrd).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle PRD load errors', async () => {
      mockPrdManager.load = vi.fn().mockRejectedValue(new Error('PRD file not found'));

      const options: ValidateOptions = {
        target: 'prd',
      };

      await validateAction(options);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle PRD not found (ENOENT)', async () => {
      const enoentError = new Error('ENOENT: no such file or directory');
      (enoentError as NodeJS.ErrnoException).code = 'ENOENT';
      mockPrdManager.load = vi.fn().mockRejectedValue(enoentError);

      const options: ValidateOptions = {
        target: 'prd',
      };

      await validateAction(options);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('detecting invalid AGENTS.md', () => {
    it('should detect missing AGENTS.md file', async () => {
      (existsSync as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const options: ValidateOptions = {
        target: 'agents',
      };

      await validateAction(options);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should detect missing sections in AGENTS.md', async () => {
      const emptyAgentsContent: AgentsContent = {
        level: 'root',
        path: '/test/project/AGENTS.md',
        content: '# Test Project\n',
        sections: {
          overview: '',
          architectureNotes: [],
          codebasePatterns: [],
          toolingRules: [],
          commonFailureModes: [],
          doItems: [],
          dontItems: [],
          testing: [],
          directoryStructure: [],
        },
      };
      mockAgentsManager.loadFile = vi.fn().mockResolvedValue(emptyAgentsContent);

      const options: ValidateOptions = {
        target: 'agents',
      };

      await validateAction(options);

      expect(consoleLogSpy).toHaveBeenCalled();
      // Should still exit with 0 because warnings don't fail validation
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should handle AGENTS.md parse errors', async () => {
      mockAgentsManager.loadFile = vi.fn().mockRejectedValue(new Error('Parse error'));

      const options: ValidateOptions = {
        target: 'agents',
      };

      await validateAction(options);

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('JSON output format', () => {
    it('should output JSON when --json flag is set', async () => {
      const options: ValidateOptions = {
        target: 'all',
        json: true,
      };

      await validateAction(options);

      const logCalls = consoleLogSpy.mock.calls;
      expect(logCalls.length).toBeGreaterThan(0);
      
      // Check that output is valid JSON
      const jsonOutput = logCalls[logCalls.length - 1][0] as string;
      expect(() => JSON.parse(jsonOutput)).not.toThrow();
      
      const parsed = JSON.parse(jsonOutput);
      expect(parsed).toHaveProperty('valid');
      expect(parsed).toHaveProperty('results');
      expect(Array.isArray(parsed.results)).toBe(true);
    });
  });

  describe('fix mode', () => {
    it('should report fix status when --fix flag is set', async () => {
      const options: ValidateOptions = {
        target: 'all',
        fix: true,
      };

      await validateAction(options);

      expect(consoleLogSpy).toHaveBeenCalled();
      // Fix mode doesn't actually fix, just reports
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });
  });

  describe('error collection', () => {
    it('should report all errors, not just first', async () => {
      mockValidationGate.validatePrd = vi.fn().mockReturnValue({
        valid: false,
        errors: [
          {
            code: 'PRD_MISSING_ID',
            message: 'Phase at index 0 is missing an ID',
            path: 'phases[0].id',
            suggestion: 'Add a unique ID to the phase',
          },
          {
            code: 'PRD_MISSING_TITLE',
            message: 'Phase at index 1 is missing a title',
            path: 'phases[1].title',
            suggestion: 'Add a title to the phase',
          },
        ],
        warnings: [],
      } as GateValidationResult);

      const options: ValidateOptions = {
        target: 'prd',
      };

      await validateAction(options);

      const logOutput = consoleLogSpy.mock.calls.map(call => call[0]).join('\n');
      expect(logOutput).toContain('PRD_MISSING_ID');
      expect(logOutput).toContain('PRD_MISSING_TITLE');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('error handling', () => {
    it('should handle config load errors gracefully', async () => {
      mockConfigManager.load = vi.fn().mockRejectedValue(new Error('Unexpected error'));

      const options: ValidateOptions = {
        target: 'config',
      };

      await validateAction(options);

      // Errors are caught and converted to ValidationError format, displayed via console.log
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should handle unexpected errors in validateAction catch block', async () => {
      // Simulate an error that occurs outside of validators (e.g., in formatHumanReadable)
      // by making console.log throw
      consoleLogSpy.mockImplementationOnce(() => {
        throw new Error('Unexpected error in validateAction');
      });

      const options: ValidateOptions = {
        target: 'config',
      };

      await validateAction(options);

      // The error should be caught by the top-level catch block
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should show stack trace in verbose mode when error occurs in validateAction', async () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      
      // Make console.log throw to simulate an error in validateAction itself
      consoleLogSpy.mockImplementationOnce(() => {
        throw error;
      });

      const options: ValidateOptions = {
        target: 'config',
        verbose: true,
      };

      await validateAction(options);

      // The error should be caught by the top-level catch block and logged with stack trace
      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorCalls = consoleErrorSpy.mock.calls.map(call => String(call[0])).join('\n');
      expect(errorCalls).toContain('Test error');
      expect(errorCalls).toContain('at test.js:1:1');
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
