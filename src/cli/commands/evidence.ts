/**
 * Evidence command - Browse/download verification evidence
 *
 * Implements `puppet-master evidence`:
 * - `evidence list`  : list evidence artifacts with optional filtering
 * - `evidence show`  : display a specific evidence file
 * - `evidence export`: export evidence to a directory
 *
 * Feature parity with GUI /api/evidence endpoints.
 */

import { Command } from 'commander';
import { promises as fs, existsSync } from 'fs';
import { join, basename, resolve } from 'path';
import { EvidenceStore } from '../../memory/evidence-store.js';
import type { EvidenceType, StoredEvidence } from '../../types/evidence.js';
import type { CommandModule } from './index.js';

export interface EvidenceListOptions {
  type?: string;
  tier?: string;
  dateFrom?: string;
  dateTo?: string;
  json?: boolean;
}

export interface EvidenceShowOptions {
  json?: boolean;
}

export interface EvidenceExportOptions {
  output: string;
  type?: string;
  tier?: string;
}

const VALID_TYPES: EvidenceType[] = ['log', 'screenshot', 'trace', 'snapshot', 'metric', 'gate-report'];

/**
 * List evidence artifacts
 */
export async function evidenceListAction(options: EvidenceListOptions): Promise<void> {
  try {
    const evidenceStore = new EvidenceStore();
    await evidenceStore.initialize();

    let evidence = await evidenceStore.listAllEvidence();

    // Apply filters
    if (options.type) {
      const filterType = options.type as EvidenceType;
      if (!VALID_TYPES.includes(filterType)) {
        console.error(`Invalid type: ${options.type}`);
        console.error(`Valid types: ${VALID_TYPES.join(', ')}`);
        process.exit(1);
      }
      evidence = evidence.filter((e) => e.type === filterType);
    }

    if (options.tier) {
      const searchTierId = options.tier.toUpperCase();
      evidence = evidence.filter(
        (e) =>
          e.itemId.toUpperCase().includes(searchTierId) ||
          e.path.toUpperCase().includes(searchTierId)
      );
    }

    if (options.dateFrom) {
      const fromDate = new Date(options.dateFrom);
      evidence = evidence.filter((e) => new Date(e.timestamp) >= fromDate);
    }

    if (options.dateTo) {
      const toDate = new Date(options.dateTo);
      evidence = evidence.filter((e) => new Date(e.timestamp) <= toDate);
    }

    // Get file stats
    const artifacts = await Promise.all(
      evidence.map(async (e: StoredEvidence) => {
        try {
          const stats = await fs.stat(e.path);
          return {
            name: basename(e.path),
            type: e.type,
            tierId: e.itemId,
            path: e.path,
            size: stats.size,
            createdAt: stats.mtime.toISOString(),
          };
        } catch {
          return null;
        }
      })
    );

    const validArtifacts = artifacts.filter((a) => a !== null);

    if (options.json) {
      console.log(JSON.stringify({ artifacts: validArtifacts }, null, 2));
    } else {
      if (validArtifacts.length === 0) {
        console.log('No evidence found.');
        return;
      }

      console.log(`Found ${validArtifacts.length} evidence artifact(s):\n`);
      console.log('Type          Tier ID              Name                                    Size');
      console.log('-'.repeat(85));

      for (const artifact of validArtifacts) {
        const sizeStr = formatSize(artifact.size);
        console.log(
          `${artifact.type.padEnd(13)} ${artifact.tierId.padEnd(20)} ${artifact.name.slice(0, 40).padEnd(40)} ${sizeStr}`
        );
      }
    }
  } catch (error) {
    console.error('Error listing evidence:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Show a specific evidence file
 */
export async function evidenceShowAction(
  type: string,
  name: string,
  options: EvidenceShowOptions
): Promise<void> {
  try {
    if (!VALID_TYPES.includes(type as EvidenceType)) {
      console.error(`Invalid type: ${type}`);
      console.error(`Valid types: ${VALID_TYPES.join(', ')}`);
      process.exit(1);
    }

    const subdirMap: Record<EvidenceType, string> = {
      log: 'test-logs',
      screenshot: 'screenshots',
      trace: 'browser-traces',
      snapshot: 'file-snapshots',
      metric: 'metrics',
      'gate-report': 'gate-reports',
    };

    const subdir = subdirMap[type as EvidenceType];
    const baseDir = '.puppet-master/evidence';
    const filePath = resolve(join(baseDir, subdir, name));

    // Security check
    const evidenceDir = resolve(baseDir);
    if (!filePath.startsWith(evidenceDir)) {
      console.error('Access denied: path outside evidence directory');
      process.exit(1);
    }

    if (!existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    const content = await fs.readFile(filePath);
    const ext = name.split('.').pop()?.toLowerCase() || '';

    if (options.json) {
      const stats = await fs.stat(filePath);
      const isText = ['log', 'txt', 'json', 'snapshot', 'md'].includes(ext);
      console.log(
        JSON.stringify(
          {
            path: filePath,
            type,
            name,
            size: stats.size,
            createdAt: stats.mtime.toISOString(),
            content: isText ? content.toString('utf-8') : `[Binary file, ${stats.size} bytes]`,
          },
          null,
          2
        )
      );
    } else {
      // For text files, output content
      if (['log', 'txt', 'json', 'snapshot', 'md'].includes(ext)) {
        console.log(content.toString('utf-8'));
      } else if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
        console.log(`[Binary image file: ${name}]`);
        console.log(`Path: ${filePath}`);
        console.log(`Size: ${formatSize(content.length)}`);
        console.log(`\nUse --json to get base64 encoded content, or open in GUI.`);
      } else {
        console.log(`[Binary file: ${name}]`);
        console.log(`Path: ${filePath}`);
        console.log(`Size: ${formatSize(content.length)}`);
      }
    }
  } catch (error) {
    console.error('Error showing evidence:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Export evidence to a directory
 */
export async function evidenceExportAction(options: EvidenceExportOptions): Promise<void> {
  try {
    const evidenceStore = new EvidenceStore();
    await evidenceStore.initialize();

    let evidence = await evidenceStore.listAllEvidence();

    // Apply filters
    if (options.type) {
      evidence = evidence.filter((e) => e.type === options.type);
    }
    if (options.tier) {
      const searchTierId = options.tier.toUpperCase();
      evidence = evidence.filter((e) => e.itemId.toUpperCase().includes(searchTierId));
    }

    // Create output directory
    const outputDir = resolve(options.output);
    await fs.mkdir(outputDir, { recursive: true });

    let exported = 0;
    for (const e of evidence) {
      try {
        const content = await fs.readFile(e.path);
        const destPath = join(outputDir, `${e.type}_${e.itemId}_${basename(e.path)}`);
        await fs.writeFile(destPath, content);
        exported++;
      } catch {
        console.warn(`Warning: Could not export ${e.path}`);
      }
    }

    console.log(`Exported ${exported} evidence file(s) to ${outputDir}`);
  } catch (error) {
    console.error('Error exporting evidence:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Format file size in human-readable format
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export class EvidenceCommand implements CommandModule {
  register(program: Command): void {
    const evidenceCmd = program
      .command('evidence')
      .description('Browse and manage verification evidence');

    evidenceCmd
      .command('list')
      .description('List evidence artifacts')
      .option('--type <type>', 'Filter by type (log, screenshot, trace, snapshot, metric, gate-report)')
      .option('--tier <tierId>', 'Filter by tier ID')
      .option('--date-from <date>', 'Filter by creation date (from)')
      .option('--date-to <date>', 'Filter by creation date (to)')
      .option('--json', 'Output as JSON')
      .action(async (opts) => {
        await evidenceListAction({
          type: opts.type,
          tier: opts.tier,
          dateFrom: opts.dateFrom,
          dateTo: opts.dateTo,
          json: opts.json,
        });
      });

    evidenceCmd
      .command('show <type> <name>')
      .description('Show a specific evidence file')
      .option('--json', 'Output as JSON')
      .action(async (type: string, name: string, opts) => {
        await evidenceShowAction(type, name, { json: opts.json });
      });

    evidenceCmd
      .command('export')
      .description('Export evidence to a directory')
      .requiredOption('-o, --output <dir>', 'Output directory')
      .option('--type <type>', 'Filter by type')
      .option('--tier <tierId>', 'Filter by tier ID')
      .action(async (opts) => {
        await evidenceExportAction({
          output: opts.output,
          type: opts.type,
          tier: opts.tier,
        });
      });
  }
}

export const evidenceCommand = new EvidenceCommand();
