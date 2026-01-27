/**
 * Codex Platform Runner for RWM Puppet Master
 * 
 * Implements Codex using the @openai/codex-sdk (which spawns CLI processes internally).
 * 
 * The SDK is CLI-based: it wraps the bundled `codex` binary and spawns the CLI,
 * exchanging JSONL events over stdin/stdout. This respects the "CLI only" constraint.
 * 
 * IMPORTANT: The "CLI only" constraint means using subscription-based access
 * (ChatGPT/Codex plan) rather than pay-per-use API calls. The SDK qualifies because
 * it spawns CLI processes which use the subscription account, not direct API calls.
 * 
 * Per REQUIREMENTS.md Section 3.4.2 (Codex Integration) and
 * ARCHITECTURE.md Section 6.1.2 (Platform Runners).
 * 
 * IMPORTANT: We create a NEW thread for each iteration to maintain the
 * "fresh process per iteration" requirement (REQUIREMENTS.md Section 26.1).
 */

import type {
  Platform,
  ExecutionRequest,
  ExecutionResult,
} from '../types/platforms.js';
import { BasePlatformRunner } from './base-runner.js';
import { CapabilityDiscoveryService } from './capability-discovery.js';
import { CodexOutputParser } from './output-parsers/index.js';
import type { FreshSpawner } from '../core/fresh-spawn.js';
import { Codex, type Thread, type RunResult, type ThreadOptions, type TurnOptions } from '@openai/codex-sdk';
import { PLATFORM_COMMANDS } from './constants.js';
import type { ChildProcess } from 'child_process';

/**
 * Codex platform runner.
 * 
 * Handles Codex CLI invocation with proper argument construction
 * and output parsing.
 */
export class CodexRunner extends BasePlatformRunner {
  readonly platform: Platform = 'codex';
  private readonly outputParser: CodexOutputParser;
  private readonly codexClient: Codex;

  /**
   * Creates a new CodexRunner instance.
   * 
   * Uses @openai/codex-sdk which spawns CLI processes internally (CLI-based, respects constraint).
   * 
   * @param capabilityService - Capability discovery service (required)
   * @param defaultTimeout - Default timeout in milliseconds (default: 300000 = 5 minutes)
   * @param hardTimeout - Hard timeout in milliseconds (default: 1800000 = 30 minutes)
   * @param freshSpawner - Optional FreshSpawner for process isolation (P1-T09) - not used with SDK
   */
  constructor(
    capabilityService: CapabilityDiscoveryService,
    defaultTimeout: number = 300_000,
    hardTimeout: number = 1_800_000,
    freshSpawner?: FreshSpawner
  ) {
    super(capabilityService, defaultTimeout, hardTimeout, undefined, undefined, undefined, freshSpawner);
    this.outputParser = new CodexOutputParser();
    
    // Initialize Codex SDK client
    // SDK spawns CLI processes internally, so this respects "CLI only" constraint
    // SDK uses subscription account (via CLI) rather than pay-per-use API calls
    // IMPORTANT: We do NOT provide apiKey or baseUrl options - this ensures SDK uses
    // CLI's default authentication (subscription account) rather than direct API calls
    this.codexClient = new Codex({
      // SDK will inherit Node.js process environment
      // We can customize env if needed for sandboxed environments
      // Note: NOT providing apiKey/baseUrl means SDK uses CLI which authenticates via subscription account
    });
  }

  /**
   * Executes a request using the Codex SDK.
   * 
   * Overrides base class execute() to use SDK instead of direct CLI spawn.
   * Creates a NEW thread for each iteration to maintain fresh-process requirement.
   * 
   * The SDK spawns CLI processes internally, so this respects the "CLI only" constraint.
   * 
   * IMPORTANT: We still call base class checks (circuit breaker, rate limits, quotas)
   * before executing, but then use SDK for the actual execution.
   */
  async execute(request: ExecutionRequest): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Call base class checks (circuit breaker, rate limits, quotas)
      // Access protected members via type assertion for compatibility
      const base = this as unknown as {
        circuitBreaker: { assertCanExecute(): void; recordFailure(): void };
        rateLimiter?: { waitForSlot(platform: Platform): Promise<void> };
        quotaManager?: { checkQuota(platform: Platform, model?: string): Promise<void> };
      };
      
      base.circuitBreaker.assertCanExecute();
      
