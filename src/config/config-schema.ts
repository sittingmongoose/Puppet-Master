/**
 * Configuration schema validation
 * 
 * Validates that a configuration object matches the PuppetMasterConfig schema
 * and throws descriptive errors for invalid configurations.
 */

import type {
  PuppetMasterConfig,
  Platform,
  TierConfig,
  BranchingConfig,
  VerificationConfig,
  MemoryConfig,
  BudgetConfig,
  PlatformBudgets,
  BudgetEnforcementConfig,
  LoggingConfig,
  CliPathsConfig,
  AgentsEnforcementConfig,
  ExecutionConfig,
  RateLimitConfig,
  PlatformRateLimits,
  CheckpointingConfig,
} from '../types/config.js';

/**
 * Validation error class
 */
export class ConfigValidationError extends Error {
  constructor(message: string, public readonly path: string[] = []) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Validate configuration structure and types
 * @param config - Configuration object to validate
 * @throws ConfigValidationError if configuration is invalid
 */
export function validateConfig(config: unknown): asserts config is PuppetMasterConfig {
  if (typeof config !== 'object' || config === null) {
    throw new ConfigValidationError('Configuration must be an object');
  }

  const c = config as Record<string, unknown>;

  // Validate required top-level keys
  const requiredKeys = [
    'project',
    'tiers',
    'branching',
    'verification',
    'memory',
    'budgets',
    'budgetEnforcement',
    'logging',
    'cliPaths',
  ];

  for (const key of requiredKeys) {
    if (!(key in c)) {
      throw new ConfigValidationError(`Missing required key: ${key}`);
    }
  }

  // Validate project
  validateProjectConfig(c.project, ['project']);

  // Validate tiers
  validateTiersConfig(c.tiers, ['tiers']);

  // Validate branching
  validateBranchingConfig(c.branching, ['branching']);

  // Validate verification
  validateVerificationConfig(c.verification, ['verification']);

  // Validate memory
  validateMemoryConfig(c.memory, ['memory']);

  // Validate budgets
  validatePlatformBudgets(c.budgets, ['budgets']);

  // Validate budgetEnforcement
  validateBudgetEnforcementConfig(c.budgetEnforcement, ['budgetEnforcement']);

  // Validate logging
  validateLoggingConfig(c.logging, ['logging']);

  // Validate cliPaths
  validateCliPathsConfig(c.cliPaths, ['cliPaths']);

  // Validate startChain (optional)
  if ('startChain' in c) {
    validateStartChainConfig(c.startChain, ['startChain']);
  }

  // Validate execution (optional)
  if ('execution' in c) {
    validateExecutionConfig(c.execution, ['execution']);
  }

  // Validate checkpointing (optional)
  if ('checkpointing' in c) {
    validateCheckpointingConfig(c.checkpointing, ['checkpointing']);
  }
}

function validateProjectConfig(value: unknown, path: string[]): asserts value is { name: string; workingDirectory: string } {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('project must be an object', path);
  }
  const v = value as Record<string, unknown>;
  if (typeof v.name !== 'string') {
    throw new ConfigValidationError('project.name must be a string', [...path, 'name']);
  }
  if (typeof v.workingDirectory !== 'string') {
    throw new ConfigValidationError('project.workingDirectory must be a string', [...path, 'workingDirectory']);
  }
}

function validateTierConfig(value: unknown, path: string[]): asserts value is TierConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('tier config must be an object', path);
  }
  const v = value as Record<string, unknown>;

  // Validate platform
  if (!isPlatform(v.platform)) {
    throw new ConfigValidationError(`tier.platform must be one of: cursor, codex, claude, gemini, copilot`, [...path, 'platform']);
  }

  // Validate model
  if (typeof v.model !== 'string') {
    throw new ConfigValidationError('tier.model must be a string', [...path, 'model']);
  }

  // Validate planMode (optional)
  if ('planMode' in v && typeof v.planMode !== 'boolean') {
    throw new ConfigValidationError('tier.planMode must be a boolean', [...path, 'planMode']);
  }

  // Validate selfFix
  if (typeof v.selfFix !== 'boolean') {
    throw new ConfigValidationError('tier.selfFix must be a boolean', [...path, 'selfFix']);
  }

  // Validate maxIterations
  if (typeof v.maxIterations !== 'number' || v.maxIterations < 1) {
    throw new ConfigValidationError('tier.maxIterations must be a positive number', [...path, 'maxIterations']);
  }

  // Validate escalation
  if (v.escalation !== null && !['phase', 'task', 'subtask'].includes(v.escalation as string)) {
    throw new ConfigValidationError('tier.escalation must be null, "phase", "task", or "subtask"', [...path, 'escalation']);
  }
}

