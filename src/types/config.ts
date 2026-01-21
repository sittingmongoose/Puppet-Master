/**
 * Configuration types for RWM Puppet Master
 * 
 * This file defines all TypeScript types for the configuration system.
 * YAML field names use snake_case, TypeScript uses camelCase.
 * The ConfigManager (PH0-T06) will handle the mapping between YAML and TypeScript.
 */

/**
 * Platform type - the canonical definition.
 * ALL other files should import Platform from here or from the index barrel.
 */
export type Platform = 'cursor' | 'codex' | 'claude';

/**
 * Project configuration section.
 * Maps from YAML: project.name, project.working_directory
 */
export interface ProjectConfig {
  name: string;
  workingDirectory: string; // YAML: working_directory
}

/**
 * CLI paths configuration.
 * Maps from YAML: cli_paths.cursor, cli_paths.codex, cli_paths.claude
 */
export interface CliPathsConfig {
  cursor: string;
  codex: string;
  claude: string;
}

/**
 * Logging configuration.
 * Maps from YAML: logging.level, logging.retention_days
 */
export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  retentionDays: number; // YAML: retention_days
}

/**
 * Configuration for a single tier (phase, task, subtask, or iteration).
 * Maps from YAML: tiers.{tier}.platform, model, self_fix, max_iterations (or max_attempts for iteration), escalation
 */
export interface TierConfig {
  platform: Platform;
  model: string;
  /**
   * Enable Cursor “plan mode” for this tier (best-effort).
   *
   * YAML: plan_mode
   * Notes:
   * - Only meaningful for Cursor CLI, ignored by other platforms.
   * - If the platform CLI does not support a dedicated plan mode flag, the runner
   *   should fall back to a plan-first instruction in the prompt.
   */
  planMode?: boolean;
  selfFix: boolean; // YAML: self_fix
  maxIterations: number; // YAML: max_iterations (or max_attempts for iteration tier)
  escalation: 'phase' | 'task' | 'subtask' | null;
}

/**
 * Branching configuration.
 * Maps from YAML: branching.base_branch, naming_pattern, granularity, push_policy, merge_policy, auto_pr
 */
export interface BranchingConfig {
  baseBranch: string; // YAML: base_branch
  namingPattern: string; // YAML: naming_pattern
  granularity: 'single' | 'per-phase' | 'per-task';
  pushPolicy: 'per-iteration' | 'per-subtask' | 'per-task' | 'per-phase'; // YAML: push_policy
  mergePolicy: 'merge' | 'squash' | 'rebase'; // YAML: merge_policy
  autoPr: boolean; // YAML: auto_pr
}

/**
 * Verification configuration.
 * Maps from YAML: verification.browser_adapter, screenshot_on_failure, evidence_directory
 */
export interface VerificationConfig {
  browserAdapter: string; // YAML: browser_adapter
  screenshotOnFailure: boolean; // YAML: screenshot_on_failure
  evidenceDirectory: string; // YAML: evidence_directory
}

/**
 * Agents enforcement configuration.
 * Maps from YAML: memory.agents_enforcement.{all_fields}
 * See REQUIREMENTS.md Section 24.6
 */
export interface AgentsEnforcementConfig {
  requireUpdateOnFailure: boolean; // YAML: require_update_on_failure
  requireUpdateOnGotcha: boolean; // YAML: require_update_on_gotcha
  gateFailsOnMissingUpdate: boolean; // YAML: gate_fails_on_missing_update
  reviewerMustAcknowledge: boolean; // YAML: reviewer_must_acknowledge
}

/**
 * Memory configuration.
 * Maps from YAML: memory.progress_file, agents_file, prd_file, multi_level_agents, agents_enforcement
 * See REQUIREMENTS.md Sections 17 and 24
 */
export interface MemoryConfig {
  progressFile: string; // YAML: progress_file
  agentsFile: string; // YAML: agents_file
  prdFile: string; // YAML: prd_file
  multiLevelAgents: boolean; // YAML: multi_level_agents
  agentsEnforcement: AgentsEnforcementConfig; // YAML: agents_enforcement
}

/**
 * Budget configuration for a single platform.
 * Maps from YAML: budgets.{platform}.max_calls_per_run, max_calls_per_hour, max_calls_per_day, cooldown_hours, fallback_platform
 * See REQUIREMENTS.md Section 23.3
 */
export interface BudgetConfig {
  maxCallsPerRun: number | 'unlimited'; // YAML: max_calls_per_run
  maxCallsPerHour: number | 'unlimited'; // YAML: max_calls_per_hour
  maxCallsPerDay: number | 'unlimited'; // YAML: max_calls_per_day
  cooldownHours?: number; // YAML: cooldown_hours (optional)
  fallbackPlatform: Platform | null; // YAML: fallback_platform
}

/**
 * Platform budgets configuration.
 * Maps from YAML: budgets.claude, budgets.codex, budgets.cursor
 * See REQUIREMENTS.md Section 23.3
 */
export interface PlatformBudgets {
  claude: BudgetConfig;
  codex: BudgetConfig;
  cursor: BudgetConfig;
}

/**
 * Budget enforcement configuration.
 * Maps from YAML: budget_enforcement.on_limit_reached, warn_at_percentage, notify_on_fallback
 * See REQUIREMENTS.md Section 23.3
 */
export interface BudgetEnforcementConfig {
  onLimitReached: 'fallback' | 'pause' | 'queue'; // YAML: on_limit_reached
  warnAtPercentage: number; // YAML: warn_at_percentage
  notifyOnFallback: boolean; // YAML: notify_on_fallback
}

/**
 * Tiers configuration.
 * Maps from YAML: tiers.phase, tiers.task, tiers.subtask, tiers.iteration
 */
export interface TiersConfig {
  phase: TierConfig;
  task: TierConfig;
  subtask: TierConfig;
  iteration: TierConfig;
}

/**
 * Main configuration interface combining all configuration sections.
 * This is the root type for the entire configuration system.
 */
export interface PuppetMasterConfig {
  project: ProjectConfig;
  tiers: TiersConfig;
  branching: BranchingConfig;
  verification: VerificationConfig;
  memory: MemoryConfig;
  budgets: PlatformBudgets;
  budgetEnforcement: BudgetEnforcementConfig;
  logging: LoggingConfig;
  cliPaths: CliPathsConfig;
}
