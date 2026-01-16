/**
 * Tests for install command
 * 
 * Tests the install command implementation with CheckRegistry and InstallationManager integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Command } from 'commander';
import {
  InstallCommand,
  installAction,
  type InstallOptions,
} from './install.js';
import { CheckRegistry } from '../../doctor/check-registry.js';
import { InstallationManager } from '../../doctor/installation-manager.js';
import type { CheckResult } from '../../doctor/check-registry.js';
import type { InstallCommand as InstallCmd } from '../../doctor/installation-manager.js';

// Mock CheckRegistry
vi.mock('../../doctor/check-registry.js', () => {
  return {
    CheckRegistry: vi.fn().mockImplementation(() => ({
      register: vi.fn(),
      runAll: vi.fn(),
      runCategory: vi.fn(),
      unregister: vi.fn(),
    })),
  };
});

// Mock InstallationManager
vi.mock('../../doctor/installation-manager.js', () => ({
  InstallationManager: vi.fn().mockImplementation(() => ({
    getInstallCommand: vi.fn(),
    install: vi.fn(),
    getAvailableInstalls: vi.fn(),
    getCurrentPlatform: vi.fn().mockReturnValue('linux'),
  })),
}));

// Mock all check classes
vi.mock('../../doctor/checks/cli-tools.js', () => ({
  CursorCliCheck: vi.fn().mockImplementation(() => ({
    name: 'cursor-cli',
    category: 'cli' as const,
    description: 'Check if Cursor Agent CLI is available',
    run: vi.fn(),
  })),
  CodexCliCheck: vi.fn().mockImplementation(() => ({
    name: 'codex-cli',
    category: 'cli' as const,
    description: 'Check if Codex CLI is available',
    run: vi.fn(),
  })),
  ClaudeCliCheck: vi.fn().mockImplementation(() => ({
    name: 'claude-cli',
    category: 'cli' as const,
    description: 'Check if Claude CLI is available',
    run: vi.fn(),
  })),
}));

vi.mock('../../doctor/checks/git-check.js', () => ({
  GitAvailableCheck: vi.fn().mockImplementation(() => ({
    name: 'git-available',
    category: 'git' as const,
    description: 'Check if git is available',
    run: vi.fn(),
  })),
  GitConfigCheck: vi.fn().mockImplementation(() => ({
    name: 'git-config',
    category: 'git' as const,
    description: 'Check git configuration',
    run: vi.fn(),
  })),
  GitRepoCheck: vi.fn().mockImplementation(() => ({
    name: 'git-repo',
    category: 'git' as const,
    description: 'Check if in a git repository',
    run: vi.fn(),
  })),
}));

vi.mock('../../doctor/checks/runtime-check.js', () => ({
  NodeVersionCheck: vi.fn().mockImplementation(() => ({
    name: 'node-version',
    category: 'runtime' as const,
    description: 'Check Node.js version',
    run: vi.fn(),
  })),
  NpmAvailableCheck: vi.fn().mockImplementation(() => ({
    name: 'npm-available',
    category: 'runtime' as const,
    description: 'Check if npm is available',
    run: vi.fn(),
  })),
}));

vi.mock('../../doctor/checks/project-check.js', () => ({
  ProjectDirCheck: vi.fn().mockImplementation(() => ({
    name: 'project-dir',
    category: 'project' as const,
    description: 'Check project directory',
    run: vi.fn(),
  })),
  ConfigFileCheck: vi.fn().mockImplementation(() => ({
    name: 'config-file',
    category: 'project' as const,
    description: 'Check config file',
    run: vi.fn(),
  })),
  SubdirectoriesCheck: vi.fn().mockImplementation(() => ({
    name: 'subdirectories',
    category: 'project' as const,
    description: 'Check subdirectories',
    run: vi.fn(),
  })),
}));

// Mock readline
const mockReadline = {
  createInterface: vi.fn(),
  question: vi.fn(),
  close: vi.fn(),
};

vi.mock('node:readline', () => ({
  default: {
    createInterface: vi.fn(() => mockReadline),
  },
  createInterface: vi.fn(() => mockReadline),
}));

// process.exit will be mocked in beforeEach/afterEach per test

// Mock console methods
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('InstallCommand', () => {
  let mockInstallCommand: InstallCmd;
  let mockCheckRegistryInstance: {
    register: ReturnType<typeof vi.fn>;
    runAll: ReturnType<typeof vi.fn>;
    runCategory: ReturnType<typeof vi.fn>;
    unregister: ReturnType<typeof vi.fn>;
  };
  let mockInstallationManagerInstance: {
    getInstallCommand: ReturnType<typeof vi.fn>;
    install: ReturnType<typeof vi.fn>;
    getAvailableInstalls: ReturnType<typeof vi.fn>;
    getCurrentPlatform: ReturnType<typeof vi.fn>;
  };
  let originalExit: typeof process.exit;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy.mockClear();
    consoleErrorSpy.mockClear();

    // Mock process.exit
    originalExit = process.exit;
    process.exit = vi.fn() as never;

    // Setup mock install command
    mockInstallCommand = {
      check: 'cursor-cli',
      command: 'curl https://cursor.com/install -fsSL | bash',
      description: 'Install Cursor Agent CLI',
      requiresSudo: false,
      platforms: ['darwin', 'linux'],
    };

    // Create a fresh mock registry instance for each test
    mockCheckRegistryInstance = {
      register: vi.fn(),
      runAll: vi.fn(),
      runCategory: vi.fn(),
      unregister: vi.fn(),
    };

    // Override CheckRegistry to return our mock instance
    vi.mocked(CheckRegistry).mockImplementation(() => mockCheckRegistryInstance as unknown as CheckRegistry);

    // Create a fresh mock installation manager instance for each test
    mockInstallationManagerInstance = {
      getInstallCommand: vi.fn(),
      install: vi.fn(),
      getAvailableInstalls: vi.fn(),
      getCurrentPlatform: vi.fn().mockReturnValue('linux'),
    };

    // Override InstallationManager to return our mock instance
    vi.mocked(InstallationManager).mockImplementation(() => mockInstallationManagerInstance as unknown as InstallationManager);

    // Setup CheckRegistry mock
    vi.mocked(mockCheckRegistryInstance.runAll).mockResolvedValue([
      {
        name: 'cursor-cli',
        category: 'cli',
        passed: false,
        message: 'Cursor CLI not found',
        durationMs: 10,
      },
      {
        name: 'codex-cli',
        category: 'cli',
        passed: true,
        message: 'Codex CLI is available',
        durationMs: 5,
      },
      {
        name: 'claude-cli',
        category: 'cli',
        passed: false,
        message: 'Claude CLI not found',
        durationMs: 5,
      },
    ] as CheckResult[]);

    // Setup InstallationManager mock
    vi.mocked(mockInstallationManagerInstance.getInstallCommand).mockImplementation(
      (checkName: string) => {
        if (checkName === 'cursor-cli') {
          return mockInstallCommand;
        }
        if (checkName === 'claude-cli') {
          return {
            check: 'claude-cli',
            command: 'curl -fsSL https://claude.ai/install.sh | bash',
            description: 'Install Claude CLI',
            requiresSudo: false,
            platforms: ['darwin', 'linux'],
          };
        }
        return null;
      }
    );
    vi.mocked(mockInstallationManagerInstance.install).mockResolvedValue(true);
  });

  afterEach(() => {
    // Restore process.exit
    process.exit = originalExit;
    vi.restoreAllMocks();
  });

  describe('command registration', () => {
    it('should register install command with correct options', () => {
      const program = new Command();
      const installCmd = new InstallCommand();
      installCmd.register(program);

      const command = program.commands.find((cmd) => cmd.name() === 'install');
      expect(command).toBeDefined();
      expect(command?.description()).toBe(
        'Install missing dependencies detected by doctor checks'
      );
    });
  });

  describe('installAction', () => {
    it('should exit with success when all tools are installed', async () => {
      // All checks pass
      vi.mocked(mockCheckRegistryInstance.runAll).mockResolvedValue([
        {
          name: 'cursor-cli',
          category: 'cli',
          passed: true,
          message: 'Cursor CLI is available',
          durationMs: 10,
        },
      ] as CheckResult[]);

      await installAction({});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✓ All required tools are already installed.'
      );
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should list available tools when no options provided', async () => {
      await installAction({});

      expect(consoleLogSpy).toHaveBeenCalledWith('Missing tools detected:');
      expect(consoleLogSpy).toHaveBeenCalledWith('  - Cursor CLI');
      expect(consoleLogSpy).toHaveBeenCalledWith('  - Claude CLI');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '\nTo install a specific tool: puppet-master install <tool-name>'
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'To install all missing tools: puppet-master install --all'
      );
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should install specific tool when tool name provided', async () => {
      // Mock readline to auto-confirm
      mockReadline.question.mockImplementation((query, callback) => {
        callback('y');
      });

      await installAction({ tool: 'cursor' });

      expect(mockInstallationManagerInstance.getInstallCommand).toHaveBeenCalledWith(
        'cursor-cli'
      );
      expect(mockInstallationManagerInstance.install).toHaveBeenCalledWith('cursor-cli', {
        dryRun: false,
        skipConfirmation: true,
      });
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should install all missing tools when --all flag provided', async () => {
      // Mock readline to auto-confirm
      mockReadline.question.mockImplementation((query, callback) => {
        callback('y');
      });

      await installAction({ all: true });

      expect(mockInstallationManagerInstance.install).toHaveBeenCalledWith('cursor-cli', {
        dryRun: false,
        skipConfirmation: true,
      });
      expect(mockInstallationManagerInstance.install).toHaveBeenCalledWith('claude-cli', {
        dryRun: false,
        skipConfirmation: true,
      });
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should skip confirmation when --yes flag provided', async () => {
      await installAction({ tool: 'cursor', yes: true });

      expect(mockReadline.createInterface).not.toHaveBeenCalled();
      expect(mockInstallationManagerInstance.install).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should show dry run output when --dry-run flag provided', async () => {
      await installAction({ tool: 'cursor', dryRun: true });

      expect(consoleLogSpy).toHaveBeenCalledWith('\n📦 Installation Plan:');
      expect(consoleLogSpy).toHaveBeenCalledWith('  - Cursor CLI');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Command:')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Description:')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DRY RUN]')
      );
      expect(mockInstallationManagerInstance.install).not.toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should cancel installation when user declines confirmation', async () => {
      // Mock readline to decline
      mockReadline.question.mockImplementation((query, callback) => {
        callback('n');
      });

      await installAction({ tool: 'cursor' });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Installation cancelled by user.'
      );
      expect(mockInstallationManagerInstance.install).not.toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should handle tool not found error', async () => {
      await installAction({ tool: 'nonexistent' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error: Tool "nonexistent" not found')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle installation failures', async () => {
      // Mock readline to auto-confirm
      mockReadline.question.mockImplementation((query, callback) => {
        callback('y');
      });

      // Mock installation failure
      vi.mocked(mockInstallationManagerInstance.install)
        .mockResolvedValueOnce(false) // cursor-cli fails
        .mockResolvedValueOnce(true); // claude-cli succeeds

      await installAction({ all: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Installation Summary:')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Successful: 1')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed: 1')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle checks with no install command', async () => {
      // Mock a check that fails but has no install command
      vi.mocked(mockCheckRegistryInstance.runAll).mockResolvedValue([
        {
          name: 'some-other-check',
          category: 'project',
          passed: false,
          message: 'Some check failed',
          durationMs: 5,
        },
      ] as CheckResult[]);

      // Ensure getInstallCommand returns null for this check
      vi.mocked(mockInstallationManagerInstance.getInstallCommand).mockReturnValue(null);

      await installAction({});

      // Should show that all required tools are installed (because failed check has no install command)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '✓ All required tools are already installed.'
      );
      expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should handle errors during installation', async () => {
      // Mock readline to auto-confirm
      mockReadline.question.mockImplementation((query, callback) => {
        callback('y');
      });

      // Mock error
      vi.mocked(mockCheckRegistryInstance.runAll).mockRejectedValue(
        new Error('Check registry error')
      );

      await installAction({ tool: 'cursor' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error during installation:')
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should match tool names flexibly (cursor vs cursor-cli)', async () => {
      // Mock readline to auto-confirm
      mockReadline.question.mockImplementation((query, callback) => {
        callback('y');
      });

      await installAction({ tool: 'cursor' });
      expect(mockInstallationManagerInstance.install).toHaveBeenCalledWith('cursor-cli', {
        dryRun: false,
        skipConfirmation: true,
      });

      await installAction({ tool: 'cursor-cli' });
      expect(mockInstallationManagerInstance.install).toHaveBeenCalledWith('cursor-cli', {
        dryRun: false,
        skipConfirmation: true,
      });
    });

    it('should display installation summary with success and failure counts', async () => {
      // Mock readline to auto-confirm
      mockReadline.question.mockImplementation((query, callback) => {
        callback('y');
      });

      // Mock mixed results
      vi.mocked(mockInstallationManagerInstance.install)
        .mockResolvedValueOnce(true) // cursor-cli succeeds
        .mockResolvedValueOnce(false); // claude-cli fails

      await installAction({ all: true });

      expect(consoleLogSpy).toHaveBeenCalledWith('\n📊 Installation Summary:');
      expect(consoleLogSpy).toHaveBeenCalledWith('  Successful: 1');
      expect(consoleLogSpy).toHaveBeenCalledWith('  Failed: 1');
    });
  });
});
