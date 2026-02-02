/**
 * Mock Doctor Registry for Testing
 * 
 * Provides fast, deterministic mock checks for testing doctor routes
 * without spawning real CLI processes.
 */

import { CheckRegistry } from '../../doctor/check-registry.js';
import type { CheckResult, DoctorCheck } from '../../doctor/check-registry.js';

/**
 * Creates a mock check that returns immediately with a predefined result.
 */
class MockCheck implements DoctorCheck {
  constructor(
    public readonly name: string,
    public readonly category: 'cli' | 'git' | 'runtime' | 'project' | 'network',
    public readonly description: string,
    private readonly result: Omit<CheckResult, 'name' | 'category' | 'durationMs'>
  ) {}

  async run(): Promise<CheckResult> {
    return {
      ...this.result,
      name: this.name,
      category: this.category,
      durationMs: 0,
    };
  }
}

/**
 * Creates a CheckRegistry populated with fast mock checks for testing.
 * 
 * Mock checks return immediately without spawning processes, making tests
 * deterministic and fast.
 * 
 * @returns Promise resolving to CheckRegistry with mock checks
 */
export async function createMockCheckRegistry(): Promise<CheckRegistry> {
  const registry = new CheckRegistry();

  // Register mock CLI checks
  registry.register(new MockCheck(
    'cursor-cli',
    'cli',
    'Check if Cursor Agent CLI is available',
    {
      passed: true,
      message: 'Cursor CLI is installed and runnable (mock)',
      details: 'Mock check for testing',
    }
  ));

  registry.register(new MockCheck(
    'codex-cli',
    'cli',
    'Check if Codex CLI and SDK are available',
    {
      passed: true,
      message: 'Codex CLI and SDK are installed, runnable, and authenticated (mock)',
      details: 'Mock check for testing',
    }
  ));

  registry.register(new MockCheck(
    'claude-cli',
    'cli',
    'Check if Claude CLI is available',
    {
      passed: true,
      message: 'Claude CLI is installed, runnable, and authenticated (mock)',
      details: 'Mock check for testing',
    }
  ));

  registry.register(new MockCheck(
    'gemini-cli',
    'cli',
    'Check if Gemini CLI is available',
    {
      passed: true,
      message: 'Gemini CLI is installed, runnable, and authenticated (mock)',
      details: 'Mock check for testing',
    }
  ));

  registry.register(new MockCheck(
    'copilot-cli',
    'cli',
    'Check if GitHub Copilot CLI is available',
    {
      passed: true,
      message: 'Copilot CLI is installed, runnable, and authenticated (mock)',
      details: 'Mock check for testing',
    }
  ));

  // Register mock Git checks
  registry.register(new MockCheck(
    'git-available',
    'git',
    'Check if Git is available',
    {
      passed: true,
      message: 'Git is installed and available (mock)',
      details: 'Mock check for testing',
    }
  ));

  registry.register(new MockCheck(
    'git-config',
    'git',
    'Check Git configuration',
    {
      passed: true,
      message: 'Git is configured correctly (mock)',
      details: 'Mock check for testing',
    }
  ));

  registry.register(new MockCheck(
    'git-repo',
    'git',
    'Check if project is in a Git repository',
    {
      passed: true,
      message: 'Project is in a Git repository (mock)',
      details: 'Mock check for testing',
    }
  ));

  registry.register(new MockCheck(
    'secrets-check',
    'git',
    'Check for secrets in repository',
    {
      passed: true,
      message: 'No secrets detected (mock)',
      details: 'Mock check for testing',
    }
  ));

  // Register mock Runtime checks
  registry.register(new MockCheck(
    'node-version',
    'runtime',
    'Check Node.js version',
    {
      passed: true,
      message: 'Node.js version is compatible (mock)',
      details: 'Mock check for testing',
    }
  ));

  registry.register(new MockCheck(
    'npm-available',
    'runtime',
    'Check if npm is available',
    {
      passed: true,
      message: 'npm is installed and available (mock)',
      details: 'Mock check for testing',
    }
  ));

  registry.register(new MockCheck(
    'npm-node-compatibility',
    'runtime',
    'Check npm and Node.js compatibility',
    {
      passed: true,
      message: 'npm and Node.js are compatible (mock)',
      details: 'Mock check for testing',
    }
  ));

  registry.register(new MockCheck(
    'playwright-browsers',
    'runtime',
    'Check if Playwright browsers are installed',
    {
      passed: true,
      message: 'Playwright browsers are installed (mock)',
      details: 'Mock check for testing',
    }
  ));

  // Register mock Project checks
  registry.register(new MockCheck(
    'project-dir',
    'project',
    'Check if project directory exists',
    {
      passed: true,
      message: 'Project directory exists (mock)',
      details: 'Mock check for testing',
    }
  ));

  registry.register(new MockCheck(
    'config-file',
    'project',
    'Check if configuration file exists',
    {
      passed: true,
      message: 'Configuration file exists (mock)',
      details: 'Mock check for testing',
    }
  ));

  registry.register(new MockCheck(
    'subdirectories',
    'project',
    'Check if required subdirectories exist',
    {
      passed: true,
      message: 'Required subdirectories exist (mock)',
      details: 'Mock check for testing',
    }
  ));

  return registry;
}
