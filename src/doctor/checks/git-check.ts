/**
 * Git Checks for RWM Puppet Master Doctor System
 * 
 * Provides checks for git availability, configuration, repository status, and remote configuration.
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T03 (Git Check).
 */

import { spawn, type ChildProcess } from 'node:child_process';
import type { DoctorCheck, CheckResult } from '../check-registry.js';

/**
 * Helper function to run a git command and collect output
 */
async function runGitCommand(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number; error?: Error }> {
  return new Promise((resolve) => {
    const proc: ChildProcess = spawn('git', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    if (proc.stdout) {
      proc.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
    }

    if (proc.stderr) {
      proc.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
    }

    proc.on('close', (exitCode: number | null) => {
      resolve({
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: exitCode ?? -1,
      });
    });

    proc.on('error', (error: Error) => {
      resolve({
        stdout: '',
        stderr: 'Failed to spawn git process',
        exitCode: -1,
        error,
      });
    });
  });
}

/**
 * Check if git is available and report version
 */
export class GitAvailableCheck implements DoctorCheck {
  readonly name = 'git-available';
  readonly category = 'git' as const;
  readonly description = 'Check if git is available and report version';

  async run(): Promise<CheckResult> {
    try {
      const result = await runGitCommand(['--version']);
      
      if (result.error) {
        return {
          name: this.name,
          category: this.category,
          passed: false,
          message: `Failed to check git availability: ${result.error.message}`,
          fixSuggestion: 'Install git: https://git-scm.com/downloads',
          durationMs: 0,
        };
      }
      
      if (result.exitCode === 0 && result.stdout) {
        return {
          name: this.name,
          category: this.category,
          passed: true,
          message: 'git is available',
          details: result.stdout,
          durationMs: 0,
        };
      }
      
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: 'git is not available',
        fixSuggestion: 'Install git: https://git-scm.com/downloads',
        durationMs: 0,
      };
    } catch (error) {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Failed to check git availability: ${error instanceof Error ? error.message : String(error)}`,
        fixSuggestion: 'Install git: https://git-scm.com/downloads',
        durationMs: 0,
      };
    }
  }
}

/**
 * Check if git user.name and user.email are configured
 */
export class GitConfigCheck implements DoctorCheck {
  readonly name = 'git-config';
  readonly category = 'git' as const;
  readonly description = 'Check if git user.name and user.email are configured';

  async run(): Promise<CheckResult> {
    try {
      const userNameResult = await runGitCommand(['config', 'user.name']);
      const userEmailResult = await runGitCommand(['config', 'user.email']);

      if (userNameResult.error || userEmailResult.error) {
        const error = userNameResult.error || userEmailResult.error;
        return {
          name: this.name,
          category: this.category,
          passed: false,
          message: `Failed to check git configuration: ${error!.message}`,
          fixSuggestion: `Run: git config --global user.name 'Your Name' && git config --global user.email 'your.email@example.com'`,
          durationMs: 0,
        };
      }

      const userName = userNameResult.exitCode === 0 ? userNameResult.stdout : null;
      const userEmail = userEmailResult.exitCode === 0 ? userEmailResult.stdout : null;

      const missing: string[] = [];
      if (!userName) {
        missing.push('user.name');
      }
      if (!userEmail) {
        missing.push('user.email');
      }

      if (missing.length === 0) {
        return {
          name: this.name,
          category: this.category,
          passed: true,
          message: 'git user.name and user.email are configured',
          details: `user.name: ${userName}, user.email: ${userEmail}`,
          durationMs: 0,
        };
      }

      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `git configuration missing: ${missing.join(', ')}`,
        fixSuggestion: `Run: git config --global user.name 'Your Name' && git config --global user.email 'your.email@example.com'`,
        durationMs: 0,
      };
    } catch (error) {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Failed to check git configuration: ${error instanceof Error ? error.message : String(error)}`,
        fixSuggestion: `Run: git config --global user.name 'Your Name' && git config --global user.email 'your.email@example.com'`,
        durationMs: 0,
      };
    }
  }
}

/**
 * Check if current directory is a git repository
 */
export class GitRepoCheck implements DoctorCheck {
  readonly name = 'git-repo';
  readonly category = 'git' as const;
  readonly description = 'Check if current directory is a git repository';

  async run(): Promise<CheckResult> {
    try {
      const result = await runGitCommand(['rev-parse', '--is-inside-work-tree']);

      if (result.error) {
        return {
          name: this.name,
          category: this.category,
          passed: false,
          message: `Failed to check git repository status: ${result.error.message}`,
          fixSuggestion: 'Run git init to initialize a repository',
          durationMs: 0,
        };
      }

      if (result.exitCode === 0 && result.stdout === 'true') {
        return {
          name: this.name,
          category: this.category,
          passed: true,
          message: 'Current directory is a git repository',
          durationMs: 0,
        };
      }

      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: 'Current directory is not a git repository',
        fixSuggestion: 'Run git init to initialize a repository',
        durationMs: 0,
      };
    } catch (error) {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Failed to check git repository status: ${error instanceof Error ? error.message : String(error)}`,
        fixSuggestion: 'Run git init to initialize a repository',
        durationMs: 0,
      };
    }
  }
}

/**
 * Check if git remote is configured (warning only)
 */
export class GitRemoteCheck implements DoctorCheck {
  readonly name = 'git-remote';
  readonly category = 'git' as const;
  readonly description = 'Check if git remote is configured';

  async run(): Promise<CheckResult> {
    try {
      const result = await runGitCommand(['remote', '-v']);

      if (result.error) {
        // GitRemoteCheck should pass even on error (it's optional)
        return {
          name: this.name,
          category: this.category,
          passed: true,
          message: `Failed to check git remote: ${result.error.message}`,
          fixSuggestion: 'Run git remote add origin <url> to add a remote repository',
          durationMs: 0,
        };
      }

      // git remote -v returns exit code 0 even if no remotes are configured
      // It just returns empty output
      if (result.exitCode === 0 && result.stdout) {
        const remotes = result.stdout.split('\n').filter(line => line.trim()).length;
        if (remotes > 0) {
          return {
            name: this.name,
            category: this.category,
            passed: true,
            message: 'git remote is configured',
            details: result.stdout,
            durationMs: 0,
          };
        }
      }

      // No remote configured - pass but with warning message
      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: 'No git remote configured (optional, but recommended)',
        fixSuggestion: 'Run git remote add origin <url> to add a remote repository',
        durationMs: 0,
      };
    } catch (error) {
      return {
        name: this.name,
        category: this.category,
        passed: true,
        message: `Failed to check git remote: ${error instanceof Error ? error.message : String(error)}`,
        fixSuggestion: 'Run git remote add origin <url> to add a remote repository',
        durationMs: 0,
      };
    }
  }
}