function validateTiersConfig(value: unknown, path: string[]): asserts value is { phase: TierConfig; task: TierConfig; subtask: TierConfig; iteration: TierConfig; gate_review?: TierConfig } {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('tiers must be an object', path);
  }
  const v = value as Record<string, unknown>;

  const tierKeys = ['phase', 'task', 'subtask', 'iteration'];
  for (const key of tierKeys) {
    if (!(key in v)) {
      throw new ConfigValidationError(`Missing required tier: ${key}`, [...path, key]);
    }
    validateTierConfig(v[key], [...path, key]);
  }

  // Validate optional gate_review tier config
  if ('gate_review' in v) {
    validateTierConfig(v.gate_review, [...path, 'gate_review']);
  }
}

function validateBranchingConfig(value: unknown, path: string[]): asserts value is BranchingConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('branching must be an object', path);
  }
  const v = value as Record<string, unknown>;

  if (typeof v.baseBranch !== 'string') {
    throw new ConfigValidationError('branching.baseBranch must be a string', [...path, 'baseBranch']);
  }
  if (typeof v.namingPattern !== 'string') {
    throw new ConfigValidationError('branching.namingPattern must be a string', [...path, 'namingPattern']);
  }
  if (!['single', 'per-phase', 'per-task'].includes(v.granularity as string)) {
    throw new ConfigValidationError('branching.granularity must be one of: single, per-phase, per-task', [...path, 'granularity']);
  }
  if (!['per-iteration', 'per-subtask', 'per-task', 'per-phase'].includes(v.pushPolicy as string)) {
    throw new ConfigValidationError('branching.pushPolicy must be one of: per-iteration, per-subtask, per-task, per-phase', [...path, 'pushPolicy']);
  }
  if (!['merge', 'squash', 'rebase'].includes(v.mergePolicy as string)) {
    throw new ConfigValidationError('branching.mergePolicy must be one of: merge, squash, rebase', [...path, 'mergePolicy']);
  }
  if (typeof v.autoPr !== 'boolean') {
    throw new ConfigValidationError('branching.autoPr must be a boolean', [...path, 'autoPr']);
  }
}

function validateVerificationConfig(value: unknown, path: string[]): asserts value is VerificationConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('verification must be an object', path);
  }
  const v = value as Record<string, unknown>;

  if (typeof v.browserAdapter !== 'string') {
    throw new ConfigValidationError('verification.browserAdapter must be a string', [...path, 'browserAdapter']);
  }
  if (typeof v.screenshotOnFailure !== 'boolean') {
    throw new ConfigValidationError('verification.screenshotOnFailure must be a boolean', [...path, 'screenshotOnFailure']);
  }
  if (typeof v.evidenceDirectory !== 'string') {
    throw new ConfigValidationError('verification.evidenceDirectory must be a string', [...path, 'evidenceDirectory']);
  }
}

function validateAgentsEnforcementConfig(value: unknown, path: string[]): asserts value is AgentsEnforcementConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('agentsEnforcement must be an object', path);
  }
  const v = value as Record<string, unknown>;

  if (typeof v.requireUpdateOnFailure !== 'boolean') {
    throw new ConfigValidationError('agentsEnforcement.requireUpdateOnFailure must be a boolean', [...path, 'requireUpdateOnFailure']);
  }
  if (typeof v.requireUpdateOnGotcha !== 'boolean') {
    throw new ConfigValidationError('agentsEnforcement.requireUpdateOnGotcha must be a boolean', [...path, 'requireUpdateOnGotcha']);
  }
  if (typeof v.gateFailsOnMissingUpdate !== 'boolean') {
    throw new ConfigValidationError('agentsEnforcement.gateFailsOnMissingUpdate must be a boolean', [...path, 'gateFailsOnMissingUpdate']);
  }
  if (typeof v.reviewerMustAcknowledge !== 'boolean') {
    throw new ConfigValidationError('agentsEnforcement.reviewerMustAcknowledge must be a boolean', [...path, 'reviewerMustAcknowledge']);
  }
}

