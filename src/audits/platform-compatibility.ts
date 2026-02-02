/**
 * Platform Compatibility Checker for RWM Puppet Master
 * 
 * Detects Windows/Unix compatibility issues before runtime:
 * - Unix-only commands (true, false, which, curl, etc.)
 * - Hardcoded Unix paths (/tmp/, /usr/, etc.)
 * - Shell syntax in non-shell contexts (&&, ||, | bash)
 * - Hardcoded path separators in path contexts
 * 
 * Per BUILD_QUEUE_IMPROVEMENTS.md P1-T24 (Platform Compatibility Validator).
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

/**
 * Types of platform compatibility issues
 */
export type PlatformIssueType =
  | 'unix_only_command'
  | 'hardcoded_path'
  | 'shell_syntax'
  | 'path_separator';

/**
 * Severity levels for issues
 */
export type IssueSeverity = 'error' | 'warning';

/**
 * Platform compatibility issue
 */
export interface PlatformIssue {
  /** Type of issue */
  type: PlatformIssueType;
  /** Severity level */
  severity: IssueSeverity;
  /** File path relative to project root */
  file: string;
  /** Line number (1-based) */
  line: number;
  /** Code snippet from the line */
  code: string;
  /** Human-readable description */
  description: string;
  /** Suggested fix */
  suggestion: string;
}

/**
 * Unix-only commands that don't exist on Windows
 */
export const UNIX_ONLY_COMMANDS = [
  'true', // Use process.exit(0) or Boolean check
  'false', // Use process.exit(1) or Boolean check
  'which', // Use 'where' on Windows or cross-platform alternative
  'curl', // Use fetch() or cross-platform http client
  'wget', // Use fetch() or cross-platform http client
  'chmod', // Use fs.chmod with mode conversion
  'chown', // No Windows equivalent
  'ln', // Use fs.symlink
  'grep', // Use Node regex or cross-platform grep
  'sed', // Use Node string manipulation
  'awk', // Use Node string manipulation
  'xargs', // Use Node array methods
  'tee', // Use Node streams
  'nohup', // Use detached spawn
  'kill', // Use process.kill with PID
] as const;

/**
 * Unix-only path patterns
 */
export const UNIX_ONLY_PATHS = [
  '/tmp/',
  '/var/',
  '/usr/',
  '/etc/',
  '/home/',
  '/opt/',
  '~/',
] as const;

/**
 * Shell syntax patterns that may not work cross-platform
 */
