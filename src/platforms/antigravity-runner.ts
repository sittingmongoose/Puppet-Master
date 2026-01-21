/**
 * Google Antigravity Platform Runner
 *
 * DESIGN DECISION: Antigravity CLI (`agy`) is a GUI launcher only.
 *
 * Investigation (AG-P1-T11) confirmed that:
 * - `agy` CLI has NO headless flags or automation support
 * - It simply launches Antigravity IDE in a directory (like `code .` for VS Code)
 * - Antigravity Workflows exist for IDE-based automation (still interactive)
 * - MCP servers can provide tool integration but require IDE context
 * - NO official REST API or programmatic execution interface exists
 *
 * RECOMMENDATION: For headless automation, use `gemini` or `copilot` platforms instead.
 *
 * This runner fails gracefully with a clear message when invoked.
 *
 * Per REQUIREMENTS.md Section 26.2 (Platform Runner Contract)
 * See AG-P1-T11 research for detailed findings.
 */

import { type ChildProcess } from 'child_process';
import { BasePlatformRunner } from './base-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import type {
  Platform,
  ExecutionRequest,
  ExecutionResult,
} from '../types/platforms.js';

export class AntigravityRunner extends BasePlatformRunner {
  readonly platform: Platform = 'antigravity';

  /**
   * Creates a new AntigravityRunner instance.
   *
   * @param capabilityService - Capability discovery service (required)
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    defaultTimeout: number = 0, // Not used (runner always fails fast)
    hardTimeout: number = 0 // Not used (runner always fails fast)
  ) {
    super(capabilityService, defaultTimeout, hardTimeout);
  }

  /**
   * Spawn is not implemented for Antigravity.
   * The `agy` CLI is a GUI launcher only and does not support headless execution.
   */
  protected async spawn(_request: ExecutionRequest): Promise<ChildProcess> {
    throw new Error(
      'Antigravity CLI (`agy`) does not support headless/non-interactive execution. ' +
        'The `agy` command is a GUI launcher only. ' +
        'For headless automation, please use `gemini` or `copilot` platforms instead. ' +
        'See https://antigravity.google/ and addgravity.md for details.'
    );
  }

  /**
   * Build args is not implemented for Antigravity (no headless mode).
   */
  protected buildArgs(_request: ExecutionRequest): string[] {
    return [];
  }

  /**
   * Parse output is not implemented for Antigravity (no headless mode).
   */
  protected parseOutput(_output: string): ExecutionResult {
    return {
      success: false,
      output: '',
      exitCode: 1,
      duration: 0,
      processId: 0,
      error: 'Antigravity CLI does not support headless execution',
    };
  }
}

export function createAntigravityRunner(
  capabilityService: CapabilityDiscoveryService
): AntigravityRunner {
  return new AntigravityRunner(capabilityService);
}
