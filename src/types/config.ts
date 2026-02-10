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
 * Task failure handling style.
 * Controls how the system retries after failures at a tier.
 */
export type TaskFailureStyle = 'spawn_new_agent' | 'continue_same_agent' | 'skip_retries';

/**
 * Model level routing (P2-T05).
 *
 * Used by deterministic complexity routing to pick between predefined model tiers.
 * Mirrors the config-driven concept of model levels (level1/level2/level3).
 */
export type ModelLevel = 'level1' | 'level2' | 'level3';

/**
 * P2-T05: Complexity and task-type classifications.
 */
export type Complexity = 'trivial' | 'simple' | 'standard' | 'critical';
export type TaskType = 'feature' | 'bugfix' | 'refactor' | 'test' | 'docs';

/**
 * Complexity routing matrix (P2-T05).
 *
 * Maps (complexity × taskType) → model level.
 * This is kept in config types to support future config-driven routing.
 */
export type ComplexityRoutingMatrix = Record<Complexity, Record<TaskType, ModelLevel>>;

/**
 * Model configuration for a specific "level" (level1/2/3).
 * This is resolved into a concrete platform + model at runtime.
 */
export interface ModelLevelConfig {
  platform: Platform;
  model: string;
}

/**
 * Model definitions for each routing level.
 * YAML: models.level1, models.level2, models.level3
 */
export interface ModelsConfig {
  level1: ModelLevelConfig;
  level2: ModelLevelConfig;
  level3: ModelLevelConfig;
}

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
  /** When enabled, capture decision rationale and as much runtime detail as practical. */
  intensive?: boolean; // YAML: intensive
}

/**
 * Configuration for a single tier (phase, task, subtask, or iteration).
 * Maps from YAML: tiers.{tier}.platform, model, task_failure_style, max_iterations (or max_attempts for iteration), escalation
 */
