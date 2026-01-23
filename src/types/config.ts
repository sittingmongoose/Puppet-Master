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
 *
 * NOTE: 'antigravity' was removed - GUI-only, not suitable for automation.
 * 'copilot' now uses the official GitHub Copilot SDK instead of CLI spawning.
 */
export type Platform = 'cursor' | 'codex' | 'claude' | 'gemini' | 'copilot';

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
 * Maps from YAML: cli_paths.cursor, cli_paths.codex, cli_paths.claude, cli_paths.gemini, cli_paths.copilot
 *
 * NOTE: antigravity removed - GUI-only, not suitable for automation.
 * copilot CLI is still needed as the SDK communicates with it via JSON-RPC.
 */
export interface CliPathsConfig {
  cursor: string;
  codex: string;
  claude: string;
  gemini: string;
  copilot: string;
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
 * Maps from YAML: budgets.claude, budgets.codex, budgets.cursor, budgets.gemini, budgets.copilot
 * See REQUIREMENTS.md Section 23.3
 */
export interface PlatformBudgets {
  claude: BudgetConfig;
  codex: BudgetConfig;
  cursor: BudgetConfig;
  gemini: BudgetConfig;
  copilot: BudgetConfig;
}

/**
 * Rate limit configuration for a single platform.
 * Maps from YAML: budget.rate_limits.{platform}.calls_per_minute, cooldown_ms
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T07
 */
export interface RateLimitConfig {
  /** Maximum number of calls allowed per minute */
  callsPerMinute: number; // YAML: calls_per_minute
  /** Cooldown period in milliseconds after rate limit is hit */
  cooldownMs: number; // YAML: cooldown_ms
}

/**
 * Rate limit configuration for all platforms.
 * Maps from YAML: budget.rate_limits.cursor, budget.rate_limits.codex, etc.
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T07
 */
export interface PlatformRateLimits {
  cursor: RateLimitConfig;
  codex: RateLimitConfig;
  claude: RateLimitConfig;
  gemini: RateLimitConfig;
  copilot: RateLimitConfig;
}

/**
 * Budget enforcement configuration.
 * Maps from YAML: budget_enforcement.on_limit_reached, warn_at_percentage, notify_on_fallback, soft_limit_percent, hard_limit_percent
 * See REQUIREMENTS.md Section 23.3 and BUILD_QUEUE_IMPROVEMENTS.md P1-T07
 */
export interface BudgetEnforcementConfig {
  onLimitReached: 'fallback' | 'pause' | 'queue'; // YAML: on_limit_reached
  warnAtPercentage: number; // YAML: warn_at_percentage
  notifyOnFallback: boolean; // YAML: notify_on_fallback
  /** Soft limit percentage (default: 80) - warns but allows execution */
  softLimitPercent?: number; // YAML: soft_limit_percent (optional)
  /** Hard limit percentage (default: 100) - throws error when reached */
  hardLimitPercent?: number; // YAML: hard_limit_percent (optional)
}

/**
 * Reviewer configuration for worker/reviewer separation pattern.
 * Maps from YAML: tiers.reviewer
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T13
 */
export interface ReviewerConfig {
  /** Platform for reviewer agent (can differ from worker) */
  platform: Platform;
  /** Model for reviewer agent (can differ from worker) */
  model: string;
  /** Enable worker/reviewer separation (default: true when config present) */
  enabled?: boolean;
  /** Confidence threshold for SHIP verdict (0.0-1.0, default: 0.7) */
  confidenceThreshold?: number;
  /** Maximum reviewer iterations before auto-escalate (default: 3) */
  maxReviewerIterations?: number;
}

/**
 * Tiers configuration.
 * Maps from YAML: tiers.phase, tiers.task, tiers.subtask, tiers.iteration, tiers.gate_review, tiers.reviewer
 */
export interface TiersConfig {
  phase: TierConfig;
  task: TierConfig;
  subtask: TierConfig;
  iteration: TierConfig;
  /**
   * Optional gate review tier configuration.
   * Used for gate review actions when specified.
   * Falls back to tier-specific config if not specified.
   * YAML: tiers.gate_review
   */
  gate_review?: TierConfig;
  /**
   * Optional reviewer configuration for worker/reviewer separation.
   * When present, enables two-phase iteration: worker implements, reviewer verifies.
   * YAML: tiers.reviewer
   * See BUILD_QUEUE_IMPROVEMENTS.md P1-T13
   */
  reviewer?: ReviewerConfig;
}

/**
 * Coverage validation configuration.
 * Maps from YAML: start_chain.coverage
 */
export interface CoverageValidationConfig {
  /** Enable coverage validation (default: true) */
  enabled: boolean;
  /** Minimum coverage ratio for large docs (default: 0.5) */
  minCoverageRatio: number;
  /** Chars threshold for "large" document (default: 5000) */
  largeDocThreshold: number;
  /** Chars threshold for requiring multiple phases (default: 10000) */
  veryLargeDocThreshold: number;
  /** Min phases for very large docs (default: 2) */
  minPhasesForVeryLargeDoc: number;
  /** Max generic criteria before warning (default: 5) */
  maxGenericCriteria: number;
  /** Enable AI coverage diff (default: true) */
  enableAICoverageDiff: boolean;
}

/**
 * Configuration for a generic Start Chain step.
 * Allows overriding platform/model per step.
 */
export interface StartChainStepConfig {
  enabled?: boolean; // Default: true
  platform?: Platform; // Optional override
  model?: string; // Optional override
}

/**
 * Multi-pass PRD generation configuration (P1-T05).
 * Maps from YAML: start_chain.multi_pass
 */
export interface MultiPassGenerationConfig {
  /** Enable multi-pass generation for large docs (default: true) */
  enabled?: boolean;
  /** Character threshold for triggering multi-pass (default: 5000) */
  largeDocThreshold?: number;
  /** Maximum gap-fill repair passes (default: 3) */
  maxRepairPasses?: number;
  /** Coverage threshold to stop gap-fill loop (default: 0.7) */
  coverageThreshold?: number;
}

/**
 * Start Chain configuration.
 * Maps from YAML: start_chain.requirements_interview, start_chain.coverage, etc.
 */
export interface StartChainConfig {
  inventory?: StartChainStepConfig; // YAML: inventory
  requirementsInterview?: StartChainStepConfig & {
    maxQuestions?: number; // YAML: max_questions (optional, defaults to 10)
    allowUnansweredCritical?: boolean; // YAML: allow_unanswered_critical (optional, defaults to true)
  };
  prd?: StartChainStepConfig; // YAML: prd
  architecture?: StartChainStepConfig; // YAML: architecture
  validation?: StartChainStepConfig; // YAML: validation
  gapFill?: StartChainStepConfig & {
    maxRepairPasses?: number; // YAML: max_repair_passes
  };
  /** Coverage validation settings */
  coverage?: CoverageValidationConfig & StartChainStepConfig;
  /** P1-T05: Multi-pass PRD generation settings */
  multiPass?: MultiPassGenerationConfig;
  /** P1-T21: PRD quality validation settings */
  prdQuality?: {
    maxGenericCriteriaPercent?: number;
    maxGenericCriteriaAbsolute?: number;
    requireTraceability?: boolean;
    largeDocThreshold?: number;
    minPhasesForLargeDoc?: number;
  };
}

/**
 * Execution configuration.
 * Maps from YAML: execution.kill_agent_on_failure
 */
export interface ExecutionConfig {
  /**
   * Whether to kill failed agents immediately or keep them alive for debugging.
   * Default: true (kill on failure)
   * YAML: kill_agent_on_failure
   */
  killAgentOnFailure?: boolean; // YAML: kill_agent_on_failure
}

/**
 * Checkpointing configuration.
 * Maps from YAML: checkpointing.enabled, checkpointing.interval, etc.
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T12
 */
export interface CheckpointingConfig {
  /** Enable automatic checkpointing (default: true) */
  enabled: boolean; // YAML: enabled
  /** Checkpoint every N iterations (default: 10) */
  interval: number; // YAML: interval
  /** Maximum number of checkpoints to keep (default: 10) */
  maxCheckpoints: number; // YAML: max_checkpoints
  /** Create checkpoint when subtask completes (default: true) */
  checkpointOnSubtaskComplete: boolean; // YAML: checkpoint_on_subtask_complete
  /** Create checkpoint on graceful shutdown (default: true) */
  checkpointOnShutdown: boolean; // YAML: checkpoint_on_shutdown
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
  startChain?: StartChainConfig; // YAML: start_chain (optional)
  execution?: ExecutionConfig; // YAML: execution (optional)
  rateLimits?: PlatformRateLimits; // YAML: budget.rate_limits (optional, P1-T07)
  checkpointing?: CheckpointingConfig; // YAML: checkpointing (optional, P1-T12)
}
