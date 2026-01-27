/**
 * Usage Command for RWM Puppet Master
 * 
 * Shows current usage/quota status for platforms.
 * 
 * Per platform_integration_gap_analysis plan P1 features.
 */

import { Command } from 'commander';
import type { CommandModule } from './index.js';
import { QuotaManager } from '../../platforms/quota-manager.js';
import { UsageTracker } from '../../memory/usage-tracker.js';
import { ConfigManager } from '../../config/config-manager.js';
import type { Platform } from '../../types/config.js';

/**
 * Format quota info for display
 */
function formatQuotaInfo(platform: Platform, quotaInfo: { remaining: number; limit: number; resetsAt: string; period: string }): string {
  const percentage = quotaInfo.limit > 0 ? ((quotaInfo.limit - quotaInfo.remaining) / quotaInfo.limit * 100).toFixed(1) : '0';
  const used = quotaInfo.limit - quotaInfo.remaining;
  return `${platform.padEnd(10)} ${used.toString().padStart(6)}/${quotaInfo.limit.toString().padStart(6)} (${percentage.padStart(5)}%) - Resets: ${quotaInfo.resetsAt} (${quotaInfo.period})`;
}

/**
 * Usage command implementation
 */
export class UsageCommand implements CommandModule {
  register(program: Command): void {
    program
      .command('usage')
      .description('Show current usage/quota status for platforms')
      .argument('[platform]', 'Platform to check (cursor, codex, claude, gemini, copilot)', undefined)
      .option('--json', 'Output as JSON')
      .action(async (platform?: string, options?: { json?: boolean }) => {
        try {
          const configManager = new ConfigManager();
          const config = await configManager.load();
          
          const usageTracker = new UsageTracker();
          const quotaManager = new QuotaManager(
            usageTracker,
            config.budgets,
            config.budgetEnforcement
          );

          const platforms: Platform[] = platform 
            ? [platform as Platform].filter((p): p is Platform => ['cursor', 'codex', 'claude', 'gemini', 'copilot'].includes(p))
            : ['cursor', 'codex', 'claude', 'gemini', 'copilot'] as Platform[];

          if (platform && !platforms.includes(platform as Platform)) {
            console.error(`Error: Invalid platform '${platform}'. Valid platforms: cursor, codex, claude, gemini, copilot`);
            process.exit(1);
          }

          const results: Record<string, { remaining: number; limit: number; resetsAt: string; period: string; platformReported?: unknown } | { error: string }> = {};

          for (const p of platforms) {
            try {
              // Try to get platform-reported usage first
              const platformUsage = await quotaManager.getPlatformUsage(p);
              
              // Then check quota (which will merge platform-reported usage with internal tracking)
              const quotaInfo = await quotaManager.checkQuota(p);
              
              // If platform-reported usage is available, include it in results
              if (platformUsage) {
                results[p] = {
                  ...quotaInfo,
                  platformReported: {
                    source: platformUsage.source,
                    currentUsage: platformUsage.currentUsage,
                    limit: platformUsage.limit,
                    remaining: platformUsage.remaining,
                    resetsAt: platformUsage.resetsAt,
                    period: platformUsage.period,
                    tokens: platformUsage.tokens,
                  },
                };
              } else {
                results[p] = quotaInfo;
              }
            } catch (error) {
              results[p] = {
                error: error instanceof Error ? error.message : String(error),
              };
            }
          }

          if (options?.json) {
            console.log(JSON.stringify(results, null, 2));
          } else {
            console.log('\nPlatform Usage/Quota Status:');
            console.log('='.repeat(80));
            console.log('Platform   Used/Limit   Percentage   Reset Time');
            console.log('-'.repeat(80));
            
            for (const [p, result] of Object.entries(results)) {
              if ('error' in result) {
                console.log(`${p.padEnd(10)} ERROR: ${result.error}`);
              } else {
                console.log(formatQuotaInfo(p as Platform, result));
              }
            }
            console.log('='.repeat(80));
          }
        } catch (error) {
          console.error('Error:', error instanceof Error ? error.message : String(error));
          process.exit(1);
        }
      });
  }
}
