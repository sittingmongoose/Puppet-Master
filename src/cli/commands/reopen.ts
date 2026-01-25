/**
 * Reopen command - Reopen a completed item (passed/failed/skipped)
 * 
 * Implements the `puppet-master reopen <item-id>` command that:
 * - Reopens items that were previously completed (passed/failed/skipped)
 * - Confirms before reopening passed items (unless --yes flag)
 * - Resets iteration count for subtasks
 * - Optionally clears evidence files
 */

import { Command } from 'commander';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { promises as fs } from 'fs';
import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { EvidenceStore } from '../../memory/evidence-store.js';
import type { CommandModule } from './index.js';
import type { Phase, Task, Subtask } from '../../types/prd.js';

/**
 * Options for the reopen command
 */
export interface ReopenOptions {
  config?: string;
  clearEvidence?: boolean;
  yes?: boolean;
}

/**
 * Prompt user for confirmation when reopening a passed item
 */
async function confirmReopen(itemId: string, title: string): Promise<boolean> {
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(
      `Item ${itemId} (${title}) is passed. Reopen? (y/N): `
    );
    const normalized = answer.trim().toLowerCase();
    return normalized === 'y' || normalized === 'yes';
  } finally {
    rl.close();
  }
}

/**
 * Clear evidence files for an item
 */
async function clearEvidenceFiles(
  evidenceStore: EvidenceStore,
  itemId: string
): Promise<void> {
  try {
    const evidence = await evidenceStore.getEvidence(itemId);
    
    for (const item of evidence) {
      try {
        await fs.unlink(item.path);
      } catch (error) {
        // Log warning but continue with other files
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`Warning: Failed to delete evidence file ${item.path}: ${errorMessage}`);
      }
    }
    
    if (evidence.length > 0) {
      console.log(`Cleared ${evidence.length} evidence file(s) for ${itemId}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`Warning: Failed to clear evidence for ${itemId}: ${errorMessage}`);
  }
}

/**
 * Reset iterations for a subtask
 */
function resetIterations(subtask: Subtask): void {
  subtask.iterations = [];
}

/**
 * Validate that an item can be reopened
 */
function validateReopenableStatus(status: string): void {
  const reopenableStatuses = ['passed', 'failed', 'skipped', 'reopened'];
  
  if (!reopenableStatuses.includes(status)) {
    throw new Error(
      `Cannot reopen item with status '${status}'. ` +
      `Only items with status 'passed', 'failed', 'skipped', or 'reopened' can be reopened.`
    );
  }
}

/**
 * Get item title for display
 */
function getItemTitle(item: Phase | Task | Subtask): string {
  return item.title || item.id;
}

/**
 * Main action function for the reopen command
 */
export async function reopenAction(
  itemId: string,
  options: ReopenOptions
): Promise<void> {
  try {
    // Load configuration
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    // Load PRD
    const prdManager = new PrdManager(config.memory.prdFile);
    
    // Find item by ID
    const item = await prdManager.findItem(itemId);
    
    if (!item) {
      console.error(`Error: Item not found: ${itemId}`);
      process.exit(1);
      return;
    }

    // Validate item status
    try {
      validateReopenableStatus(item.status);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${errorMessage}`);
      process.exit(1);
      return;
    }

    // Confirm if item is passed (unless --yes flag)
    if (item.status === 'passed' && !options.yes) {
      const confirmed = await confirmReopen(itemId, getItemTitle(item));
      if (!confirmed) {
        console.log('Reopen cancelled.');
        process.exit(0);
        return;
      }
    }

    // Load PRD to work with the structure directly
    const prd = await prdManager.load();
    
    // Find item in PRD hierarchy to modify it directly
    let itemToModify: Phase | Task | Subtask | null = null;
    
    // Parse item ID to determine type
    if (itemId.startsWith('PH-')) {
      itemToModify = prd.phases.find(p => p.id === itemId) || null;
    } else if (itemId.startsWith('TK-')) {
      for (const phase of prd.phases) {
        const task = phase.tasks.find(t => t.id === itemId);
        if (task) {
          itemToModify = task;
          break;
        }
      }
    } else if (itemId.startsWith('ST-')) {
      for (const phase of prd.phases) {
        for (const task of phase.tasks) {
          const subtask = task.subtasks.find(s => s.id === itemId);
          if (subtask) {
            itemToModify = subtask;
            break;
          }
        }
        if (itemToModify) break;
      }
    }
    
    if (!itemToModify) {
      console.error(`Error: Item not found in PRD: ${itemId}`);
      process.exit(1);
      return;
    }
    
    // Reopen the item: update status, notes, and clear completedAt
    itemToModify.status = 'reopened';
    itemToModify.notes = `${itemToModify.notes}\n\nReopened: Reopened via CLI command`;
    itemToModify.completedAt = undefined;
    
    // Reset iterations for subtasks
    if ('iterations' in itemToModify) {
      resetIterations(itemToModify as Subtask);
    }
    
    // Save PRD
    await prdManager.save(prd);

    // Clear evidence if requested
    if (options.clearEvidence) {
      const evidenceStore = new EvidenceStore(config.verification.evidenceDirectory);
      await clearEvidenceFiles(evidenceStore, itemId);
    }

    // Display confirmation
    console.log(`Item ${itemId} (${getItemTitle(item)}) has been reopened.`);
    if (options.clearEvidence) {
      console.log('Evidence files have been cleared.');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error reopening item:', errorMessage);
    process.exit(1);
    return;
  }
}

/**
 * ReopenCommand class implementing CommandModule interface
 */
export class ReopenCommand implements CommandModule {
  /**
   * Register the reopen command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('reopen <item-id>')
      .description('Reopen a completed item (passed/failed/skipped)')
      .option('-c, --config <path>', 'Path to config file')
      .option('--clear-evidence', 'Clear evidence files for the item')
      .option('-y, --yes', 'Skip confirmation for passed items')
      .action(async (itemId: string, options: ReopenOptions) => {
        await reopenAction(itemId, options);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const reopenCommand = new ReopenCommand();
