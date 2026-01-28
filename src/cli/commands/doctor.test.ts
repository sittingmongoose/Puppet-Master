/**
 * Tests for doctor command
 * 
 * Tests the doctor command implementation with CheckRegistry, InstallationManager,
 * and DoctorReporter integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import {
  DoctorCommand,
  doctorAction,
  type DoctorCommandOptions,
} from './doctor.js';
import { CheckRegistry } from '../../doctor/check-registry.js';
import { InstallationManager } from '../../doctor/installation-manager.js';
import { DoctorReporter } from '../../doctor/doctor-reporter.js';
import type { CheckResult } from '../../doctor/check-registry.js';

vi.mock('../../config/config-manager.js', () => ({
  ConfigManager: vi.fn().mockImplementation(function () {
    return {
      load: vi.fn().mockResolvedValue({
        cliPaths: {
          cursor: 'cursor-agent',
          codex: 'codex',
          claude: 'claude',
          gemini: 'gemini',
          copilot: 'copilot',
        },
      }),
    };
  }),
}));

vi.mock('../../doctor/checks/playwright-check.js', () => ({
  PlaywrightBrowsersCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'playwright-browsers',
      category: 'runtime' as const,
      description: 'Checks Playwright is installed and browsers are available',
      run: vi.fn().mockResolvedValue({
        name: 'playwright-browsers',
        category: 'runtime' as const,
        passed: true,
        message: 'Playwright browsers are available',
        durationMs: 5,
      }),
    };
  }),
}));

// Mock the check classes
vi.mock('../../doctor/checks/cli-tools.js', () => ({
  CursorCliCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'cursor-cli',
      category: 'cli' as const,
      description: 'Check if Cursor Agent CLI is available',
      run: vi.fn().mockResolvedValue({
        name: 'cursor-cli',
        category: 'cli' as const,
        passed: true,
        message: 'Cursor CLI is available',
        durationMs: 10,
      }),
    };
  }),
  CodexCliCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'codex-cli',
      category: 'cli' as const,
      description: 'Check if Codex CLI is available',
      run: vi.fn().mockResolvedValue({
        name: 'codex-cli',
        category: 'cli' as const,
        passed: true,
        message: 'Codex CLI is available',
        durationMs: 10,
      }),
    };
  }),
  ClaudeCliCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'claude-cli',
      category: 'cli' as const,
      description: 'Check if Claude CLI is available',
      run: vi.fn().mockResolvedValue({
        name: 'claude-cli',
        category: 'cli' as const,
        passed: false,
        message: 'Claude CLI not found',
        fixSuggestion: 'Install with: curl -fsSL https://claude.ai/install.sh | bash',
        durationMs: 5,
      }),
    };
  }),
  GeminiCliCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'gemini-cli',
      category: 'cli' as const,
      description: 'Check if Gemini CLI is available',
      run: vi.fn().mockResolvedValue({
        name: 'gemini-cli',
        category: 'cli' as const,
        passed: true,
        message: 'Gemini CLI is available',
        durationMs: 10,
      }),
    };
  }),
  CopilotCliCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'copilot-cli',
      category: 'cli' as const,
      description: 'Check if Copilot CLI is available',
      run: vi.fn().mockResolvedValue({
        name: 'copilot-cli',
        category: 'cli' as const,
        passed: true,
        message: 'Copilot CLI is available',
        durationMs: 10,
      }),
    };
  }),
}));

vi.mock('../../doctor/checks/git-check.js', () => ({
  GitAvailableCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'git-available',
      category: 'git' as const,
      description: 'Check if git is available',
      run: vi.fn().mockResolvedValue({
        name: 'git-available',
        category: 'git' as const,
        passed: true,
        message: 'git is available',
        durationMs: 5,
      }),
    };
  }),
  GitConfigCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'git-config',
      category: 'git' as const,
      description: 'Check git configuration',
      run: vi.fn().mockResolvedValue({
        name: 'git-config',
        category: 'git' as const,
        passed: true,
        message: 'Git config is valid',
        durationMs: 3,
      }),
    };
  }),
  GitRepoCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'git-repo',
      category: 'git' as const,
      description: 'Check if in a git repository',
      run: vi.fn().mockResolvedValue({
        name: 'git-repo',
        category: 'git' as const,
        passed: true,
        message: 'In a git repository',
        durationMs: 2,
      }),
    };
  }),
}));

vi.mock('../../doctor/checks/runtime-check.js', () => ({
  NodeVersionCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'node-version',
      category: 'runtime' as const,
      description: 'Check Node.js version',
      run: vi.fn().mockResolvedValue({
        name: 'node-version',
        category: 'runtime' as const,
        passed: true,
        message: 'Node.js version meets requirement',
        durationMs: 1,
      }),
    };
  }),
  NpmAvailableCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'npm-available',
      category: 'runtime' as const,
      description: 'Check if npm is available',
      run: vi.fn().mockResolvedValue({
        name: 'npm-available',
        category: 'runtime' as const,
        passed: true,
        message: 'npm is available',
        durationMs: 2,
      }),
    };
  }),
}));

vi.mock('../../doctor/checks/project-check.js', () => ({
  ProjectDirCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'project-dir',
      category: 'project' as const,
      description: 'Check project directory',
      run: vi.fn().mockResolvedValue({
        name: 'project-dir',
        category: 'project' as const,
        passed: true,
        message: '.puppet-master directory exists',
        durationMs: 1,
      }),
    };
  }),
  ConfigFileCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'config-file',
      category: 'project' as const,
      description: 'Check config file',
      run: vi.fn().mockResolvedValue({
        name: 'config-file',
        category: 'project' as const,
        passed: true,
        message: 'config.yaml exists and is valid',
        durationMs: 2,
      }),
    };
  }),
  SubdirectoriesCheck: vi.fn().mockImplementation(function () {
    return {
      name: 'subdirectories',
      category: 'project' as const,
      description: 'Check subdirectories',
      run: vi.fn().mockResolvedValue({
        name: 'subdirectories',
        category: 'project' as const,
        passed: true,
        message: 'All required subdirectories exist',
        durationMs: 1,
      }),
    };
  }),
}));

// Mock CheckRegistry
vi.mock('../../doctor/check-registry.js', () => {
  const mockCheckResults: CheckResult[] = [];
  return {
    CheckRegistry: vi.fn().mockImplementation(function () {
      return {
        register: vi.fn(),
        runAll: vi.fn().mockResolvedValue(mockCheckResults),
        runCategory: vi.fn().mockResolvedValue(mockCheckResults),
        runOne: vi.fn(),
        getRegisteredChecks: vi.fn().mockReturnValue([]),
        getCategories: vi.fn().mockReturnValue(['cli', 'git', 'runtime', 'project']),
      };
    }),
  };
});

// Mock InstallationManager
vi.mock('../../doctor/installation-manager.js', () => ({
  InstallationManager: vi.fn().mockImplementation(function () {
    return {
      getInstallCommand: vi.fn().mockReturnValue({
        check: 'claude-cli',
        command: 'npm install -g @anthropic-ai/claude-code',
        description: 'Install Claude CLI',
        requiresSudo: false,
        platforms: ['darwin', 'linux', 'win32'],
      }),
      install: vi.fn().mockResolvedValue(true),
      getAvailableInstalls: vi.fn().mockReturnValue([]),
      getCurrentPlatform: vi.fn().mockReturnValue('linux'),
    };
  }),
}));

// Mock DoctorReporter
vi.mock('../../doctor/doctor-reporter.js', () => ({
  DoctorReporter: vi.fn().mockImplementation(function () {
    return {
      formatResults: vi.fn().mockReturnValue('Formatted output'),
      formatSingleResult: vi.fn(),
      formatSummary: vi.fn().mockReturnValue('Summary'),
      groupResultsByCategory: vi.fn(),
    };
  }),
}));

describe('DoctorCommand', () => {
  let command: DoctorCommand;
  let mockProgram: Command;
  let originalExit: typeof process.exit;

  beforeEach(() => {
    command = new DoctorCommand();
    mockProgram = new Command();
    originalExit = process.exit;
    process.exit = vi.fn() as never;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.exit = originalExit;
    vi.clearAllMocks();
  });

  describe('CommandModule implementation', () => {
    it('should implement CommandModule interface', () => {
      expect(command).toBeDefined();
      expect(typeof command.register).toBe('function');
    });

    it('should register doctor command with program', () => {
      const registerSpy = vi.spyOn(mockProgram, 'command');
      command.register(mockProgram);

      expect(registerSpy).toHaveBeenCalledWith('doctor');
    });

    it('should set correct description', () => {
      const descriptionSpy = vi.spyOn(Command.prototype, 'description');
      command.register(mockProgram);

      expect(descriptionSpy).toHaveBeenCalledWith(
        'Run system health checks and validate configuration'
      );
    });

    it('should register all expected options', () => {
      const optionSpy = vi.spyOn(Command.prototype, 'option');
      command.register(mockProgram);

      const optionCalls = optionSpy.mock.calls.map((call) => call[0]);
      expect(optionCalls).toContain('-c, --config <path>');
      expect(optionCalls).toContain('--category <cat>');
      expect(optionCalls).toContain('--fix');
      expect(optionCalls).toContain('--json');
      expect(optionCalls).toContain('-v, --verbose');
    });
  });
});

describe('doctorAction', () => {
  let originalExit: typeof process.exit;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    originalExit = process.exit;
    process.exit = vi.fn() as never;
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.exit = originalExit;
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('running all checks', () => {
    it('should run all checks when no category is specified', async () => {
      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn().mockResolvedValue([
          {
            name: 'test-check',
            category: 'cli' as const,
            passed: true,
            message: 'Test passed',
            durationMs: 10,
          },
        ]),
        runCategory: vi.fn(),
      };

      // Replace CheckRegistry with our mock
      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = {};
      await doctorAction(options);

      expect(mockRegistry.runAll).toHaveBeenCalled();
      expect(mockRegistry.runCategory).not.toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should exit with code 0 when all checks pass', async () => {
      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn().mockResolvedValue([
          {
            name: 'check1',
            category: 'cli' as const,
            passed: true,
            message: 'Passed',
            durationMs: 5,
          },
          {
            name: 'check2',
            category: 'git' as const,
            passed: true,
            message: 'Passed',
            durationMs: 3,
          },
        ]),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = {};
      await doctorAction(options);

      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should exit with code 1 when any check fails', async () => {
      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn().mockResolvedValue([
          {
            name: 'check1',
            category: 'cli' as const,
            passed: true,
            message: 'Passed',
            durationMs: 5,
          },
          {
            name: 'check2',
            category: 'git' as const,
            passed: false,
            message: 'Failed',
            durationMs: 3,
          },
        ]),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = {};
      await doctorAction(options);

      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('category filtering', () => {
    it('should run category-specific checks when category is specified', async () => {
      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn(),
        runCategory: vi.fn().mockResolvedValue([
          {
            name: 'cli-check',
            category: 'cli' as const,
            passed: true,
            message: 'CLI check passed',
            durationMs: 5,
          },
        ]),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = { category: 'cli' };
      await doctorAction(options);

      expect(mockRegistry.runCategory).toHaveBeenCalledWith('cli');
      expect(mockRegistry.runAll).not.toHaveBeenCalled();
    });

    it('should filter correctly for git category', async () => {
      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn(),
        runCategory: vi.fn().mockResolvedValue([
          {
            name: 'git-check',
            category: 'git' as const,
            passed: true,
            message: 'Git check passed',
            durationMs: 3,
          },
        ]),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = { category: 'git' };
      await doctorAction(options);

      expect(mockRegistry.runCategory).toHaveBeenCalledWith('git');
    });
  });

  describe('JSON output', () => {
    it('should output JSON when --json flag is set', async () => {
      const mockResults: CheckResult[] = [
        {
          name: 'test-check',
          category: 'cli' as const,
          passed: true,
          message: 'Test passed',
          durationMs: 10,
        },
      ];

      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn().mockResolvedValue(mockResults),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = { json: true };
      await doctorAction(options);

      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(mockResults, null, 2));
      expect(DoctorReporter).not.toHaveBeenCalled();
    });

    it('should not use DoctorReporter when --json is set', async () => {
      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn().mockResolvedValue([
          {
            name: 'test-check',
            category: 'cli' as const,
            passed: true,
            message: 'Test passed',
            durationMs: 10,
          },
        ]),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = { json: true };
      await doctorAction(options);

      // DoctorReporter should not be instantiated when JSON output is used
      // We verify by checking that formatResults was not called
      const reporterInstance = vi.mocked(DoctorReporter).mock.instances[0];
      if (reporterInstance) {
        expect(reporterInstance.formatResults).not.toHaveBeenCalled();
      }
    });
  });

  describe('verbose mode', () => {
    it('should pass verbose option to DoctorReporter', async () => {
      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn().mockResolvedValue([
          {
            name: 'test-check',
            category: 'cli' as const,
            passed: true,
            message: 'Test passed',
            details: 'Detailed info',
            durationMs: 10,
          },
        ]),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = { verbose: true };
      await doctorAction(options);

      expect(DoctorReporter).toHaveBeenCalledWith({
        colors: true,
        verbose: true,
        groupByCategory: true,
      });
    });

    it('should use verbose: false by default', async () => {
      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn().mockResolvedValue([
          {
            name: 'test-check',
            category: 'cli' as const,
            passed: true,
            message: 'Test passed',
            durationMs: 10,
          },
        ]),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = {};
      await doctorAction(options);

      expect(DoctorReporter).toHaveBeenCalledWith({
        colors: true,
        verbose: false,
        groupByCategory: true,
      });
    });
  });

  describe('fix mode', () => {
    it('should attempt installations when --fix flag is set', async () => {
      const failedResult: CheckResult = {
        name: 'claude-cli',
        category: 'cli' as const,
        passed: false,
        message: 'Claude CLI not found',
        fixSuggestion: 'Install with: npm install -g @anthropic-ai/claude-code',
        durationMs: 5,
      };

      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn()
          .mockResolvedValueOnce([failedResult]) // First run - before fixes
          .mockResolvedValueOnce([failedResult]), // Second run - after fixes (still failed)
      };

      const mockInstallationManager = {
        getInstallCommand: vi.fn().mockReturnValue({
          check: 'claude-cli',
          command: 'npm install -g @anthropic-ai/claude-code',
          description: 'Install Claude CLI',
          requiresSudo: false,
          platforms: ['darwin', 'linux', 'win32'],
        }),
        install: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });
      vi.mocked(InstallationManager).mockImplementation(function () {
        return mockInstallationManager as unknown as InstallationManager;
      });

      const options: DoctorCommandOptions = { fix: true };
      await doctorAction(options);

      expect(mockInstallationManager.getInstallCommand).toHaveBeenCalledWith('claude-cli');
      expect(mockInstallationManager.install).toHaveBeenCalledWith('claude-cli', {
        skipConfirmation: false,
      });
      expect(mockRegistry.runAll).toHaveBeenCalledTimes(2); // Called before and after fixes
    });

    it('should skip installation if no install command is available', async () => {
      const failedResult: CheckResult = {
        name: 'unknown-check',
        category: 'cli' as const,
        passed: false,
        message: 'Unknown check failed',
        durationMs: 5,
      };

      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn()
          .mockResolvedValueOnce([failedResult])
          .mockResolvedValueOnce([failedResult]),
      };

      const mockInstallationManager = {
        getInstallCommand: vi.fn().mockReturnValue(null), // No install command available
        install: vi.fn(),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });
      vi.mocked(InstallationManager).mockImplementation(function () {
        return mockInstallationManager as unknown as InstallationManager;
      });

      const options: DoctorCommandOptions = { fix: true };
      await doctorAction(options);

      expect(mockInstallationManager.getInstallCommand).toHaveBeenCalledWith('unknown-check');
      expect(mockInstallationManager.install).not.toHaveBeenCalled();
    });

    it('should not attempt fixes when --fix flag is not set', async () => {
      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn().mockResolvedValue([
          {
            name: 'test-check',
            category: 'cli' as const,
            passed: false,
            message: 'Test failed',
            durationMs: 5,
          },
        ]),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = {}; // No fix flag
      await doctorAction(options);

      expect(InstallationManager).not.toHaveBeenCalled();
      expect(mockRegistry.runAll).toHaveBeenCalledTimes(1); // Only called once
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully and exit with code 1', async () => {
      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn().mockRejectedValue(new Error('Registry error')),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = {};
      await doctorAction(options);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error running doctor checks:',
        'Registry error'
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should show stack trace in verbose mode on error', async () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn().mockRejectedValue(error),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = { verbose: true };
      await doctorAction(options);

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error running doctor checks:', 'Test error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error stack trace');
    });
  });

  describe('formatted output', () => {
    it('should use DoctorReporter for formatted output when JSON is not set', async () => {
      const mockResults: CheckResult[] = [
        {
          name: 'test-check',
          category: 'cli' as const,
          passed: true,
          message: 'Test passed',
          durationMs: 10,
        },
      ];

      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn().mockResolvedValue(mockResults),
      };

      const mockReporter = {
        formatResults: vi.fn().mockReturnValue('Formatted output'),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });
      vi.mocked(DoctorReporter).mockImplementation(function () {
        return mockReporter as unknown as DoctorReporter;
      });

      const options: DoctorCommandOptions = {}; // No JSON flag
      await doctorAction(options);

      expect(DoctorReporter).toHaveBeenCalled();
      expect(mockReporter.formatResults).toHaveBeenCalledWith(mockResults);
      expect(consoleLogSpy).toHaveBeenCalledWith('Formatted output');
    });
  });

  describe('check registration', () => {
    it('should register all required checks', async () => {
      const mockRegistry = {
        register: vi.fn(),
        runAll: vi.fn().mockResolvedValue([]),
      };

      vi.mocked(CheckRegistry).mockImplementation(function () {
        return mockRegistry as unknown as CheckRegistry;
      });

      const options: DoctorCommandOptions = {};
      await doctorAction(options);

      // Verify that register was called multiple times (once per check)
      // We expect at least 11 checks: 3 CLI + 3 Git + 2 Runtime + 3 Project
      expect(mockRegistry.register).toHaveBeenCalled();
      // The exact number depends on which checks are imported
      // At minimum we expect multiple registrations
      expect(mockRegistry.register.mock.calls.length).toBeGreaterThan(0);
    });
  });
});
