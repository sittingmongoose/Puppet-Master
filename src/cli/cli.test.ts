/**
 * Tests for CLI framework
 */

import { describe, it, expect, vi } from 'vitest';
import { Command } from 'commander';
import { run, program } from './index.js';
import { VERSION } from '../index.js';
import type { CommandModule } from './commands/index.js';
import { registerCommands } from './commands/index.js';

describe('CLI Framework', () => {
  describe('program configuration', () => {
    it('should have correct name', () => {
      expect(program.name()).toBe('puppet-master');
    });

    it('should have correct description', () => {
      expect(program.description()).toBe('RWM Puppet Master - CLI orchestrator for AI development workflows');
    });

    it('should have correct version', () => {
      expect(program.version()).toBe(VERSION);
    });
  });

  describe('run function', () => {
    it('should be a function', () => {
      expect(typeof run).toBe('function');
    });

    it('should call program.parse with custom argv', () => {
      const mockParse = vi.spyOn(program, 'parse');
      const customArgs = ['node', 'script.js', '--version'];
      
      // Mock process.exit to prevent actual exit
      const originalExit = process.exit;
      process.exit = vi.fn() as never;
      
      try {
        run(customArgs);
      } catch {
        // Commander.js may throw, which is expected
      }
      
      expect(mockParse).toHaveBeenCalledWith(customArgs);
      mockParse.mockRestore();
      process.exit = originalExit;
    });
  });

  describe('program exports', () => {
    it('should export program instance', () => {
      expect(program).toBeInstanceOf(Command);
    });

    it('should export run function', () => {
      expect(typeof run).toBe('function');
    });
  });

  describe('help output', () => {
    it('should include program name in help', () => {
      const output: string[] = [];
      const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation((chunk: string | Uint8Array) => {
        output.push(chunk.toString());
        return true;
      });

      try {
        program.help();
      } catch {
        // help() throws to exit, which is expected
      }

      const helpText = output.join('');
      expect(helpText).toContain('puppet-master');
      expect(helpText).toContain('RWM Puppet Master');

      writeSpy.mockRestore();
    });
  });

  describe('version output', () => {
    it('should show correct version', () => {
      expect(program.version()).toBe(VERSION);
    });
  });

  describe('command registration', () => {
    it('should have check command registered', () => {
      const commands = program.commands;
      const checkCommand = commands.find(cmd => cmd.name() === 'check');
      expect(checkCommand).toBeDefined();
      expect(checkCommand?.description()).toContain('Verify Phase 2 completion criteria');
    });
  });
});

describe('CommandModule interface', () => {
  it('should allow command registration', () => {
    const mockCommand: CommandModule = {
      register: vi.fn(),
    };

    const testProgram = new Command();
    registerCommands(testProgram, [mockCommand]);

    expect(mockCommand.register).toHaveBeenCalledWith(testProgram);
  });

  it('should register multiple commands', () => {
    const mockCommand1: CommandModule = {
      register: vi.fn(),
    };
    const mockCommand2: CommandModule = {
      register: vi.fn(),
    };

    const testProgram = new Command();
    registerCommands(testProgram, [mockCommand1, mockCommand2]);

    expect(mockCommand1.register).toHaveBeenCalledWith(testProgram);
    expect(mockCommand2.register).toHaveBeenCalledWith(testProgram);
  });
});
