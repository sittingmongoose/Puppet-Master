#!/usr/bin/env node

import { Command } from 'commander';
import { VERSION } from '../index.js';
import { checkCommand } from './commands/check.js';

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

// Parse command line arguments
program.parse();