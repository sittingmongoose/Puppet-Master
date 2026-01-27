#!/usr/bin/env node

import { Command } from 'commander';
import { VERSION } from '../index.js';
import { checkCommand } from './commands/check.js';
import { startCommand } from './commands/start.js';
import { doctorCommand } from './commands/doctor.js';
import { statusCommand } from './commands/status.js';
import { planCommand } from './commands/plan.js';
import { initCommand } from './commands/init.js';
import { pauseCommand } from './commands/pause.js';
import { resumeCommand } from './commands/resume.js';
import { stopCommand } from './commands/stop.js';
import { installCommand } from './commands/install.js';
import { replanCommand } from './commands/replan.js';
import { reopenCommand } from './commands/reopen.js';
import { guiCommand } from './commands/gui.js';
import { validateCommand } from './commands/validate.js';
import { interviewCommand } from './commands/interview.js';
import { CheckpointsCommand } from './commands/checkpoints.js';
import { ledgerCommand } from './commands/ledger.js';
import { metricsCommand } from './commands/metrics.js';
import { loginCommand } from './commands/login.js';
import { UsageCommand } from './commands/usage.js';
// Feature parity commands (CLI ↔ GUI)
import { evidenceCommand } from './commands/evidence.js';
import { coverageCommand } from './commands/coverage.js';
import { historyCommand } from './commands/history.js';
import { retryCommand } from './commands/retry.js';
import { resetCommand } from './commands/reset.js';
import { killSpawnCommand } from './commands/kill-spawn.js';
import { modelsCommand } from './commands/models.js';
import { agentsCommand } from './commands/agents.js';
import { configCommand } from './commands/config.js';

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

// Register plan command
planCommand.register(program);

// Register init command
initCommand.register(program);

// Register pause command
pauseCommand.register(program);

// Register resume command
resumeCommand.register(program);

// Register stop command
stopCommand.register(program);

// Register install command
installCommand.register(program);

// Register replan command
replanCommand.register(program);

// Register reopen command
reopenCommand.register(program);

// Register GUI command
guiCommand.register(program);

// Register validate command
validateCommand.register(program);

// Register interview command (FIX 8: standalone interview command)
interviewCommand.register(program);

// Register checkpoints command
const checkpointsCommand = new CheckpointsCommand();
checkpointsCommand.register(program);

// Register ledger command (P2-T03)
ledgerCommand.register(program);

// Register metrics command (P2-T08)
metricsCommand.register(program);

// Register login command (P0-G25: authentication wizard)
loginCommand.register(program);

// Register usage command (P1: platform usage/quota status)
const usageCommand = new UsageCommand();
usageCommand.register(program);

// Feature parity commands (CLI ↔ GUI)
evidenceCommand.register(program);
coverageCommand.register(program);
historyCommand.register(program);
retryCommand.register(program);
resetCommand.register(program);
killSpawnCommand.register(program);
modelsCommand.register(program);
agentsCommand.register(program);
configCommand.register(program);

/**
 * Run the CLI with the given arguments
 * @param argv - Command line arguments (defaults to process.argv)
 */
export function run(argv: string[] = process.argv): void {
  program.parse(argv);
}

export { program };

// Auto-run when executed directly (not imported as a module)
// This is needed for the CLI binary to work correctly
import { fileURLToPath } from 'url';
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run();
}