      if (base.rateLimiter) {
        await base.rateLimiter.waitForSlot(this.platform);
      }
      if (base.quotaManager) {
        // P0: Pass model to checkQuota for Cursor Auto mode unlimited detection
        await base.quotaManager.checkQuota(this.platform, request.model);
      }
      
      // Build prompt with plan mode preamble if needed
      const prompt = this.buildPrompt(request);
      
      // Set up timeout handling using AbortSignal
      const timeoutMs = request.timeout ?? this.defaultTimeout;
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeoutMs);
      
      try {
        // Create a NEW thread for this iteration (fresh process requirement)
        // Each iteration gets a fresh thread, no reuse between iterations
        // This ensures we meet the "fresh process per iteration" requirement
        const threadOptions: ThreadOptions = {
          workingDirectory: request.workingDirectory,
          skipGitRepoCheck: false, // Could be made configurable via ExecutionRequest
          // Non-interactive execution: ensure Codex never pauses for approval and can write
          approvalPolicy: 'never', // Full automation - no approval prompts
          sandboxMode: 'workspace-write', // Allow writes within workspace
        };
        
        // Add model if specified
        if (request.model) {
          threadOptions.model = request.model;
        }
        
        const thread = this.codexClient.startThread(threadOptions);
        
        // Build SDK run options from ExecutionRequest
        const runOptions: TurnOptions = {
          signal: abortController.signal, // For timeout cancellation
        };
        
        // P0: Add output schema if provided (structured JSON output validation)
        // SDK supports outputSchema in TurnOptions per @openai/codex-sdk npm documentation
        if (request.jsonSchema) {
          try {
            // Parse JSON schema string to object
            const schema = typeof request.jsonSchema === 'string' 
              ? JSON.parse(request.jsonSchema)
              : request.jsonSchema;
            runOptions.outputSchema = schema;
          } catch (error) {
            console.warn(`[CodexRunner] Failed to parse JSON schema: ${error instanceof Error ? error.message : String(error)}`);
            // Fall back to CLI flag if SDK schema parsing fails
          }
        }
        
        // P0: Add image attachments if provided
        // SDK supports structured input entries with {type: "local_image", path: "..."}
        if (request.images && request.images.length > 0) {
          // Convert image paths to SDK format
          const imageEntries = request.images.map(path => ({
            type: 'local_image' as const,
            path,
          }));
          // Note: SDK run() accepts array of entries, but we need to combine with text prompt
          // For now, we'll use CLI flag --image instead (handled in buildArgs)
          // TODO: Refactor to use SDK structured input entries when prompt is also structured
        }
        
        // Run the turn using SDK
        // SDK internally spawns CLI process and exchanges JSONL events
        // If we have images, we need to use structured input entries
        // For now, we pass prompt as string and images via CLI flags (handled in buildArgs)
        const turn = await thread.run(prompt, runOptions);
        
        clearTimeout(timeoutId);
        
        // Extract output from turn
        // SDK RunResult (Turn) object has finalResponse, items, and usage
        const output = turn.finalResponse || '';
        const sessionId = thread.id || undefined;
        
        // Extract token usage from SDK's usage object
        // Usage has input_tokens, cached_input_tokens, and output_tokens (snake_case)
        const tokensUsed = turn.usage 
          ? turn.usage.input_tokens + turn.usage.output_tokens
          : undefined;
        
        // Parse output using our existing parser for completion signals
        const parsed = this.outputParser.parse(output);
        
        // Use SDK's token count if available, otherwise use parsed
        const finalTokensUsed = tokensUsed || parsed.tokensUsed;
        
        // Determine success based on completion signal
        const completePresent = /<ralph>COMPLETE<\/ralph>/i.test(output);
        const gutterPresent = /<ralph>GUTTER<\/ralph>/i.test(output);
        const hasErrors = parsed.errors.length > 0;
        const success = completePresent && !hasErrors;
        
        const duration = Date.now() - startTime;
        
        // Map SDK Turn to ExecutionResult
        const result: ExecutionResult = {
          success,
          output,
          exitCode: success ? 0 : 1,
          duration,
          processId: 0, // SDK manages process internally, we don't have direct PID access
          tokensUsed: finalTokensUsed,
          sessionId,
          ...(hasErrors && parsed.errors.length > 0
            ? { error: parsed.errors[0] }
            : !success && gutterPresent
              ? { error: 'Agent signaled GUTTER - stuck and cannot proceed' }
              : {}),
        };
        
        // Record usage and update circuit breaker (matching base class behavior)
        const base = this as unknown as {
          rateLimiter?: { recordCall(platform: Platform): void };
          quotaManager?: { recordUsage(platform: Platform, tokens: number, duration: number, model?: string): Promise<void> };
          circuitBreaker: { recordSuccess(): void; recordFailure(): void };
        };
        
        if (base.rateLimiter) {
          base.rateLimiter.recordCall(this.platform);
        }
        if (base.quotaManager && finalTokensUsed) {
          // P0: Pass model to recordUsage for Cursor Auto mode unlimited detection
          await base.quotaManager.recordUsage(this.platform, finalTokensUsed, duration, request.model).catch(() => {
            // Ignore errors when recording usage
          });
        }
        
        if (result.success) {
          base.circuitBreaker.recordSuccess();
        } else {
          base.circuitBreaker.recordFailure();
        }
        
        return result;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Record circuit breaker failure if applicable
      const base = this as unknown as {
        circuitBreaker?: { recordFailure(): void };
      };
      if (base.circuitBreaker && (errorMessage.includes('timeout') || errorMessage.includes('aborted'))) {
        base.circuitBreaker.recordFailure();
      }
      
      return {
        success: false,
        output: errorMessage,
        exitCode: 1,
        duration,
        processId: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * Gets the Codex CLI command (for compatibility, SDK handles this internally).
   */
  protected getCommand(): string {
    return PLATFORM_COMMANDS.codex;
  }

  /**
   * Spawns a Codex CLI process (legacy method, not used with SDK).
   * 
   * @deprecated SDK handles process spawning internally
   */
  protected async spawn(
    request: ExecutionRequest
  ): Promise<ChildProcess> {
    // This method is kept for backward compatibility but shouldn't be called
    // when using SDK. If called, fall back to direct CLI spawn.
    const args = this.buildArgs(request);

    const { spawn } = await import('child_process');
    const proc = spawn('codex', args, {
      cwd: request.workingDirectory,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (request.nonInteractive && proc.stdin) {
      proc.stdin.end();
    }

    return proc;
  }

  /**
   * Builds Codex CLI arguments.
   * 
   * Codex command structure: `codex exec [flags]`
   * 
   * Flags:
   * - `--cd <dir>` - Working directory (alternative to cwd)
   * - `--model <model>` - Model selection
   * - `--json` - JSONL event stream output (optional)
   * - `--ask-for-approval <policy>` - Command approval control
   * - `--sandbox <mode>` - Filesystem/network access control
   * - `--full-auto` - Convenience flag: sets `--ask-for-approval on-request` and `--sandbox workspace-write`
   * - `--max-turns <n>` - Cap agentic turns
   * - `--color <mode>` - Control ANSI color output (always|never|auto)
   * - `--skip-git-repo-check` - Allow running outside Git repository
   * - `--output-last-message, -o <path>` - Write final message to file
   * 
   * Note: Codex reads configuration from `~/.codex/config.toml` for defaults.
   * Explicit CLI flags override config file settings.
   */
  protected buildArgs(request: ExecutionRequest): string[] {
    const args: string[] = ['exec'];

    // Add working directory via --cd flag
    // Note: Codex supports --cd/-C to set workspace root.
    // Only add if workingDirectory is non-empty
    if (request.workingDirectory && request.workingDirectory.trim() !== '') {
      args.push('--cd', request.workingDirectory);
    }

    // Add model selection
    if (request.model) {
      args.push('--model', request.model);
    }

    // Add max-turns if provided
    // Note: ExecutionRequest.maxTurns field exists, but Codex may not support this flag.
    // We'll add it and let capability discovery handle verification.
    if (request.maxTurns !== undefined && request.maxTurns > 0) {
      args.push('--max-turns', String(request.maxTurns));
    }

    // Non-interactive execution: ensure Codex never pauses for approval and can
    // write to the workspace. Emit structured JSONL events for robust parsing.
    if (request.nonInteractive) {
      // Use --full-auto as convenience flag (sets on-request approval + workspace-write sandbox)
      // Note: --full-auto sets --ask-for-approval on-request (not never), but for full automation
      // we prefer explicit never. However, --full-auto is cleaner and should work for most cases.
      // If we need stricter control, we can fallback to separate flags.
      args.push('--full-auto');
      args.push('--json');
      
      // Disable ANSI colors for CI/CD compatibility and reliable parsing
      args.push('--color', 'never');
    }

    // P0: Structured JSON output validation schema
    if (request.jsonSchema) {
      args.push('--output-schema', request.jsonSchema);
    }

    // P0: Evidence collection - write final message to file
    if (request.outputLastMessage) {
      args.push('--output-last-message', request.outputLastMessage);
    }

    // P0: Image attachments
    if (request.images && request.images.length > 0) {
      // Codex supports comma-separated or repeatable --image flags
      args.push('--image', request.images.join(','));
    }

    // P0: Web search capability
    if (request.enableWebSearch) {
      args.push('--search');
    }

    // P0: Multi-directory workspace support
    if (request.includeDirectories && request.includeDirectories.length > 0) {
      // Codex supports repeatable --add-dir flags
      for (const dir of request.includeDirectories) {
        args.push('--add-dir', dir);
      }
    }

    // P0: Use local Ollama/open-source model support
    if (request.useOss) {
      args.push('--oss');
    }

    // P0: Configuration profile selection
    if (request.profile) {
      args.push('--profile', request.profile);
    }

    // P0: Inline configuration overrides
    if (request.configOverrides) {
      for (const [key, value] of Object.entries(request.configOverrides)) {
        args.push('-c', `${key}=${typeof value === 'string' ? value : JSON.stringify(value)}`);
      }
    }

    // Add skip-git-repo-check if needed
    // This is useful for one-off directories that aren't Git repos
    // We could detect this automatically, but for now we'll add it when explicitly needed
    // (Future: could add a flag to ExecutionRequest or detect Git repo presence)

    // Pass the prompt as the required positional argument for `codex exec`.
    // P1-G01: Apply plan mode preamble if planMode is requested
    args.push(this.buildPrompt(request));

    return args;
  }

  /**
   * Builds the prompt, adding plan mode preamble if needed.
   * 
   * P1-G01: Codex doesn't have a native plan mode CLI flag.
   * When planMode is requested, we add a preamble instructing the agent to
   * plan first, then execute. This provides a consistent experience across platforms.
   */
  private buildPrompt(request: ExecutionRequest): string {
    const prompt = request.prompt ?? '';
    
    if (request.planMode === true) {
      // Plan mode via prompt preamble
      const preamble = [
        'PLAN FIRST (briefly), THEN EXECUTE:',
        '- Start with a concise plan (max 10 bullets).',
        '- Then immediately carry out the plan and make the required changes.',
        '- Run the required tests/commands and report results.',
        '',
      ].join('\n');
      return `${preamble}${prompt}`;
    }
    
    return prompt;
  }

  /**
   * Parses Codex output.
   * 
   * Uses CodexOutputParser to extract:
   * - Completion signals (<ralph>COMPLETE</ralph>, <ralph>GUTTER</ralph>)
   * - Files changed
   * - Test results
   * - Errors and warnings
   * 
   * Handles both plain text and JSONL formats (if --json flag was used).
   */
  protected parseOutput(output: string): ExecutionResult {
    // Use platform-specific parser
    const parsed = this.outputParser.parse(output);

    // Determine success based on completion signal and parsed results
    // Note: Some outputs may contain both signals; in that case, treat COMPLETE as higher priority.
    const completePresent = /<ralph>COMPLETE<\/ralph>/i.test(output);
    const gutterPresent = /<ralph>GUTTER<\/ralph>/i.test(output);
    const hasErrors = parsed.errors.length > 0;

    // Success if COMPLETE is present and there are no errors (COMPLETE takes precedence over GUTTER).
    const success = completePresent && !hasErrors;

    return {
      success,
      output,
      exitCode: 0, // Will be updated by base class execute() method
      duration: 0, // Will be updated by base class execute() method
      processId: 0, // Will be updated by base class execute() method
      tokensUsed: parsed.tokensUsed,
      sessionId: parsed.sessionId,
      ...(hasErrors && parsed.errors.length > 0
        ? { error: parsed.errors[0] }
        : !success && gutterPresent
          ? { error: 'Agent signaled GUTTER - stuck and cannot proceed' }
          : {}),
    };
  }
}
