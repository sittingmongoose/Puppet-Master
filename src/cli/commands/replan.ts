/**
 * Replan command - Regenerate plans for failed items
 * 
 * Implements the `puppet-master replan` command that:
 * - Replans a specific item by ID
 * - Replans all failed items with --failed flag
 * - Archives old PRD state before changes
 * - Validates the updated PRD structure
 */

import { Command } from 'commander';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { ConfigManager } from '../../config/config-manager.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { ValidationGate } from '../../start-chain/validation-gate.js';
import type { PRD, Phase, Task, Subtask, ItemStatus } from '../../types/prd.js';
import type { CommandModule } from './index.js';

/**
 * Options for the replan command
 */
export interface ReplanOptions {
  itemId?: string;
  failed?: boolean;
  keepOriginal?: boolean;
  validate?: boolean;
  config?: string;
}

/**
 * Archive directory name (relative to PRD file location)
 */
const ARCHIVE_DIR = 'archive';

/**
 * Format timestamp for archive filename
 */
function formatArchiveTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

/**
 * Archive current PRD
 */
async function archivePrd(prdPath: string, outputDir: string): Promise<string> {
  const archiveDir = join(outputDir, ARCHIVE_DIR);
  
  // Create archive directory if it doesn't exist
  if (!existsSync(archiveDir)) {
    await fs.mkdir(archiveDir, { recursive: true });
  }
  
  // Read current PRD
  const prdContent = await fs.readFile(prdPath, 'utf-8');
  
  // Create timestamped archive filename
  const timestamp = formatArchiveTimestamp();
  const archivePath = join(archiveDir, `prd-${timestamp}.json`);
  
  // Write archive copy
  await fs.writeFile(archivePath, prdContent, 'utf-8');
  
  return archivePath;
}

/**
 * Find all failed items in PRD
 */
function findAllFailedItems(prd: PRD): Array<{ item: Phase | Task | Subtask; type: 'phase' | 'task' | 'subtask' }> {
  const failedItems: Array<{ item: Phase | Task | Subtask; type: 'phase' | 'task' | 'subtask' }> = [];
  
  for (const phase of prd.phases) {
    if (phase.status === 'failed') {
      failedItems.push({ item: phase, type: 'phase' });
    }
    
    for (const task of phase.tasks) {
      if (task.status === 'failed') {
        failedItems.push({ item: task, type: 'task' });
      }
      
      for (const subtask of task.subtasks) {
        if (subtask.status === 'failed') {
          failedItems.push({ item: subtask, type: 'subtask' });
        }
      }
    }
  }
  
  return failedItems;
}

/**
 * Reset an item to pending status
 */
function resetItem(item: Phase | Task | Subtask, type: 'phase' | 'task' | 'subtask'): void {
  item.status = 'pending' as ItemStatus;
  item.startedAt = undefined;
  item.completedAt = undefined;
  item.evidence = undefined;
  
  if ('gateReport' in item) {
    item.gateReport = undefined;
  }
  
  // For subtasks, clear iterations
  if (type === 'subtask' && 'iterations' in item) {
    item.iterations = [];
  }
}

/**
 * Main replan command action
 */
