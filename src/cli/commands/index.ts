/**
 * Command module interface and registration utilities
 */

import type { Command } from 'commander';

/**
 * Interface for command modules that can be registered with the CLI program
 */
export interface CommandModule {
  /**
   * Register this command module with the Commander.js program
   * @param program - The Commander.js program instance
   */
  register(program: Command): void;
}

/**
 * Register multiple command modules with the CLI program
 * @param program - The Commander.js program instance
 * @param commands - Array of command modules to register
 */
export function registerCommands(program: Command, commands: CommandModule[]): void {
  for (const cmd of commands) {
    cmd.register(program);
  }
}