export interface TierConfig {
  platform: Platform;
  model: string;
  /**
   * Reasoning effort level for models that support it.
   *
   * YAML: reasoning_effort
   * Values: 'Low' | 'Medium' | 'High' | 'Extra high'
   * Notes:
   * - Codex: --reasoning-effort (most models). Extra high supported.
   * - Claude: CLAUDE_CODE_EFFORT_LEVEL env (Opus 4.6 only). Low, Medium, High.
   * - Cursor: Effort baked into model ID (e.g., gpt-5.2-codex-high); no separate setting.
   * - Ignored by Gemini (no reasoning effort).
   */
  reasoningEffort?: 'Low' | 'Medium' | 'High' | 'Extra high';
  /**
   * Enable plan-first behavior for this tier.
   *
   * YAML: plan_mode
   * Notes:
   * - Cursor: uses --mode=plan when supported.
   * - Claude/Gemini/Copilot: run a plan-only pass, then re-run to execute the plan.
   * - Codex: prompt-based plan then execute in a single pass.
   */
  planMode?: boolean;
  taskFailureStyle: TaskFailureStyle; // YAML: task_failure_style
  maxIterations: number; // YAML: max_iterations (or max_attempts for iteration tier)
  escalation: 'phase' | 'task' | 'subtask' | null;
  /**
   * P1-G12: Per-tier timeout in milliseconds.
   * Complex tasks (refactoring, test generation) may need longer than default.
   *
   * YAML: timeout_ms
   * Default: 300000 (5 minutes) for subtask/iteration, 600000 (10 minutes) for task
   */
  timeoutMs?: number;
  /**
   * P1-G12: Per-tier hard timeout in milliseconds.
   *
   * YAML: hard_timeout_ms
   * Default: timeoutMs * 2
   */
  hardTimeoutMs?: number;
  /**
   * Claude Code CLI: --permission-mode (default | acceptEdits | plan | dontAsk | bypassPermissions).
   * YAML: permission_mode. Only applied when platform is claude.
   */
  permissionMode?: 'default' | 'acceptEdits' | 'plan' | 'dontAsk' | 'bypassPermissions';
  /**
   * Claude Code CLI: --allowedTools (comma-separated). YAML: allowed_tools.
   * Only applied when platform is claude.
   */
  allowedTools?: string;
  /**
   * Claude Code CLI: --mcp-config <path>. YAML: mcp_config.
   * Only applied when platform is claude.
   */
  mcpConfig?: string;
  /**
   * Claude Code CLI: --strict-mcp-config. YAML: strict_mcp_config.
   * Only applied when platform is claude.
   */
  strictMcpConfig?: boolean;
  /**
   * Claude Code CLI: --plugin-dir <path>. YAML: plugin_dir.
   * Only applied when platform is claude.
   */
  pluginDir?: string;
  /**
   * Output format for headless runs: text | json | stream-json.
   * YAML: output_format. Used by Cursor and Claude runners.
   */
  outputFormat?: 'text' | 'json' | 'stream-json';
  /**
   * CU-P0-T05: Enable platform "ask mode" for read-only/discovery/reviewer passes.
   * YAML: ask_mode. Maps to --mode=ask for Cursor CLI.
   */
  askMode?: boolean;
  /**
   * Input format for headless runs: text | stream-json.
   * YAML: input_format. Used by Cursor and Claude runners.
   */
  inputFormat?: 'text' | 'stream-json';
  /**
   * Structured JSON output validation schema (JSON text).
   * YAML: json_schema. Used by Cursor and Claude runners.
   */
  jsonSchema?: string;
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
  // P0-G20: Configurable git failure handling
  failOnGitError?: boolean; // YAML: fail_on_git_error - When true, git failures stop execution (default: false)
  criticalGitOperations?: ('merge' | 'push' | 'pr')[]; // YAML: critical_git_operations - Which ops are critical
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
  /**
   * Automatically promote extracted patterns/learnings to AGENTS.md after successful iterations.
   * When enabled, learnings with prefixes (learned:/gotcha:/note:/important:) are automatically
   * added to the appropriate AGENTS.md level.
   * YAML: auto_promote_patterns
   * Default: false
   */
  autoPromotePatterns?: boolean; // YAML: auto_promote_patterns
  /**
   * Enforce that gate review updates AGENTS.md when agent indicates update is required.
   * When enabled, gate will fail if agents_update_required is true but no update was made.
   * YAML: enforce_gate_agents_update
   * Default: false
   */
  enforceGateAgentsUpdate?: boolean; // YAML: enforce_gate_agents_update
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
  // P1-G04: Token-based quotas (optional, for platforms that report tokens)
  maxTokensPerRun?: number | 'unlimited'; // YAML: max_tokens_per_run
  maxTokensPerHour?: number | 'unlimited'; // YAML: max_tokens_per_hour
  maxTokensPerDay?: number | 'unlimited'; // YAML: max_tokens_per_day
  cooldownHours?: number; // YAML: cooldown_hours (optional)
  fallbackPlatform: Platform | null; // YAML: fallback_platform
  /**
   * Cursor-specific: Indicates user has grandfathered plan with unlimited Auto mode.
   * When true, Auto mode usage is not counted against quotas.
   * YAML: auto_mode_unlimited (only applies to cursor platform)
   */
  autoModeUnlimited?: boolean; // YAML: auto_mode_unlimited
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
  /** P1-G02: Enable plan mode for read-only execution (default: true for start-chain) */
  planMode?: boolean;
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
  /** P1-T26: AI gap detection settings */
  aiGapDetection?: {
    /** Enable AI gap detection (default: true) */
    enabled?: boolean;
    /** Maximum high-severity gaps before failing (default: 5) */
    maxHighGaps?: number;
    /** Block pipeline on any critical gaps (default: true) */
    blockOnCritical?: boolean;
    /** Platform to use for gap detection (default: claude) */
    platform?: Platform;
    /** Model to use (platform-specific, optional) */
    model?: string;
  };
}

/**
 * Execution configuration.
 * Maps from YAML: execution.kill_agent_on_failure, execution.parallel
 */