export async function replanAction(options: ReplanOptions): Promise<void> {
  try {
    // Validate options
    if (!options.itemId && !options.failed) {
      throw new Error('Either --item-id or --failed must be specified');
    }
    
    if (options.itemId && options.failed) {
      throw new Error('Cannot specify both --item-id and --failed');
    }
    
    const keepOriginal = options.keepOriginal ?? true;
    const validate = options.validate ?? true;
    
    // Load config
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();
    
    // Determine output directory from config or default
    const outputDir = config.memory?.prdFile 
      ? dirname(config.memory.prdFile)
      : '.puppet-master';
    const prdPath = config.memory?.prdFile || '.puppet-master/prd.json';
    
    // Load PRD
    const prdManager = new PrdManager(prdPath);
    const prd = await prdManager.load();
    
    // Find items to replan
    const itemsToReplan: Array<{ item: Phase | Task | Subtask; type: 'phase' | 'task' | 'subtask' }> = [];
    
    if (options.itemId) {
      // Find specific item by ID in the loaded PRD
      let item: Phase | Task | Subtask | null = null;
      let type: 'phase' | 'task' | 'subtask';
      
      // Determine type from ID format
      if (options.itemId.startsWith('PH-')) {
        type = 'phase';
        item = prd.phases.find(p => p.id === options.itemId) || null;
      } else if (options.itemId.startsWith('TK-')) {
        type = 'task';
        for (const phase of prd.phases) {
          const task = phase.tasks.find(t => t.id === options.itemId);
          if (task) {
            item = task;
            break;
          }
        }
      } else if (options.itemId.startsWith('ST-')) {
        type = 'subtask';
        for (const phase of prd.phases) {
          for (const task of phase.tasks) {
            const subtask = task.subtasks.find(s => s.id === options.itemId);
            if (subtask) {
              item = subtask;
              break;
            }
          }
          if (item) break;
        }
      } else {
        throw new Error(`Invalid item ID format: ${options.itemId}`);
      }
      
      if (!item) {
        throw new Error(`Item not found: ${options.itemId}`);
      }
      
      itemsToReplan.push({ item, type });
    } else if (options.failed) {
      // Find all failed items
      const failedItems = findAllFailedItems(prd);
      if (failedItems.length === 0) {
        console.warn('No failed items found to replan');
        return;
      }
      itemsToReplan.push(...failedItems);
    }
    
    // Archive current PRD if requested
    if (keepOriginal) {
      const archivePath = await archivePrd(prdPath, outputDir);
      console.log(`Archived current PRD to: ${archivePath}`);
    }
    
    // Reset all items to replan
    for (const { item, type } of itemsToReplan) {
      resetItem(item, type);
    }
    
    // Validate updated PRD if requested
    if (validate) {
      console.log('Validating updated PRD...');
      const validationGate = new ValidationGate();
      const validationResult = validationGate.validatePrd(prd);
      
      if (validationResult.errors.length > 0) {
        console.error('\nValidation Errors:');
        for (const error of validationResult.errors) {
          console.error(`  [${error.code}] ${error.message}`);
          if (error.path) {
            console.error(`    Path: ${error.path}`);
          }
          if (error.suggestion) {
            console.error(`    Suggestion: ${error.suggestion}`);
          }
        }
        throw new Error(
          `Validation failed with ${validationResult.errors.length} error(s). ` +
          `Please fix the issues above before proceeding.`
        );
      }
      
      if (validationResult.warnings.length > 0) {
        console.warn('\nValidation Warnings:');
        for (const warning of validationResult.warnings) {
          console.warn(`  [${warning.code}] ${warning.message}`);
          if (warning.suggestion) {
            console.warn(`    Suggestion: ${warning.suggestion}`);
          }
        }
      }
      
      console.log('✓ Validation passed');
    }
    
    // Save updated PRD
    await prdManager.save(prd);
    
    // Display summary
    console.log('\n=== Replan Summary ===');
    console.log(`Items replanned: ${itemsToReplan.length}`);
    for (const { item, type } of itemsToReplan) {
      console.log(`  - ${item.id} (${type}): ${item.title}`);
    }
    console.log('\n✓ Replan complete!');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error during replan:', errorMessage);
    throw error;
  }
}

/**
 * ReplanCommand class implementing CommandModule interface
 */
export class ReplanCommand implements CommandModule {
  /**
   * Register the replan command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('replan')
      .description('Regenerate plans for failed items or a specific item')
      .argument('[item-id]', 'Item ID to replan (PH-XXX, TK-XXX-XXX, or ST-XXX-XXX-XXX)')
      .option('-f, --failed', 'Replan all failed items')
      .option('--no-keep-original', 'Do not archive old PRD before replanning')
      .option('--no-validate', 'Skip validation of updated PRD')
      .option('-c, --config <path>', 'Path to config file')
      .action(async (itemId: string | undefined, options: Omit<ReplanOptions, 'itemId'>) => {
        // If itemId is provided, use it; otherwise rely on --failed flag
        await replanAction({
          itemId: itemId || undefined,
          ...options,
        });
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const replanCommand = new ReplanCommand();
