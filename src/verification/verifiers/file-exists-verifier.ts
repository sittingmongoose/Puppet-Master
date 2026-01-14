/**
 * File Exists Verifier
 * 
 * Verifies file and directory existence with support for glob patterns,
 * size constraints, permissions checking, and negative existence checks.
 * 
 * See REQUIREMENTS.md Section 25.2 (Verifier Taxonomy).
 */

import { promises as fs } from 'fs';
import { constants } from 'fs';
import { join, resolve } from 'path';
import type { Criterion, VerifierResult } from '../../types/tiers.js';
import type { Verifier } from './verifier.js';

/**
 * Options for file existence verification.
 */
export interface FileExistsOptions extends Record<string, unknown> {
  /** Whether the target should be a directory (default: false) */
  isDirectory?: boolean;
  /** Minimum file size in bytes */
  minSize?: number;
  /** Maximum file size in bytes */
  maxSize?: number;
  /** Expected permissions (e.g., 'rwx', 'rw-', 'r--') */
  permissions?: string;
  /** If true, verifies that the file does NOT exist */
  notExists?: boolean;
}

/**
 * FileExistsCriterion interface.
 * Extends Criterion with file_exists-specific options.
 */
export interface FileExistsCriterion extends Criterion {
  type: 'file_exists';
  target: string; // File path or glob pattern
  options?: FileExistsOptions;
}

/**
 * Result of checking a single file.
 */
interface FileCheckResult {
  path: string;
  exists: boolean;
  isDirectory?: boolean;
  size?: number;
  permissions?: string;
  error?: string;
}

/**
 * FileExistsVerifier class.
 * Verifies file and directory existence with various constraints.
 */
export class FileExistsVerifier implements Verifier {
  readonly type = 'file_exists';

