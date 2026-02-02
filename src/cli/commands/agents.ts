/**
 * Agents command - Browse AGENTS.md files
 *
 * Implements `puppet-master agents`:
 * - `agents list` : list discovered AGENTS.md files
 * - `agents show` : display a specific AGENTS.md file content
 *
 * Feature parity with GUI GET /api/agents endpoints.
 */

import { Command } from 'commander';
import { promises as fs } from 'fs';
import { join, resolve, relative } from 'path';
import { existsSync } from 'fs';
import type { CommandModule } from './index.js';

export interface AgentsListOptions {
  json?: boolean;
}

export interface AgentsShowOptions {
  json?: boolean;
}

/**
 * Find all AGENTS.md files in the project
 */
async function findAgentsFiles(baseDir: string, maxDepth: number = 3): Promise<string[]> {
  const agentsFiles: string[] = [];

  async function searchDir(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isFile() && entry.name.toUpperCase() === 'AGENTS.MD') {
          agentsFiles.push(fullPath);
        } else if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await searchDir(fullPath, depth + 1);
        }
      }
    } catch {
      // Ignore permission errors
    }
  }

  await searchDir(baseDir, 0);
  return agentsFiles;
}

/**
 * List discovered AGENTS.md files
 */
export async function agentsListAction(options: AgentsListOptions): Promise<void> {
  try {
    const baseDir = process.cwd();
    const agentsFiles = await findAgentsFiles(baseDir);

    if (options.json) {
      const files = agentsFiles.map((f) => ({
        path: f,
        relativePath: relative(baseDir, f),
      }));
      console.log(JSON.stringify({ files }, null, 2));
      return;
    }

    if (agentsFiles.length === 0) {
      console.log('No AGENTS.md files found in the project.');
      console.log();
      console.log('AGENTS.md files provide long-term memory and conventions for AI agents.');
      console.log('Create one at the project root to get started.');
      return;
    }

    console.log(`Found ${agentsFiles.length} AGENTS.md file(s):\n`);

    for (const file of agentsFiles) {
      const relativePath = relative(baseDir, file);
      const stats = await fs.stat(file);
      const sizeKb = (stats.size / 1024).toFixed(1);
      const modified = stats.mtime.toLocaleDateString();

      console.log(`  📄 ${relativePath}`);
      console.log(`     Size: ${sizeKb} KB | Modified: ${modified}`);
      console.log();
    }

    console.log('Use `puppet-master agents show <path>` to view a specific file.');
  } catch (error) {
    console.error('Error listing agents files:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Show a specific AGENTS.md file
 */
export async function agentsShowAction(path: string, options: AgentsShowOptions): Promise<void> {
  try {
    const baseDir = process.cwd();
    let filePath: string;

    // Handle relative or absolute path
    if (path.startsWith('/')) {
      filePath = path;
    } else {
      filePath = resolve(baseDir, path);
    }

    // Security check - ensure path is within project
    if (!filePath.startsWith(resolve(baseDir))) {
      console.error('Access denied: path outside project directory');
      process.exit(1);
    }

    if (!existsSync(filePath)) {
      console.error(`File not found: ${path}`);
      process.exit(1);
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            path: filePath,
            relativePath: relative(baseDir, filePath),
            size: stats.size,
            modified: stats.mtime.toISOString(),
            content,
          },
          null,
          2
        )
      );
      return;
    }

    // Display content with header
    const relativePath = relative(baseDir, filePath);
    console.log('╔' + '═'.repeat(relativePath.length + 4) + '╗');
    console.log(`║  ${relativePath}  ║`);
    console.log('╚' + '═'.repeat(relativePath.length + 4) + '╝');
    console.log();
    console.log(content);
  } catch (error) {
    console.error('Error showing agents file:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

export class AgentsCommand implements CommandModule {
  register(program: Command): void {
    const agentsCmd = program
      .command('agents')
      .description('Browse AGENTS.md documentation files');

    agentsCmd
      .command('list')
      .description('List discovered AGENTS.md files')
      .option('--json', 'Output as JSON')
      .action(async (opts) => {
        await agentsListAction({ json: opts.json });
      });

    agentsCmd
      .command('show <path>')
      .description('Show a specific AGENTS.md file')
      .option('--json', 'Output as JSON')
      .action(async (path: string, opts) => {
        await agentsShowAction(path, { json: opts.json });
      });

    // Default to list if no subcommand
    agentsCmd.action(async () => {
      await agentsListAction({});
    });
  }
}

export const agentsCommand = new AgentsCommand();
