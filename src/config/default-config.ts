/**
 * Default configuration for RWM Puppet Master
 * 
 * Provides sensible defaults matching REQUIREMENTS.md Section 17 and Section 23.3
 */

import type { PuppetMasterConfig } from '../types/config.js';

/**
 * Get default configuration values
 * @returns Default PuppetMasterConfig matching the schema
 */
export function getDefaultConfig(): PuppetMasterConfig {
  return {
    project: {
      name: 'Untitled',
      workingDirectory: '.',
    },
    tiers: {
      phase: {
        platform: 'claude',
        model: 'opus',
        selfFix: false,
        maxIterations: 3,
        escalation: null,
      },
      task: {
        platform: 'codex',
        model: 'gpt-4o',
        selfFix: true,
        maxIterations: 5,
        escalation: 'phase',
      },
      subtask: {
        platform: 'cursor',
        model: 'sonnet',
        selfFix: true,
        maxIterations: 10,
        escalation: 'task',
      },
      iteration: {
        platform: 'cursor',
        model: 'auto',
        planMode: true,
        selfFix: false,
        maxIterations: 3,
        escalation: 'subtask',
      },
    },
    // P2-T05: Complexity-based model routing (defaults)
    models: {
      level1: {
        platform: 'claude',
        model: 'haiku',
      },
      level2: {
        platform: 'claude',
        model: 'sonnet',
      },
      level3: {
        platform: 'claude',
        model: 'opus',
      },
    },
    complexityRouting: {
      trivial: { feature: 'level1', bugfix: 'level1', refactor: 'level1', test: 'level1', docs: 'level1' },
      simple: { feature: 'level1', bugfix: 'level2', refactor: 'level1', test: 'level1', docs: 'level1' },
      standard: { feature: 'level2', bugfix: 'level2', refactor: 'level2', test: 'level2', docs: 'level1' },
      critical: { feature: 'level3', bugfix: 'level3', refactor: 'level3', test: 'level2', docs: 'level2' },
    },
    branching: {
      baseBranch: 'main',
      namingPattern: 'ralph/{phase}/{task}',
      granularity: 'per-task',
      pushPolicy: 'per-subtask',
      mergePolicy: 'squash',
      autoPr: true,
    },
    verification: {
      browserAdapter: 'dev-browser',
      screenshotOnFailure: true,
      evidenceDirectory: '.puppet-master/evidence',
    },
    memory: {
      progressFile: 'progress.txt',
      agentsFile: 'AGENTS.md',
      prdFile: '.puppet-master/prd.json',
      multiLevelAgents: true,
      agentsEnforcement: {
        requireUpdateOnFailure: true,
        requireUpdateOnGotcha: true,
        gateFailsOnMissingUpdate: true,
        reviewerMustAcknowledge: true,
        autoPromotePatterns: false,
        enforceGateAgentsUpdate: false,
      },
    },
    budgets: {
      claude: {
        maxCallsPerRun: 5,
        maxCallsPerHour: 3,
        maxCallsPerDay: 10,
        cooldownHours: 5,
        fallbackPlatform: 'codex',
      },
      codex: {
        maxCallsPerRun: 50,
        maxCallsPerHour: 20,
        maxCallsPerDay: 100,
        fallbackPlatform: 'cursor',
      },
      cursor: {
        maxCallsPerRun: 'unlimited',
        maxCallsPerHour: 'unlimited',
        maxCallsPerDay: 'unlimited',
        fallbackPlatform: null,
      },
      gemini: {
        maxCallsPerRun: 100,
        maxCallsPerHour: 'unlimited',
        maxCallsPerDay: 'unlimited',
        fallbackPlatform: 'copilot',
      },
      copilot: {
        maxCallsPerRun: 'unlimited',
        maxCallsPerHour: 'unlimited',
        maxCallsPerDay: 'unlimited',
        fallbackPlatform: 'gemini',
      },
    },
    budgetEnforcement: {
      onLimitReached: 'fallback',
      warnAtPercentage: 80,
      notifyOnFallback: true,
      softLimitPercent: 80,
      hardLimitPercent: 100,
    },
    rateLimits: {
      cursor: {
        callsPerMinute: 20,
        cooldownMs: 5000,
      },
      codex: {
        callsPerMinute: 10,
        cooldownMs: 10000,
      },
      claude: {
        callsPerMinute: 30,
        cooldownMs: 3000,
      },
      gemini: {
        callsPerMinute: 50,
        cooldownMs: 2000,
      },
      copilot: {
        callsPerMinute: 40,
        cooldownMs: 2500,
      },
    },
    logging: {
      level: 'info',
      retentionDays: 30,
    },
    cliPaths: {
      cursor: 'cursor-agent',
      codex: 'codex',
      claude: 'claude',
      gemini: 'gemini',
      copilot: 'copilot',
    },
    execution: {
      killAgentOnFailure: true,
    },
    checkpointing: {
      enabled: true,
      interval: 10,
      maxCheckpoints: 10,
      checkpointOnSubtaskComplete: true,
      checkpointOnShutdown: true,
    },
    loopGuard: {
      enabled: true,
      maxRepetitions: 3,
      suppressReplyRelay: true,
    },
  };
}
