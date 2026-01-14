#!/usr/bin/env node

import { Command } from 'commander';
import { VERSION } from '../index.js';
import { checkCommand } from './commands/check.js';
import { startCommand } from './commands/start.js';
import { doctorCommand } from './commands/doctor.js';
import { statusCommand } from './commands/status.js';

const program = new Command();

program
  .name('puppet-master')
  .description('RWM Puppet Master - CLI orchestrator for AI development workflows')
  .version(VERSION);

// Register commands
program
  .command('check')
  .description('Verify Phase 2 completion criteria')
  .option('--phase <number>', 'Phase number to check', '2')
  .option('--verbose', 'Show detailed output', false)
  .option('--update-checklist', 'Update checklist in phase file if all checks pass', false)
  .action((options) => {
    checkCommand({
      phase: parseInt(options.phase, 10),
      verbose: options.verbose,
      updateChecklist: options.updateChecklist,
    });
  });

// Register start command
startCommand.register(program);

// Register doctor command
doctorCommand.register(program);

// Register status command
statusCommand.register(program);

/**
 * Run the CLI with the given arguments
 * @param argv - Command line arguments (defaults to process.argv)
 */
export function run(argv: string[] = process.argv): void {
  program.parse(argv);
}

export { program };