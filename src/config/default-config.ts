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
        model: 'opus-4.5',
        selfFix: false,
        maxIterations: 3,
        escalation: null,
      },
      task: {
        platform: 'codex',
        model: 'gpt-5.2-high',
        selfFix: true,
        maxIterations: 5,
        escalation: 'phase',
      },
      subtask: {
        platform: 'cursor',
        model: 'sonnet-4.5-thinking',
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
      antigravity: {
        maxCallsPerRun: 'unlimited',
        maxCallsPerHour: 'unlimited',
        maxCallsPerDay: 'unlimited',
        fallbackPlatform: null,
      },
    },
    budgetEnforcement: {
      onLimitReached: 'fallback',
      warnAtPercentage: 80,
      notifyOnFallback: true,
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
      antigravity: 'agy',
    },
  };
}