function validateMemoryConfig(value: unknown, path: string[]): asserts value is MemoryConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('memory must be an object', path);
  }
  const v = value as Record<string, unknown>;

  if (typeof v.progressFile !== 'string') {
    throw new ConfigValidationError('memory.progressFile must be a string', [...path, 'progressFile']);
  }
  if (typeof v.agentsFile !== 'string') {
    throw new ConfigValidationError('memory.agentsFile must be a string', [...path, 'agentsFile']);
  }
  if (typeof v.prdFile !== 'string') {
    throw new ConfigValidationError('memory.prdFile must be a string', [...path, 'prdFile']);
  }
  if (typeof v.multiLevelAgents !== 'boolean') {
    throw new ConfigValidationError('memory.multiLevelAgents must be a boolean', [...path, 'multiLevelAgents']);
  }
  if (!('agentsEnforcement' in v)) {
    throw new ConfigValidationError('memory.agentsEnforcement is required', [...path, 'agentsEnforcement']);
  }
  validateAgentsEnforcementConfig(v.agentsEnforcement, [...path, 'agentsEnforcement']);
}

function validateBudgetConfig(value: unknown, path: string[]): asserts value is BudgetConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('budget config must be an object', path);
  }
  const v = value as Record<string, unknown>;

  if (v.maxCallsPerRun !== 'unlimited' && (typeof v.maxCallsPerRun !== 'number' || v.maxCallsPerRun < 1)) {
    throw new ConfigValidationError('budget.maxCallsPerRun must be a positive number or "unlimited"', [...path, 'maxCallsPerRun']);
  }
  if (v.maxCallsPerHour !== 'unlimited' && (typeof v.maxCallsPerHour !== 'number' || v.maxCallsPerHour < 1)) {
    throw new ConfigValidationError('budget.maxCallsPerHour must be a positive number or "unlimited"', [...path, 'maxCallsPerHour']);
  }
  if (v.maxCallsPerDay !== 'unlimited' && (typeof v.maxCallsPerDay !== 'number' || v.maxCallsPerDay < 1)) {
    throw new ConfigValidationError('budget.maxCallsPerDay must be a positive number or "unlimited"', [...path, 'maxCallsPerDay']);
  }
  if ('cooldownHours' in v && (typeof v.cooldownHours !== 'number' || v.cooldownHours < 0)) {
    throw new ConfigValidationError('budget.cooldownHours must be a non-negative number', [...path, 'cooldownHours']);
  }
  if (v.fallbackPlatform !== null && !isPlatform(v.fallbackPlatform)) {
    throw new ConfigValidationError('budget.fallbackPlatform must be null or one of: cursor, codex, claude, gemini, copilot', [...path, 'fallbackPlatform']);
  }
}

function validatePlatformBudgets(value: unknown, path: string[]): asserts value is PlatformBudgets {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('budgets must be an object', path);
  }
  const v = value as Record<string, unknown>;

  const platforms: Platform[] = ['claude', 'codex', 'cursor', 'gemini', 'copilot'];
  for (const platform of platforms) {
    if (!(platform in v)) {
      throw new ConfigValidationError(`Missing required budget for platform: ${platform}`, [...path, platform]);
    }
    validateBudgetConfig(v[platform], [...path, platform]);
  }
}

function validateRateLimitConfig(value: unknown, path: string[]): asserts value is RateLimitConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('rate limit config must be an object', path);
  }
  const v = value as Record<string, unknown>;

  if (typeof v.callsPerMinute !== 'number' || v.callsPerMinute < 1) {
    throw new ConfigValidationError('rate limit callsPerMinute must be a positive number', [...path, 'callsPerMinute']);
  }
  if (typeof v.cooldownMs !== 'number' || v.cooldownMs < 0) {
    throw new ConfigValidationError('rate limit cooldownMs must be a non-negative number', [...path, 'cooldownMs']);
  }
}

function validatePlatformRateLimits(value: unknown, path: string[]): asserts value is PlatformRateLimits {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('rate limits must be an object', path);
  }
  const v = value as Record<string, unknown>;

  const platforms: Platform[] = ['claude', 'codex', 'cursor', 'gemini', 'copilot'];
  for (const platform of platforms) {
    if (!(platform in v)) {
      throw new ConfigValidationError(`Missing required rate limit for platform: ${platform}`, [...path, platform]);
    }
    validateRateLimitConfig(v[platform], [...path, platform]);
  }
}