export const SHELL_SYNTAX_PATTERNS = [
  /\s&&\s/, // Use Promise.all or sequential await
  /\s\|\|\s/, // Use try/catch
  /\s;\s/, // Use sequential statements
  /`[^`]+`/, // Use $() or avoid shell substitution
  /\$\([^)]+\)/, // Shell substitution - may not work
  /\|\s*bash/, // Pipe to bash - Unix only
  /\|\s*sh/, // Pipe to sh - Unix only
] as const;

/**
 * Platform compatibility checker
 */
export class PlatformCompatibilityChecker {
  /**
   * Check project for platform compatibility issues
   * 
   * @param projectRoot - Root directory of the project
   * @returns Array of detected issues
   */
  async check(projectRoot: string): Promise<PlatformIssue[]> {
    const issues: PlatformIssue[] = [];
    const srcDir = join(projectRoot, 'src');

    // Find all TypeScript files recursively
    const files = await this.findTypeScriptFiles(srcDir, projectRoot);

    for (const file of files) {
      const fileIssues = await this.checkFile(file, projectRoot);
      issues.push(...fileIssues);
    }

    return issues;
  }

  /**
   * Recursively find all TypeScript files in a directory
   */
  private async findTypeScriptFiles(
    dir: string,
    projectRoot: string
  ): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules and dist directories
          if (entry.name === 'node_modules' || entry.name === 'dist') {
            continue;
          }
          const subFiles = await this.findTypeScriptFiles(fullPath, projectRoot);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    return files;
  }

  /**
   * Check a single file for platform compatibility issues
   */
  private async checkFile(
    filePath: string,
    projectRoot: string
  ): Promise<PlatformIssue[]> {
    const issues: PlatformIssue[] = [];

    try {
      const content = await readFile(filePath, 'utf8');
      const lines = content.split('\n');
      const relativePath = relative(projectRoot, filePath);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;

        // Check for Unix-only commands
        issues.push(...this.checkUnixCommands(line, relativePath, lineNum));

        // Check for Unix-only paths
        issues.push(...this.checkUnixPaths(line, relativePath, lineNum));

        // Check for shell syntax (only in command contexts)
        if (this.isCommandContext(line)) {
          issues.push(...this.checkShellSyntax(line, relativePath, lineNum));
        }

        // Check for hardcoded path separators
        issues.push(...this.checkPathSeparators(line, relativePath, lineNum));
      }
    } catch (error) {
      // Skip files that can't be read
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }

    return issues;
  }

  /**
   * Check for Unix-only commands
   */
  private checkUnixCommands(
    line: string,
    file: string,
    lineNum: number
  ): PlatformIssue[] {
    const issues: PlatformIssue[] = [];

    for (const cmd of UNIX_ONLY_COMMANDS) {
      // Match command in quotes or as spawn/exec argument
      const patterns = [
        new RegExp(`['"\`]${cmd}['"\`]`, 'g'),
        new RegExp(`spawn\\(['"]${cmd}`, 'g'),
        new RegExp(`exec\\(['"]${cmd}`, 'g'),
        new RegExp(`command:\\s*['"]${cmd}`, 'g'),
        new RegExp(`target:\\s*['"]${cmd}`, 'g'),
      ];

      for (const pattern of patterns) {
        if (pattern.test(line)) {
          issues.push({
            type: 'unix_only_command',
            severity: 'error',
            file,
            line: lineNum,
            code: line.trim(),
            description: `Unix-only command '${cmd}' will fail on Windows`,
            suggestion: this.getSuggestionForCommand(cmd),
          });
          break; // Only report once per command per line
        }
      }
    }

    return issues;
  }

  /**
   * Check for Unix-only paths
   */
  private checkUnixPaths(
    line: string,
    file: string,
    lineNum: number
  ): PlatformIssue[] {
    const issues: PlatformIssue[] = [];

    // Skip URLs and comments to avoid false positives
    if (line.trim().startsWith('//') || line.includes('http://') || line.includes('https://')) {
      return issues;
    }

    for (const unixPath of UNIX_ONLY_PATHS) {
      if (line.includes(unixPath)) {
        issues.push({
          type: 'hardcoded_path',
          severity: 'error',
          file,
          line: lineNum,
          code: line.trim(),
          description: `Hardcoded Unix path '${unixPath}' won't work on Windows`,
          suggestion: 'Use os.tmpdir(), os.homedir(), or path.join() with relative paths',
        });
        break; // Only report once per path per line
      }
    }

    return issues;
  }

  /**
   * Check if line is in a command context (spawn, exec, target, command)
   */
  private isCommandContext(line: string): boolean {
    return (
      line.includes('spawn') ||
      line.includes('exec') ||
      line.includes('target:') ||
      line.includes('command:')
    );
  }

  /**
   * Check for shell syntax in command contexts
   */
  private checkShellSyntax(
    line: string,
    file: string,
    lineNum: number
  ): PlatformIssue[] {
    const issues: PlatformIssue[] = [];

    for (const pattern of SHELL_SYNTAX_PATTERNS) {
      if (pattern.test(line)) {
        issues.push({
          type: 'shell_syntax',
          severity: 'warning',
          file,
          line: lineNum,
          code: line.trim(),
          description: 'Shell syntax may not work cross-platform',
          suggestion: 'Use Node.js APIs instead of shell syntax',
        });
        break; // Only report once per pattern per line
      }
    }

    return issues;
  }

  /**
   * Check for hardcoded path separators in path contexts
   */
  private checkPathSeparators(
    line: string,
    file: string,
    lineNum: number
  ): PlatformIssue[] {
    const issues: PlatformIssue[] = [];

    // Only flag if it's used in path context
    if (
      (line.includes("'/'") || line.includes('"/"')) &&
      (line.includes('path') || line.includes('join') || line.includes('dir'))
    ) {
      issues.push({
        type: 'path_separator',
        severity: 'warning',
        file,
        line: lineNum,
        code: line.trim(),
        description: "Hardcoded '/' separator may fail on Windows",
        suggestion: 'Use path.sep or path.join()',
      });
    }

    return issues;
  }

  /**
   * Get suggestion for a Unix-only command
   */
  private getSuggestionForCommand(cmd: string): string {
    const suggestions: Record<string, string> = {
      true: 'Use process.exit(0) or a function that returns true',
      false: 'Use process.exit(1) or a function that returns false',
      which: 'Use cross-platform-which package or implement with fs.existsSync + PATH parsing',
      curl: 'Use fetch() or node-fetch',
      wget: 'Use fetch() or node-fetch',
      chmod: 'Use fs.chmod() with numeric mode',
      grep: 'Use Node.js regex matching',
      sed: 'Use String.replace() or Node.js streams',
    };

    return suggestions[cmd] ?? 'Use a cross-platform Node.js alternative';
  }
}
