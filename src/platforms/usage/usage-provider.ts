/**
 * Unified Usage Provider
 * 
 * Aggregates usage data from multiple sources:
 * - Platform APIs (Claude Admin API, GitHub Copilot Metrics API, Gemini Cloud Quotas API)
 * - Error message parsing
 * - CLI command parsing
 * 
 * Provides a single interface for retrieving platform-reported usage data.
 */

import type { Platform } from '../../types/config.js';
import type { PlatformUsageInfo, PlanInfo, ErrorParseResult, CliParseResult } from './types.js';
import { ClaudeUsageApiClient } from './api-clients/claude-api.js';
import { CopilotUsageApiClient } from './api-clients/copilot-api.js';
import { GeminiUsageApiClient } from './api-clients/gemini-api.js';
import { CodexErrorParser } from './error-parsers/codex-parser.js';
import { GeminiErrorParser } from './error-parsers/gemini-parser.js';
import { ClaudeErrorParser } from './error-parsers/claude-parser.js';
import { CodexStatusParser } from './cli-parsers/codex-status-parser.js';
import { ClaudeCostParser } from './cli-parsers/claude-cost-parser.js';
import { ClaudeStatsParser } from './cli-parsers/claude-stats-parser.js';
import { GeminiStatsParser } from './cli-parsers/gemini-stats-parser.js';
import { PlanDetectionService } from './plan-detection.js';

/**
 * Unified usage provider that aggregates data from all sources
 */
export class UsageProvider {
  private claudeApi: ClaudeUsageApiClient;
  private copilotApi: CopilotUsageApiClient;
  private geminiApi: GeminiUsageApiClient;
  private codexErrorParser: CodexErrorParser;
  private geminiErrorParser: GeminiErrorParser;
  private claudeErrorParser: ClaudeErrorParser;
  private codexStatusParser: CodexStatusParser;
  private claudeCostParser: ClaudeCostParser;
  private claudeStatsParser: ClaudeStatsParser;
  private geminiStatsParser: GeminiStatsParser;
  private planDetection: PlanDetectionService;

  constructor(options?: {
    claudeApiKey?: string;
    copilotToken?: string;
    geminiProjectId?: string;
    geminiCredentialsPath?: string;
  }) {
    this.claudeApi = new ClaudeUsageApiClient(options?.claudeApiKey);
    this.copilotApi = new CopilotUsageApiClient(options?.copilotToken);
    this.geminiApi = new GeminiUsageApiClient(options?.geminiProjectId, options?.geminiCredentialsPath);
    this.codexErrorParser = new CodexErrorParser();
    this.geminiErrorParser = new GeminiErrorParser();
    this.claudeErrorParser = new ClaudeErrorParser();
    this.codexStatusParser = new CodexStatusParser();
    this.claudeCostParser = new ClaudeCostParser();
    this.claudeStatsParser = new ClaudeStatsParser();
    this.geminiStatsParser = new GeminiStatsParser();
    this.planDetection = new PlanDetectionService(this);
  }

  /**
   * Gets platform-reported usage information
   * 
   * Tries multiple sources in order of preference:
   * 1. Platform APIs (most reliable)
   * 2. Error message parsing (when errors occur)
   * 3. CLI command parsing (fallback)
   * 
   * @param platform - Platform to get usage for
   * @param options - Optional context (error message, CLI output, etc.)
   * @returns Platform usage info or null if not available
   */
  async getUsage(
    platform: Platform,
    options?: {
      errorMessage?: string;
      cliOutput?: string;
      cliCommand?: string;
      organizationId?: string; // For Claude/Copilot
      org?: string; // For Copilot
      location?: string; // For Gemini
    }
  ): Promise<PlatformUsageInfo | null> {
    // Try API first (most reliable)
    const apiUsage = await this.getApiUsage(platform, options);
    if (apiUsage) {
      return apiUsage;
    }

    // Try error parsing if error message provided
    if (options?.errorMessage) {
      const errorUsage = this.parseError(platform, options.errorMessage);
      if (errorUsage?.found && errorUsage.usageInfo) {
        return errorUsage.usageInfo;
      }
    }

    // Try CLI parsing if CLI output provided
    if (options?.cliOutput) {
      const cliUsage = this.parseCli(platform, options.cliOutput, options.cliCommand);
      if (cliUsage?.success && cliUsage.usageInfo) {
        return cliUsage.usageInfo;
      }
    }

    return null;
  }

  /**
   * Gets usage from platform APIs
   */
  private async getApiUsage(
    platform: Platform,
    options?: {
      organizationId?: string;
      org?: string;
      location?: string;
    }
  ): Promise<PlatformUsageInfo | null> {
    switch (platform) {
      case 'claude':
        return await this.claudeApi.fetchUsageReport(options?.organizationId);
      case 'copilot':
        if (!options?.org) {
          return null;
        }
        return await this.copilotApi.fetchMetrics(options.org);
      case 'gemini':
        return await this.geminiApi.fetchQuotas(options?.location);
      case 'codex':
      case 'cursor':
        // No APIs available
        return null;
    }
  }

  /**
   * Parses error message for usage information
   */
  parseError(platform: Platform, errorMessage: string, context?: { statusCode?: number; retryAfter?: string }): ErrorParseResult {
    switch (platform) {
      case 'codex':
        return this.codexErrorParser.parse(errorMessage);
      case 'gemini':
        return this.geminiErrorParser.parse(errorMessage);
      case 'claude':
        return this.claudeErrorParser.parse(errorMessage, context);
      case 'copilot':
      case 'cursor':
        // Error parsers not yet implemented
        return { found: false, errorMessage };
    }
  }

  /**
   * Parses CLI command output for usage information
   */
  parseCli(platform: Platform, output: string, command?: string): CliParseResult {
    switch (platform) {
      case 'codex':
        if (command === '/status' || output.includes('Input tokens') || output.includes('Output tokens')) {
          return this.codexStatusParser.parse(output);
        }
        break;
      case 'claude':
        if (command === '/cost' || output.includes('API Token Usage')) {
          return this.claudeCostParser.parse(output);
        }
        if (command === '/stats' || output.includes('Usage Statistics')) {
          return this.claudeStatsParser.parse(output);
        }
        break;
      case 'gemini':
        if (command === '/stats' || output.includes('Usage Statistics')) {
          return this.geminiStatsParser.parse(output);
        }
        break;
      case 'copilot':
      case 'cursor':
        // CLI parsers not yet implemented
        break;
    }

    return {
      success: false,
      rawOutput: output,
    };
  }

  /**
   * Detects plan/subscription information
   * 
   * Delegates to PlanDetectionService for unified plan detection across all platforms.
   */
  async detectPlan(
    platform: Platform,
    options?: {
      organizationId?: string;
      org?: string;
      location?: string;
      manualConfig?: {
        tier?: string;
        customerType?: string;
        subscriptionType?: string;
      };
    }
  ): Promise<PlanInfo | null> {
    return await this.planDetection.detectPlan(platform, options);
  }

  /**
   * Detects plans for all platforms in parallel
   */
  async detectAllPlans(options?: {
    claude?: { organizationId?: string };
    copilot?: { org?: string };
    gemini?: { location?: string };
    codex?: { manualConfig?: { tier?: string; customerType?: string; subscriptionType?: string } };
    cursor?: { manualConfig?: { tier?: string; customerType?: string; subscriptionType?: string } };
  }): Promise<Map<Platform, PlanInfo | null>> {
    return await this.planDetection.detectAllPlans(options);
  }
}