function validateBudgetEnforcementConfig(value: unknown, path: string[]): asserts value is BudgetEnforcementConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('budgetEnforcement must be an object', path);
  }
  const v = value as Record<string, unknown>;

  if (!['fallback', 'pause', 'queue'].includes(v.onLimitReached as string)) {
    throw new ConfigValidationError('budgetEnforcement.onLimitReached must be one of: fallback, pause, queue', [...path, 'onLimitReached']);
  }
  if (typeof v.warnAtPercentage !== 'number' || v.warnAtPercentage < 0 || v.warnAtPercentage > 100) {
    throw new ConfigValidationError('budgetEnforcement.warnAtPercentage must be a number between 0 and 100', [...path, 'warnAtPercentage']);
  }
  if (typeof v.notifyOnFallback !== 'boolean') {
    throw new ConfigValidationError('budgetEnforcement.notifyOnFallback must be a boolean', [...path, 'notifyOnFallback']);
  }
  if ('softLimitPercent' in v && (typeof v.softLimitPercent !== 'number' || v.softLimitPercent < 0 || v.softLimitPercent > 100)) {
    throw new ConfigValidationError('budgetEnforcement.softLimitPercent must be a number between 0 and 100', [...path, 'softLimitPercent']);
  }
  if ('hardLimitPercent' in v && (typeof v.hardLimitPercent !== 'number' || v.hardLimitPercent < 0 || v.hardLimitPercent > 100)) {
    throw new ConfigValidationError('budgetEnforcement.hardLimitPercent must be a number between 0 and 100', [...path, 'hardLimitPercent']);
  }
}

function validateLoggingConfig(value: unknown, path: string[]): asserts value is LoggingConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('logging must be an object', path);
  }
  const v = value as Record<string, unknown>;

  if (!['debug', 'info', 'warn', 'error'].includes(v.level as string)) {
    throw new ConfigValidationError('logging.level must be one of: debug, info, warn, error', [...path, 'level']);
  }
  if (typeof v.retentionDays !== 'number' || v.retentionDays < 1) {
    throw new ConfigValidationError('logging.retentionDays must be a positive number', [...path, 'retentionDays']);
  }
}

function validateStartChainStepConfig(value: unknown, path: string[]): void {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('start chain step config must be an object', path);
  }
  const v = value as Record<string, unknown>;

  if ('enabled' in v && typeof v.enabled !== 'boolean') {
    throw new ConfigValidationError('step.enabled must be a boolean', [...path, 'enabled']);
  }
  if ('platform' in v && !isPlatform(v.platform)) {
    throw new ConfigValidationError('step.platform must be a valid platform', [...path, 'platform']);
  }
  if ('model' in v && typeof v.model !== 'string') {
    throw new ConfigValidationError('step.model must be a string', [...path, 'model']);
  }
}

