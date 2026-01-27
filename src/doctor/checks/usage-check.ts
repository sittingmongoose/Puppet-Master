/**
 * Usage/Quota Checks for RWM Puppet Master Doctor System
 * 
 * Checks platform usage/quota status and provides warnings when approaching limits.
 * 
 * Per platform_integration_gap_analysis plan P1 features.
 */

import type { CheckResult, DoctorCheck } from '../check-registry.js';
import { QuotaManager } from '../../platforms/quota-manager.js';
import { UsageTracker } from '../../memory/usage-tracker.js';
import { ConfigManager } from '../../config/config-manager.js';
import { UsageProvider } from '../../platforms/usage/usage-provider.js';
import type { Platform } from '../../types/config.js';

/**
 * Check for platform usage/quota status
 */
export class UsageQuotaCheck implements DoctorCheck {
  readonly name = 'usage-quota';
  readonly category = 'runtime' as const;
  readonly description = 'Check platform usage/quota status and warn when approaching limits';

  async run(): Promise<CheckResult> {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.load();
      
      const usageTracker = new UsageTracker();
      const usageProvider = new UsageProvider({
        claudeApiKey: process.env.ANTHROPIC_API_KEY,
        copilotToken: process.env.GITHUB_TOKEN || process.env.GH_TOKEN,
        geminiProjectId: process.env.GOOGLE_CLOUD_PROJECT,
        geminiCredentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
      const quotaManager = new QuotaManager(
        usageTracker,
        config.budgets,
        config.budgetEnforcement,
        undefined,
        80,
        100,
        usageProvider
      );

      const platforms: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];
      const results: Array<{ platform: Platform; quotaInfo: { remaining: number; limit: number; resetsAt: string; period: string } | null; error?: string }> = [];

      for (const platform of platforms) {
        try {
          const quotaInfo = await quotaManager.checkQuota(platform);
          results.push({ platform, quotaInfo });
        } catch (error) {
          results.push({
            platform,
            quotaInfo: null,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Check if any platform is at or near limits
      const warnings: string[] = [];
      const errors: string[] = [];
      
      for (const result of results) {
        if (result.error) {
          errors.push(`${result.platform}: ${result.error}`);
        } else if (result.quotaInfo) {
          const percentage = result.quotaInfo.limit > 0 
            ? ((result.quotaInfo.limit - result.quotaInfo.remaining) / result.quotaInfo.limit) * 100 
            : 0;
          
          if (percentage >= 100) {
            errors.push(`${result.platform}: Quota exhausted (${result.quotaInfo.remaining}/${result.quotaInfo.limit} remaining, resets at ${result.quotaInfo.resetsAt})`);
          } else if (percentage >= 80) {
            warnings.push(`${result.platform}: ${percentage.toFixed(1)}% quota used (${result.quotaInfo.remaining}/${result.quotaInfo.limit} remaining, resets at ${result.quotaInfo.resetsAt})`);
          }
        }
      }

      const passed = errors.length === 0;
      const hasWarnings = warnings.length > 0;

      return {
        name: this.name,
        category: this.category,
        passed,
        message: passed && !hasWarnings
          ? 'All platform quotas are healthy'
          : hasWarnings && passed
            ? `Warnings: ${warnings.join('; ')}`
            : `Errors: ${errors.join('; ')}`,
        details: results.map(r => {
          if (r.error) {
            return `${r.platform}: ERROR - ${r.error}`;
          } else if (r.quotaInfo) {
            const used = r.quotaInfo.limit - r.quotaInfo.remaining;
            return `${r.platform}: ${used}/${r.quotaInfo.limit} used (${r.quotaInfo.remaining} remaining, ${r.quotaInfo.period} period, resets at ${r.quotaInfo.resetsAt})`;
          }
          return `${r.platform}: Unknown`;
        }).join('\n'),
        durationMs: 0, // Will be set by CheckRegistry
      };
    } catch (error) {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Failed to check usage/quota: ${error instanceof Error ? error.message : String(error)}`,
        details: error instanceof Error ? error.stack : String(error),
        durationMs: 0,
      };
    }
  }
}
