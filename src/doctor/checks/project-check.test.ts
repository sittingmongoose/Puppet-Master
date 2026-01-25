/**
 * Tests for Project Setup Checks
 * 
 * Tests for project directory, config file, subdirectories, and AGENTS.md checks.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { ProjectDirCheck, ConfigFileCheck, SubdirectoriesCheck, AgentsFileCheck } from './project-check.js';

describe('ProjectDirCheck', () => {
  let tempDir: string;
  let check: ProjectDirCheck;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'project-dir-check-'));
    check = new ProjectDirCheck();
  });

  afterEach(async () => {
    vi.spyOn(process, 'cwd').mockRestore();
    await rm(tempDir, { recursive: true, force: true });
  });

  it('should pass when .puppet-master directory exists', async () => {
    await mkdir(join(tempDir, '.puppet-master'));

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('.puppet-master directory exists');
    expect(result.category).toBe('project');
  });

  it('should fail when .puppet-master directory is missing', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('.puppet-master directory not found');
    expect(result.fixSuggestion).toBeDefined();
  });

  it('should fail when .puppet-master exists but is not a directory', async () => {
    await writeFile(join(tempDir, '.puppet-master'), 'not a directory');

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('not a directory');
    expect(result.fixSuggestion).toBeDefined();
  });
});

describe('ConfigFileCheck', () => {
  let tempDir: string;
  let check: ConfigFileCheck;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'config-file-check-'));
    check = new ConfigFileCheck();
    await mkdir(join(tempDir, '.puppet-master'), { recursive: true });
  });

  afterEach(async () => {
    vi.spyOn(process, 'cwd').mockRestore();
    await rm(tempDir, { recursive: true, force: true });
  });

  it('should pass when valid config.yaml exists', async () => {
    const validConfig = `
project:
  name: "TestProject"
  working_directory: "."
tiers:
  phase:
    platform: "claude"
    model: "opus-4.5"
    self_fix: false
    max_iterations: 3
    escalation: null
  task:
    platform: "codex"
    model: "gpt-5.2-high"
    self_fix: true
    max_iterations: 5
    escalation: "phase"
  subtask:
    platform: "cursor"
    model: "sonnet-4.5-thinking"
    self_fix: true
    max_iterations: 10
    escalation: "task"
  iteration:
    platform: "cursor"
    model: "auto"
    self_fix: false
    max_iterations: 3
    escalation: "subtask"
branching:
  base_branch: "main"
  naming_pattern: "ralph/{phase}/{task}"
  granularity: "per-task"
  push_policy: "per-subtask"
  merge_policy: "squash"
  auto_pr: true
verification:
  browser_adapter: "dev-browser"
  screenshot_on_failure: true
  evidence_directory: ".puppet-master/evidence"
memory:
  progress_file: "progress.txt"
  agents_file: "AGENTS.md"
  prd_file: ".puppet-master/prd.json"
  multi_level_agents: true
  agents_enforcement:
    require_update_on_failure: true
    require_update_on_gotcha: true
    gate_fails_on_missing_update: true
    reviewer_must_acknowledge: true
budgets:
  claude:
    max_calls_per_run: 5
    max_calls_per_hour: 3
    max_calls_per_day: 10
    cooldown_hours: 5
    fallback_platform: "codex"
  codex:
    max_calls_per_run: 50
    max_calls_per_hour: 20
    max_calls_per_day: 100
    fallback_platform: "cursor"
  cursor:
    max_calls_per_run: "unlimited"
    max_calls_per_hour: "unlimited"
    max_calls_per_day: "unlimited"
    fallback_platform: null
  gemini:
    max_calls_per_run: 1
    max_calls_per_hour: 1
    max_calls_per_day: 1
    fallback_platform: null
  copilot:
    max_calls_per_run: 1
    max_calls_per_hour: 1
    max_calls_per_day: 1
    fallback_platform: null
budget_enforcement:
  on_limit_reached: "fallback"
  warn_at_percentage: 80
  notify_on_fallback: true
logging:
  level: "info"
  retention_days: 30
cli_paths:
  cursor: "cursor-agent"
  codex: "codex"
  claude: "claude"
  gemini: "gemini"
  copilot: "copilot"
`;
    await writeFile(join(tempDir, '.puppet-master', 'config.yaml'), validConfig, 'utf-8');

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('config.yaml exists and is valid');
  });

  it('should fail when config.yaml is missing', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('config.yaml not found');
    expect(result.fixSuggestion).toBeDefined();
  });

  it('should fail when YAML syntax is invalid', async () => {
    await writeFile(join(tempDir, '.puppet-master', 'config.yaml'), 'invalid: yaml: [', 'utf-8');

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('Failed to parse config.yaml');
    expect(result.fixSuggestion).toBeDefined();
  });

  it('should fail when required fields are missing', async () => {
    const invalidConfig = `
project:
  name: "Test"
`;
    await writeFile(join(tempDir, '.puppet-master', 'config.yaml'), invalidConfig, 'utf-8');

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('config.yaml is invalid');
    expect(result.details).toBeDefined();
  });
});

describe('SubdirectoriesCheck', () => {
  let tempDir: string;
  let check: SubdirectoriesCheck;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'subdirectories-check-'));
    check = new SubdirectoriesCheck();
    await mkdir(join(tempDir, '.puppet-master'), { recursive: true });
  });

  afterEach(async () => {
    vi.spyOn(process, 'cwd').mockRestore();
    await rm(tempDir, { recursive: true, force: true });
  });

  it('should pass when all required subdirectories exist', async () => {
    const pmDir = join(tempDir, '.puppet-master');
    await mkdir(join(pmDir, 'checkpoints'), { recursive: true });
    await mkdir(join(pmDir, 'evidence'), { recursive: true });
    await mkdir(join(pmDir, 'logs'), { recursive: true });
    await mkdir(join(pmDir, 'usage'), { recursive: true });

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('All required subdirectories exist');
  });

  it('should fail when some subdirectories are missing', async () => {
    const pmDir = join(tempDir, '.puppet-master');
    await mkdir(join(pmDir, 'checkpoints'), { recursive: true });
    await mkdir(join(pmDir, 'evidence'), { recursive: true });
    // Missing logs and usage

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('Missing');
    expect(result.details).toBeDefined();
    expect(result.details).toContain('logs');
    expect(result.details).toContain('usage');
  });

  it('should fail when all subdirectories are missing', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.details).toBeDefined();
    expect(result.details).toContain('checkpoints');
    expect(result.details).toContain('evidence');
    expect(result.details).toContain('logs');
    expect(result.details).toContain('usage');
  });

  it('should fail when .puppet-master directory is missing', async () => {
    await rm(join(tempDir, '.puppet-master'), { recursive: true, force: true });

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('.puppet-master directory not found');
  });
});

describe('AgentsFileCheck', () => {
  let tempDir: string;
  let check: AgentsFileCheck;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'agents-file-check-'));
    check = new AgentsFileCheck();
  });

  afterEach(async () => {
    vi.spyOn(process, 'cwd').mockRestore();
    await rm(tempDir, { recursive: true, force: true });
  });

  it('should pass when AGENTS.md exists in project root', async () => {
    await writeFile(join(tempDir, 'AGENTS.md'), '# AGENTS.md', 'utf-8');

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('AGENTS.md exists in project root');
  });

  it('should pass when AGENTS.md exists in .puppet-master directory', async () => {
    await mkdir(join(tempDir, '.puppet-master'), { recursive: true });
    await writeFile(join(tempDir, '.puppet-master', 'AGENTS.md'), '# AGENTS.md', 'utf-8');

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('AGENTS.md exists in .puppet-master directory');
  });

  it('should fail when AGENTS.md is missing', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(false);
    expect(result.message).toContain('AGENTS.md not found');
    expect(result.fixSuggestion).toBeDefined();
  });

  it('should prefer root AGENTS.md over .puppet-master/AGENTS.md', async () => {
    await writeFile(join(tempDir, 'AGENTS.md'), '# Root AGENTS.md', 'utf-8');
    await mkdir(join(tempDir, '.puppet-master'), { recursive: true });
    await writeFile(join(tempDir, '.puppet-master', 'AGENTS.md'), '# PM AGENTS.md', 'utf-8');

    vi.spyOn(process, 'cwd').mockReturnValue(tempDir);
    const result = await check.run();

    expect(result.passed).toBe(true);
    expect(result.message).toContain('project root');
  });
});