function validateStartChainConfig(value: unknown, path: string[]): void {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('startChain must be an object', path);
  }
  const v = value as Record<string, unknown>;

  // Validate inventory
  if ('inventory' in v) {
    validateStartChainStepConfig(v.inventory, [...path, 'inventory']);
  }

  // Validate requirementsInterview
  if ('requirementsInterview' in v) {
    validateStartChainStepConfig(v.requirementsInterview, [...path, 'requirementsInterview']);
    const ri = v.requirementsInterview as Record<string, unknown>;
    if ('maxQuestions' in ri && (typeof ri.maxQuestions !== 'number' || ri.maxQuestions < 1)) {
      throw new ConfigValidationError('requirementsInterview.maxQuestions must be a positive number', [...path, 'requirementsInterview', 'maxQuestions']);
    }
    if ('allowUnansweredCritical' in ri && typeof ri.allowUnansweredCritical !== 'boolean') {
      throw new ConfigValidationError('requirementsInterview.allowUnansweredCritical must be a boolean', [...path, 'requirementsInterview', 'allowUnansweredCritical']);
    }
  }

  // Validate prd
  if ('prd' in v) {
    validateStartChainStepConfig(v.prd, [...path, 'prd']);
  }

  // Validate architecture
  if ('architecture' in v) {
    validateStartChainStepConfig(v.architecture, [...path, 'architecture']);
    const arch = v.architecture as Record<string, unknown>;
    if ('includeTestStrategy' in arch && typeof arch.includeTestStrategy !== 'boolean') {
      throw new ConfigValidationError('architecture.includeTestStrategy must be a boolean', [...path, 'architecture', 'includeTestStrategy']);
    }
  }

  // Validate validation
  if ('validation' in v) {
    validateStartChainStepConfig(v.validation, [...path, 'validation']);
  }

  // Validate gapFill
  if ('gapFill' in v) {
    validateStartChainStepConfig(v.gapFill, [...path, 'gapFill']);
    const gf = v.gapFill as Record<string, unknown>;
    if ('maxRepairPasses' in gf && (typeof gf.maxRepairPasses !== 'number' || gf.maxRepairPasses < 0)) {
      throw new ConfigValidationError('gapFill.maxRepairPasses must be a non-negative number', [...path, 'gapFill', 'maxRepairPasses']);
    }
  }

  // Validate coverage
  if ('coverage' in v) {
    // coverage has StartChainStepConfig properties AND CoverageValidationConfig properties
    const cov = v.coverage as Record<string, unknown>;
    // Check basic step config fields manually to avoid type confusion or just pass to helper
    validateStartChainStepConfig(v.coverage, [...path, 'coverage']);
    
    // Check specific coverage fields
    if ('minCoverageRatio' in cov && (typeof cov.minCoverageRatio !== 'number' || cov.minCoverageRatio < 0 || cov.minCoverageRatio > 1)) {
      throw new ConfigValidationError('coverage.minCoverageRatio must be between 0 and 1', [...path, 'coverage', 'minCoverageRatio']);
    }
    if ('largeDocThreshold' in cov && (typeof cov.largeDocThreshold !== 'number' || cov.largeDocThreshold < 0)) {
      throw new ConfigValidationError('coverage.largeDocThreshold must be a non-negative number', [...path, 'coverage', 'largeDocThreshold']);
    }
    // ... other coverage fields validation ...
  }
}

function validateCliPathsConfig(value: unknown, path: string[]): asserts value is CliPathsConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('cliPaths must be an object', path);
  }
  const v = value as Record<string, unknown>;

  const platforms: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];
  for (const platform of platforms) {
    if (!(platform in v)) {
      throw new ConfigValidationError(`Missing required cliPath for platform: ${platform}`, [...path, platform]);
    }
    if (typeof v[platform] !== 'string') {
      throw new ConfigValidationError(`cliPaths.${platform} must be a string`, [...path, platform]);
    }
  }
}

function validateExecutionConfig(value: unknown, path: string[]): asserts value is ExecutionConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('execution must be an object', path);
  }
  const v = value as Record<string, unknown>;

  // killAgentOnFailure is optional boolean
  if ('killAgentOnFailure' in v) {
    if (typeof v.killAgentOnFailure !== 'boolean') {
      throw new ConfigValidationError('execution.killAgentOnFailure must be a boolean', [...path, 'killAgentOnFailure']);
    }
  }
}

function validateCheckpointingConfig(value: unknown, path: string[]): asserts value is CheckpointingConfig {
  if (typeof value !== 'object' || value === null) {
    throw new ConfigValidationError('checkpointing must be an object', path);
  }
  const v = value as Record<string, unknown>;

  if (typeof v.enabled !== 'boolean') {
    throw new ConfigValidationError('checkpointing.enabled must be a boolean', [...path, 'enabled']);
  }
  if (typeof v.interval !== 'number' || v.interval < 1) {
    throw new ConfigValidationError('checkpointing.interval must be a positive number', [...path, 'interval']);
  }
  if (typeof v.maxCheckpoints !== 'number' || v.maxCheckpoints < 1) {
    throw new ConfigValidationError('checkpointing.maxCheckpoints must be a positive number', [...path, 'maxCheckpoints']);
  }
  if (typeof v.checkpointOnSubtaskComplete !== 'boolean') {
    throw new ConfigValidationError('checkpointing.checkpointOnSubtaskComplete must be a boolean', [...path, 'checkpointOnSubtaskComplete']);
  }
  if (typeof v.checkpointOnShutdown !== 'boolean') {
    throw new ConfigValidationError('checkpointing.checkpointOnShutdown must be a boolean', [...path, 'checkpointOnShutdown']);
  }
}

function isPlatform(value: unknown): value is Platform {
  return value === 'cursor' || value === 'codex' || value === 'claude' || value === 'gemini' || value === 'copilot';
}
