/**
 * Models command - List available platform models
 *
 * Implements `puppet-master models`:
 * - Query each platform for available models
 * - Show cached model information
 * - Support filtering by platform
 *
 * Feature parity with GUI GET /api/config/models endpoint.
 */

import { Command } from 'commander';
import type { Platform } from '../../types/config.js';
import { CapabilityDiscoveryService } from '../../platforms/capability-discovery.js';
import type { CommandModule } from './index.js';

export interface ModelsOptions {
  platform?: string;
  refresh?: boolean;
  json?: boolean;
}

const PLATFORMS: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];

/**
 * Main models action
 */
export async function modelsAction(options: ModelsOptions): Promise<void> {
  try {
    const capabilityService = new CapabilityDiscoveryService();

    // Determine which platforms to query
    let platformsToQuery: Platform[];
    if (options.platform) {
      const normalizedPlatform = options.platform.toLowerCase() as Platform;
      if (!PLATFORMS.includes(normalizedPlatform)) {
        console.error(`Invalid platform: ${options.platform}`);
        console.error(`Valid platforms: ${PLATFORMS.join(', ')}`);
        process.exit(1);
      }
      platformsToQuery = [normalizedPlatform];
    } else {
      platformsToQuery = PLATFORMS;
    }

    const results: Record<string, { models: string[]; cached: boolean; error?: string }> = {};

    for (const platform of platformsToQuery) {
      try {
        // Use discoverModels for model listing
        if (options.refresh) {
          // Force refresh: run probe first, then get models
          await capabilityService.refresh(platform);
        }
        
        const models = await capabilityService.discoverModels(platform);
        
        results[platform] = {
          models,
          cached: !options.refresh,
        };
      } catch (error) {
        results[platform] = {
          models: [],
          cached: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    // Human-readable output
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              Available Platform Models                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log();

    for (const [platform, info] of Object.entries(results)) {
      const cacheIndicator = info.cached ? ' (cached)' : '';
      console.log(`${platform.toUpperCase()}${cacheIndicator}:`);
      console.log('-'.repeat(40));

      if (info.error) {
        console.log(`  ❌ Error: ${info.error}`);
      } else if (info.models.length === 0) {
        console.log('  No models discovered');
        console.log('  (Platform may not support model listing or CLI not installed)');
      } else {
        for (const model of info.models) {
          console.log(`  • ${model}`);
        }
      }
      console.log();
    }

    if (!options.refresh) {
      console.log('Tip: Use --refresh to fetch fresh model lists from platforms.');
    }
  } catch (error) {
    console.error('Error listing models:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export class ModelsCommand implements CommandModule {
  register(program: Command): void {
    program
      .command('models')
      .description('List available platform models')
      .option('-p, --platform <platform>', 'Filter by platform (cursor, codex, claude, gemini, copilot)')
      .option('--refresh', 'Force refresh (bypass cache)')
      .option('--json', 'Output as JSON')
      .action(async (opts) => {
        await modelsAction({
          platform: opts.platform,
          refresh: opts.refresh,
          json: opts.json,
        });
      });
  }
}

export const modelsCommand = new ModelsCommand();