export interface ExecutionConfig {
  /**
   * Whether to kill failed agents immediately or keep them alive for debugging.
   * Default: true (kill on failure)
   * YAML: kill_agent_on_failure
   */
  killAgentOnFailure?: boolean; // YAML: kill_agent_on_failure
  /**
   * Parallel execution configuration.
   * See BUILD_QUEUE_IMPROVEMENTS.md P2-T01.
   * YAML: execution.parallel
   */
  parallel?: ParallelExecutionConfig;
}

/**
 * Parallel execution configuration.
 * Maps from YAML: execution.parallel
 * See BUILD_QUEUE_IMPROVEMENTS.md P2-T01.
 */
export interface ParallelExecutionConfig {
  /**
   * Enable parallel subtask execution (default: false).
   * When enabled, independent subtasks run concurrently in git worktrees.
   * YAML: enabled
   */
  enabled: boolean;
  /**
   * Maximum number of concurrent subtask executions (default: 3).
   * Higher values require more system resources.
   * YAML: max_concurrency
   */
  maxConcurrency: number;
  /**
   * Directory for worktrees (default: .puppet-master/worktrees).
   * YAML: worktree_dir
   */
  worktreeDir?: string;
  /**
   * Continue execution if a subtask fails (default: false).
   * When false, stops all parallel execution on first failure.
   * YAML: continue_on_failure
   */
  continueOnFailure?: boolean;
  /**
   * Automatically merge worktree branches back to main (default: true).
   * YAML: merge_results
   */
  mergeResults?: boolean;
  /**
   * Target branch for merging (default: current branch).
   * YAML: target_branch
   */
  targetBranch?: string;
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
 * Loop guard configuration.
 * Prevents infinite ping-pong loops in multi-agent scenarios.
 * Maps from YAML: loop_guard.enabled, loop_guard.max_repetitions, loop_guard.suppress_reply_relay
 * See BUILD_QUEUE_IMPROVEMENTS.md P2-T02
 */
export interface LoopGuardConfig {
  /** Enable loop guard (default: true) */
  enabled: boolean; // YAML: enabled
  /** Maximum times a message can repeat before blocking (default: 3) */
  maxRepetitions: number; // YAML: max_repetitions
  /** Suppress reply-type messages (prevents A→B→A→B... loops) (default: true) */
  suppressReplyRelay: boolean; // YAML: suppress_reply_relay
}

/**
 * P2-T09: Configurable escalation chains.
 *
 * YAML: escalation.chains.<failure_type>[]
 *
 * Note: YAML keys are snake_case and are converted to camelCase at load time.
 * Example: `test_failure` becomes `testFailure`.
 */
export type EscalationChainAction = 'self_fix' | 'kick_down' | 'escalate' | 'pause' | 'retry';

export type EscalationChainKey = 'testFailure' | 'acceptance' | 'timeout' | 'structural' | 'error';

export interface EscalationChainStepConfig {
  action: EscalationChainAction;
  /**
   * Maximum number of attempts this step should apply for.
   *
   * Interpreted as a *range width* (e.g. retry for 2 attempts, then self_fix for 1, then escalate forever).
   *
   * YAML: max_attempts
   * NOTE: Prefer YAML `maxAttempts` (camelCase) to avoid the existing global `max_attempts` loader special-case.
   */
  maxAttempts?: number;
  /** Only meaningful for `action: 'escalate'`. */
  to?: 'phase' | 'task' | 'subtask';
  /** If true, orchestrator should emit a warning/notification. */
  notify?: boolean;
}

export interface EscalationChainsConfig {
  chains: Partial<Record<EscalationChainKey, EscalationChainStepConfig[]>>;
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
  loopGuard?: LoopGuardConfig; // YAML: loop_guard (optional, P2-T02)
  escalation?: EscalationChainsConfig; // YAML: escalation (optional, P2-T09)
  /**
   * P2-T05: Model-level definitions used by complexity routing.
   * YAML: models
   */
  models?: ModelsConfig;
  /**
   * P2-T05: Complexity routing matrix (complexity × taskType → model level).
   * YAML: complexity_routing
   */
  complexityRouting?: ComplexityRoutingMatrix;
}