  /**
   * Verifies a file existence criterion.
   * @param criterion - The criterion to verify
   * @returns Promise resolving to the verification result
   */
  async verify(criterion: Criterion): Promise<VerifierResult> {
    const startTime = Date.now();
    
    if (criterion.type !== 'file_exists') {
      return {
        type: this.type,
        target: criterion.target,
        passed: false,
        summary: `Invalid criterion type: expected 'file_exists', got '${criterion.type}'`,
        error: `Invalid criterion type: ${criterion.type}`,
        durationMs: Date.now() - startTime,
      };
    }

    const fileCriterion = criterion as FileExistsCriterion;
    const options = fileCriterion.options || {};

    try {
      // Resolve glob pattern or use single path
      const paths = await this.resolveGlob(fileCriterion.target);
      
      if (paths.length === 0) {
        // If notExists is true, empty result means success
        if (options.notExists) {
          return {
            type: this.type,
            target: fileCriterion.target,
            passed: true,
            summary: `No files match pattern '${fileCriterion.target}' (as expected)`,
            durationMs: Date.now() - startTime,
          };
        }
        
        return {
          type: this.type,
          target: fileCriterion.target,
          passed: false,
          summary: `No files match pattern '${fileCriterion.target}'`,
          error: 'No matching files found',
          durationMs: Date.now() - startTime,
        };
      }

      // Check each file
      const results: FileCheckResult[] = [];
      for (const path of paths) {
        const result = await this.checkFile(path, options);
        results.push(result);
      }

      // Aggregate results
      const allPassed = results.every(r => {
        if (options.notExists) {
          return !r.exists;
        }
        return r.exists && !r.error;
      });

      const failedResults = results.filter(r => {
        if (options.notExists) {
          return r.exists;
        }
        return !r.exists || !!r.error;
      });

      let summary: string;
      if (allPassed) {
        if (options.notExists) {
          summary = `All ${results.length} file(s) do not exist (as expected)`;
        } else {
          summary = `All ${results.length} file(s) exist and meet criteria`;
        }
      } else {
        const failedPaths = failedResults.map(r => r.path).join(', ');
        summary = `Failed: ${failedResults.length} of ${results.length} file(s) did not meet criteria: ${failedPaths}`;
      }

      return {
        type: this.type,
        target: fileCriterion.target,
        passed: allPassed,
        summary,
        error: allPassed ? undefined : `Failed checks: ${failedResults.map(r => r.error || 'existence check failed').join('; ')}`,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        type: this.type,
        target: fileCriterion.target,
        passed: false,
        summary: `Error during verification: ${error instanceof Error ? error.message : String(error)}`,
        error: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Checks a single file against the given options.
   * @param path - The file path to check
   * @param options - The verification options
   * @returns Promise resolving to the file check result
   */
  private async checkFile(path: string, options: FileExistsOptions): Promise<FileCheckResult> {
    const result: FileCheckResult = {
      path,
      exists: false,
    };

    try {
      const stats = await fs.stat(path);
      result.exists = true;
      result.isDirectory = stats.isDirectory();
      result.size = stats.size;

      // Check if directory when expecting file or vice versa
      if (options.isDirectory !== undefined) {
        if (options.isDirectory && !result.isDirectory) {
          result.error = 'Expected directory but found file';
          return result;
        }
        if (!options.isDirectory && result.isDirectory) {
          result.error = 'Expected file but found directory';
          return result;
        }
      }

      // Check size constraints (only for files)
      if (!result.isDirectory) {
        if (options.minSize !== undefined && result.size !== undefined && result.size < options.minSize) {
          result.error = `File size ${result.size} bytes is less than minimum ${options.minSize} bytes`;
          return result;
        }
        if (options.maxSize !== undefined && result.size !== undefined && result.size > options.maxSize) {
          result.error = `File size ${result.size} bytes exceeds maximum ${options.maxSize} bytes`;
          return result;
        }
      }

      // Check permissions
      if (options.permissions) {
        const hasPermissions = await this.checkPermissions(path, options.permissions);
        if (!hasPermissions) {
          result.error = `File does not have required permissions: ${options.permissions}`;
          return result;
        }
        result.permissions = options.permissions;
      }
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        result.exists = false;
        result.error = 'File does not exist';
      } else {
        result.error = error instanceof Error ? error.message : String(error);
      }
    }

    return result;
  }

  /**
   * Checks if a file has the required permissions.
   * @param path - The file path to check
   * @param expected - Expected permissions string (e.g., 'rwx', 'rw-', 'r--')
   * @returns Promise resolving to true if permissions match, false otherwise
   */
  private async checkPermissions(path: string, expected: string): Promise<boolean> {
    let flags = 0;
    
    if (expected.includes('r')) {
      flags |= constants.R_OK;
    }
    if (expected.includes('w')) {
      flags |= constants.W_OK;
    }
    if (expected.includes('x')) {
      flags |= constants.X_OK;
    }

    try {
      await fs.access(path, flags);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Resolves a glob pattern to an array of matching file paths.
   * Supports simple glob patterns like '*.ts', 'src/**\/*.ts', 'src/**'.
   * @param pattern - The glob pattern to resolve
   * @returns Promise resolving to an array of matching file paths
   */
  private async resolveGlob(pattern: string): Promise<string[]> {
    // If pattern doesn't contain glob characters, treat as literal path
    if (!pattern.includes('*') && !pattern.includes('?')) {
      try {
        await fs.access(pattern, constants.F_OK);
        return [resolve(pattern)];
      } catch {
        return [];
      }
    }

    // Simple glob implementation
    // Split pattern into directory and filename parts
    const parts = pattern.split('/');
    const baseDir = parts.slice(0, -1).join('/') || '.';
    const filePattern = parts[parts.length - 1];

    // Handle recursive glob (**)
    if (pattern.includes('**')) {
      return this.resolveRecursiveGlob(pattern);
    }

    // Handle simple patterns in a single directory
    try {
      const files = await fs.readdir(baseDir, { withFileTypes: true });
      const matches: string[] = [];

      for (const file of files) {
        const fullPath = join(baseDir, file.name);
        if (this.matchesPattern(file.name, filePattern)) {
          matches.push(resolve(fullPath));
        }
      }

      return matches;
    } catch {
      return [];
    }
  }

  /**
   * Resolves a recursive glob pattern (with **).
   * @param pattern - The glob pattern with **
   * @returns Promise resolving to an array of matching file paths
   */
  private async resolveRecursiveGlob(pattern: string): Promise<string[]> {
    const matches: string[] = [];
    const parts = pattern.split('**');
    
    if (parts.length !== 2) {
      // Only support one ** in pattern
      return [];
    }

    const basePath = parts[0].replace(/\/$/, '') || '.';
    const suffixPattern = parts[1].replace(/^\//, '');

    const walk = async (dir: string, depth: number = 0): Promise<void> => {
      // Prevent infinite recursion (max depth 20)
      if (depth > 20) {
        return;
      }

      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          const relativePath = fullPath.replace(resolve(basePath) + '/', '');

          if (entry.isDirectory()) {
            // Check if this directory path matches the pattern so far
            if (this.matchesRecursivePattern(relativePath, suffixPattern, true)) {
              await walk(fullPath, depth + 1);
            } else if (this.matchesRecursivePattern(relativePath, suffixPattern, false)) {
              await walk(fullPath, depth + 1);
            }
          } else {
            // Check if file matches
            if (this.matchesRecursivePattern(relativePath, suffixPattern, false)) {
              matches.push(resolve(fullPath));
            }
          }
        }
      } catch {
        // Ignore errors reading directories
      }
    };

    await walk(resolve(basePath));
    return matches;
  }

  /**
   * Checks if a filename matches a simple glob pattern.
   * @param filename - The filename to check
   * @param pattern - The glob pattern (e.g., '*.ts', 'test.*')
   * @returns True if the filename matches the pattern
   */
  private matchesPattern(filename: string, pattern: string): boolean {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filename);
  }

  /**
   * Checks if a path matches a recursive glob pattern.
   * @param path - The path to check
   * @param pattern - The pattern after **
   * @param isDirectory - Whether we're checking a directory
   * @returns True if the path matches
   */
  private matchesRecursivePattern(path: string, pattern: string, _isDirectory: boolean): boolean {
    if (!pattern) {
      return true; // ** matches everything
    }

    // If pattern starts with /, it must match from root
    if (pattern.startsWith('/')) {
      const cleanPattern = pattern.slice(1);
      return this.matchesPattern(path.split('/').pop() || '', cleanPattern);
    }

    // Pattern can match anywhere in the path
    const pathParts = path.split('/');
    const patternParts = pattern.split('/');

    // Simple matching: check if pattern matches end of path
    if (patternParts.length === 1) {
      // Single filename pattern
      return this.matchesPattern(pathParts[pathParts.length - 1] || '', patternParts[0]);
    }

    // Multi-part pattern - check if path ends with pattern
    if (pathParts.length < patternParts.length) {
      return false;
    }

    const pathEnd = pathParts.slice(-patternParts.length);
    for (let i = 0; i < patternParts.length; i++) {
      if (!this.matchesPattern(pathEnd[i] || '', patternParts[i])) {
        return false;
      }
    }

    return true;
  }
}
