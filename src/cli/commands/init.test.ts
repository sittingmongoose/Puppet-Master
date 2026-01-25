/**
 * Tests for init command
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdir, rm, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';
import { InitCommand, initAction } from './init.js';
import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';

describe('InitCommand', () => {
  let command: InitCommand;
  let mockProgram: Command;

  beforeEach(() => {
    command = new InitCommand();
    mockProgram = new Command();
  });

  describe('CommandModule implementation', () => {
    it('should implement CommandModule interface', () => {
      expect(command).toBeDefined();
      expect(typeof command.register).toBe('function');
    });

    it('should register init command with program', () => {
      const registerSpy = vi.spyOn(mockProgram, 'command');
      command.register(mockProgram);

      expect(registerSpy).toHaveBeenCalledWith('init');
    });

    it('should set correct description', () => {
      const descriptionSpy = vi.spyOn(Command.prototype, 'description');
      command.register(mockProgram);

      expect(descriptionSpy).toHaveBeenCalledWith('Initialize a new RWM Puppet Master project');
    });

    it('should register all expected options', () => {
      const optionSpy = vi.spyOn(Command.prototype, 'option');
      command.register(mockProgram);

      const optionCalls = optionSpy.mock.calls.map(call => call[0]);
      expect(optionCalls).toContain('--project-name <name>');
      expect(optionCalls).toContain('--force');
    });
  });
});

describe('initAction', () => {
  let testDir: string;
  let originalCwd: string;
  let originalExit: typeof process.exit;

  beforeEach(async () => {
    // Create a temporary directory for each test
    testDir = join(process.cwd(), `.test-init-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await mkdir(testDir, { recursive: true });

    // Save original cwd and change to test directory
    originalCwd = process.cwd();
    process.chdir(testDir);

    // Mock process.exit to prevent test from exiting
    originalExit = process.exit;
    process.exit = vi.fn() as unknown as typeof process.exit;
  });

  afterEach(async () => {
    // Restore original cwd
    process.chdir(originalCwd);

    // Restore process.exit
    process.exit = originalExit;

    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('successful initialization', () => {
    it('should create directory structure', async () => {
      await initAction({});

      const puppetMasterDir = join(testDir, '.puppet-master');
      expect(existsSync(puppetMasterDir)).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'requirements'))).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'plans'))).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'agents'))).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'capabilities'))).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'checkpoints'))).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'evidence', 'test-logs'))).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'evidence', 'screenshots'))).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'evidence', 'browser-traces'))).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'evidence', 'file-snapshots'))).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'evidence', 'metrics'))).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'evidence', 'gate-reports'))).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'logs', 'iterations'))).toBe(true);
      expect(existsSync(join(puppetMasterDir, 'usage'))).toBe(true);
    });

    it('should create config.yaml file', async () => {
      await initAction({});

      const configPath = join(testDir, '.puppet-master', 'config.yaml');
      expect(existsSync(configPath)).toBe(true);

      // Verify config.yaml is valid YAML and can be loaded by ConfigManager
      const manager = new ConfigManager(configPath);
      const config = await manager.load();
      expect(config).toBeDefined();
      expect(config.project.name).toBe('Untitled');
      expect(config.tiers.phase.platform).toBe('claude');
    });

    it('should create config.yaml with snake_case keys', async () => {
      await initAction({});

      const configPath = join(testDir, '.puppet-master', 'config.yaml');
      const content = await readFile(configPath, 'utf-8');

      // Verify snake_case format
      expect(content).toContain('working_directory');
      expect(content).toContain('self_fix');
      expect(content).toContain('max_iterations');
      expect(content).toContain('base_branch');
      expect(content).toContain('naming_pattern');
      expect(content).toContain('push_policy');
      expect(content).toContain('merge_policy');
      expect(content).toContain('auto_pr');
      expect(content).toContain('browser_adapter');
      expect(content).toContain('screenshot_on_failure');
      expect(content).toContain('evidence_directory');
      expect(content).toContain('progress_file');
      expect(content).toContain('agents_file');
      expect(content).toContain('prd_file');
      expect(content).toContain('multi_level_agents');
      expect(content).toContain('agents_enforcement');
      expect(content).toContain('require_update_on_failure');
      expect(content).toContain('budget_enforcement');
      expect(content).toContain('on_limit_reached');
      expect(content).toContain('warn_at_percentage');
      expect(content).toContain('notify_on_fallback');
      expect(content).toContain('retention_days');
      expect(content).toContain('cli_paths');
      expect(content).toContain('max_calls_per_run');
      expect(content).toContain('max_calls_per_hour');
      expect(content).toContain('max_calls_per_day');
      expect(content).toContain('fallback_platform');
      expect(content).toContain('cooldown_hours');
    });

    it('should create schema-valid prd.json scaffold', async () => {
      await initAction({});

      const prdPath = join(testDir, '.puppet-master', 'prd.json');
      expect(existsSync(prdPath)).toBe(true);

      const content = await readFile(prdPath, 'utf-8');
      const parsed = JSON.parse(content) as Record<string, unknown>;

      expect(parsed).toMatchObject({
        project: 'Untitled',
        version: '1.0.0',
        branchName: 'main',
        description: '',
        phases: [],
        metadata: {
          totalPhases: 0,
          completedPhases: 0,
          totalTasks: 0,
          completedTasks: 0,
          totalSubtasks: 0,
          completedSubtasks: 0,
        },
      });

      expect(typeof parsed.createdAt).toBe('string');
      expect(typeof parsed.updatedAt).toBe('string');
    });

    it('should allow PrdManager.load() to succeed after init', async () => {
      await initAction({});

      const prdPath = join(testDir, '.puppet-master', 'prd.json');
      const prdManager = new PrdManager(prdPath);
      const prd = await prdManager.load();

      expect(prd.phases).toEqual([]);
      expect(prd.metadata.totalPhases).toBe(0);
    });

    it('should create architecture.md file', async () => {
      await initAction({});

      const architecturePath = join(testDir, '.puppet-master', 'architecture.md');
      expect(existsSync(architecturePath)).toBe(true);

      const content = await readFile(architecturePath, 'utf-8');
      expect(content).toBe('');
    });

    it('should create AGENTS.md file at project root', async () => {
      await initAction({});

      const agentsPath = join(testDir, 'AGENTS.md');
      expect(existsSync(agentsPath)).toBe(true);

      const content = await readFile(agentsPath, 'utf-8');
      expect(content).toBe('');
    });

    it('should create progress.txt file at project root', async () => {
      await initAction({});

      const progressPath = join(testDir, 'progress.txt');
      expect(existsSync(progressPath)).toBe(true);

      const content = await readFile(progressPath, 'utf-8');
      expect(content).toBe('');
    });

    it('should use project name in config if provided', async () => {
      await initAction({ projectName: 'TestProject' });

      const configPath = join(testDir, '.puppet-master', 'config.yaml');
      const manager = new ConfigManager(configPath);
      const config = await manager.load();

      expect(config.project.name).toBe('TestProject');
    });

    it('should not clobber existing AGENTS.md and progress.txt without --force', async () => {
      const agentsPath = join(testDir, 'AGENTS.md');
      const progressPath = join(testDir, 'progress.txt');

      await writeFile(agentsPath, 'existing agents content', 'utf-8');
      await writeFile(progressPath, 'existing progress content', 'utf-8');

      await initAction({});

      expect(await readFile(agentsPath, 'utf-8')).toBe('existing agents content');
      expect(await readFile(progressPath, 'utf-8')).toBe('existing progress content');
    });
  });

  describe('--force flag', () => {
    it('should error if .puppet-master exists and force is false', async () => {
      // Create .puppet-master directory first
      const puppetMasterDir = join(testDir, '.puppet-master');
      await mkdir(puppetMasterDir, { recursive: true });

      await initAction({ force: false });

      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should overwrite existing files if force is true', async () => {
      // Create .puppet-master directory and some files
      const puppetMasterDir = join(testDir, '.puppet-master');
      await mkdir(puppetMasterDir, { recursive: true });
      const configPath = join(puppetMasterDir, 'config.yaml');
      await writeFile(configPath, 'old content', 'utf-8');

      await initAction({ force: true });

      // Verify new config was written
      const content = await readFile(configPath, 'utf-8');
      expect(content).not.toBe('old content');
      expect(content).toContain('project:');
    });
  });
});
