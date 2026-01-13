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
  .description('Display Context7 MCP reminder')
  .action(() => {
    checkCommand();
  });

// Parse command line arguments
program.parse();