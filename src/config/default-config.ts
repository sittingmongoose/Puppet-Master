/**
 * Default configuration for RWM Puppet Master
 * 
 * Provides sensible defaults matching REQUIREMENTS.md Section 17 and Section 23.3
 */

import type { LoggingConfig, PuppetMasterConfig, Platform } from '../types/config.js';
import { PlatformDetector } from '../platforms/platform-detector.js';

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
        taskFailureStyle: 'skip_retries',
        maxIterations: 3,
        escalation: null,
      },
      task: {
        platform: 'codex',
        model: 'gpt-4o',
        taskFailureStyle: 'spawn_new_agent',
        maxIterations: 5,
        escalation: 'phase',
      },
      subtask: {
        platform: 'cursor',
        model: 'sonnet',
        taskFailureStyle: 'spawn_new_agent',
        maxIterations: 10,
        escalation: 'task',
      },
      iteration: {
        platform: 'cursor',
        model: 'auto',
        planMode: true,
        taskFailureStyle: 'skip_retries',
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
      intensive: false,
    } satisfies LoggingConfig,
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

/**
 * Adjust config to use only installed platforms
 * 
 * If a tier uses an uninstalled platform, changes it to the first installed platform.
 * If no platforms are installed, returns config as-is (user will need to install platforms).
 * 
 * @param config - Configuration to adjust
 * @param installedPlatforms - List of installed platforms
 * @returns Adjusted configuration
 */
export function adjustConfigForInstalledPlatforms(
  config: PuppetMasterConfig,
  installedPlatforms: Platform[]
): PuppetMasterConfig {
  if (installedPlatforms.length === 0) {
    // No platforms installed - return config as-is
    // User will need to install platforms via wizard
    return config;
  }

  const firstInstalled = installedPlatforms[0];
  const adjustedConfig = { ...config };

  // Adjust tier platforms
  if (adjustedConfig.tiers) {
    if (adjustedConfig.tiers.phase && !installedPlatforms.includes(adjustedConfig.tiers.phase.platform)) {
      adjustedConfig.tiers.phase.platform = firstInstalled;
    }
    if (adjustedConfig.tiers.task && !installedPlatforms.includes(adjustedConfig.tiers.task.platform)) {
      adjustedConfig.tiers.task.platform = firstInstalled;
    }
    if (adjustedConfig.tiers.subtask && !installedPlatforms.includes(adjustedConfig.tiers.subtask.platform)) {
      adjustedConfig.tiers.subtask.platform = firstInstalled;
    }
    if (adjustedConfig.tiers.iteration && !installedPlatforms.includes(adjustedConfig.tiers.iteration.platform)) {
      adjustedConfig.tiers.iteration.platform = firstInstalled;
    }
  }

  // Adjust model level platforms
  if (adjustedConfig.models) {
    if (adjustedConfig.models.level1 && !installedPlatforms.includes(adjustedConfig.models.level1.platform)) {
      adjustedConfig.models.level1.platform = firstInstalled;
    }
    if (adjustedConfig.models.level2 && !installedPlatforms.includes(adjustedConfig.models.level2.platform)) {
      adjustedConfig.models.level2.platform = firstInstalled;
    }
    if (adjustedConfig.models.level3 && !installedPlatforms.includes(adjustedConfig.models.level3.platform)) {
      adjustedConfig.models.level3.platform = firstInstalled;
    }
  }

  return adjustedConfig;
}

/**
 * Get default configuration adjusted for installed platforms
 * 
 * This is an async version that detects installed platforms and adjusts defaults.
 * Use this when you need to ensure config only uses installed platforms.
 * 
 * @param cliPaths - CLI paths configuration
 * @returns Default config adjusted for installed platforms
 */
export async function getDefaultConfigForInstalledPlatforms(
  cliPaths: PuppetMasterConfig['cliPaths']
): Promise<PuppetMasterConfig> {
  const defaultConfig = getDefaultConfig();
  
  try {
    const detector = new PlatformDetector(cliPaths);
    const installed = await detector.getInstalledPlatforms();
    return adjustConfigForInstalledPlatforms(defaultConfig, installed);
  } catch (error) {
    // If detection fails, return default config as-is
    console.warn('[Config] Failed to detect installed platforms, using defaults:', error);
    return defaultConfig;
  }
}
