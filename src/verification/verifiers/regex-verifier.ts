/**
 * Regex Verifier
 * 
 * Verifies file contents against regex patterns with support for:
 * - Positive patterns (must match)
 * - Negative patterns (must not match)
 * - Multiple patterns with matchAll logic
 * - Detailed match location reporting
 * 
 * See REQUIREMENTS.md Section 25.2 and ARCHITECTURE.md Section 6.
 */

import { readFile } from 'node:fs/promises';
import type { Criterion, VerifierResult } from '../../types/tiers.js';

/**
 * Base Verifier interface.
 * All verifiers must implement this interface.
 */
export interface Verifier {
  readonly type: string;
  verify(criterion: Criterion): Promise<VerifierResult>;
}

/**
 * Regex-specific criterion options.
 */
export interface RegexCriterionOptions extends Record<string, unknown> {
  pattern: string | string[];
  flags?: string;
  mustMatch?: boolean;  // default true
  matchAll?: boolean;   // all patterns must match (default false)
}

/**
 * Regex criterion interface.
 * Extends Criterion with regex-specific options.
 */
export interface RegexCriterion extends Criterion {
  type: 'regex';
  target: string;  // File path
  options: RegexCriterionOptions;
}

/**
 * Match location information.
 */
export interface MatchLocation {
  line: number;
  column: number;
  match: string;
}

/**
 * Result of testing a single pattern.
 */
export interface MatchResult {
  pattern: string;
  matched: boolean;
  locations?: MatchLocation[];
}

/**
 * Regex Verifier implementation.
 * Checks file contents against regex patterns.
 */
export class RegexVerifier implements Verifier {
  readonly type = 'regex';

  /**
   * Verify a criterion by checking file contents against regex patterns.
   */
  async verify(criterion: Criterion): Promise<VerifierResult> {
    const startTime = Date.now();

    // Validate criterion type
    if (criterion.type !== 'regex') {
      return {
        type: this.type,
        target: criterion.target,
        passed: false,
        summary: `Invalid criterion type: expected 'regex', got '${criterion.type}'`,
        error: `Invalid criterion type: ${criterion.type}`,
        durationMs: Date.now() - startTime,
      };
    }

      const regexCriterion = criterion as unknown as RegexCriterion;

    // Validate options
    if (!regexCriterion.options || !regexCriterion.options.pattern) {
      return {
        type: this.type,
        target: regexCriterion.target,
        passed: false,
        summary: 'Missing required option: pattern',
        error: 'Missing required option: pattern',
        durationMs: Date.now() - startTime,
      };
    }

    try {
      // Read file content
      const content = await this.readFileContent(regexCriterion.target);

      // Normalize patterns to array
      const patterns = Array.isArray(regexCriterion.options.pattern)
        ? regexCriterion.options.pattern
        : [regexCriterion.options.pattern];

      // Get flags (default to empty string)
      const flags = regexCriterion.options.flags || '';

      // Get mustMatch (default to true)
      const mustMatch = regexCriterion.options.mustMatch ?? true;

      // Get matchAll (default to false)
      const matchAll = regexCriterion.options.matchAll ?? false;

      // Test each pattern
      const matchResults: MatchResult[] = [];
      for (const pattern of patterns) {
        const result = this.testPattern(content, pattern, flags);
        matchResults.push(result);
      }

      // Determine if verification passed
      const passed = this.evaluateResults(matchResults, mustMatch, matchAll);

      // Build summary
      const summary = this.formatMatchResult(matchResults, mustMatch, matchAll, passed);

      return {
        type: this.type,
        target: regexCriterion.target,
        passed,
        summary,
        durationMs: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        type: this.type,
        target: regexCriterion.target,
        passed: false,
        summary: `Error verifying file: ${errorMessage}`,
        error: errorMessage,
        durationMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Read file content from disk.
   */
  private async readFileContent(path: string): Promise<string> {
    try {
      const content = await readFile(path, 'utf-8');
      return content;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        throw new Error(`File not found: ${path}`);
      }
      throw error;
    }
  }

  /**
   * Test a pattern against content and extract match locations.
   */
  private testPattern(content: string, pattern: string, flags: string): MatchResult {
    try {
      // Ensure 'g' flag is present for matchAll to work
      const normalizedFlags = flags.includes('g') ? flags : flags + 'g';
      const regex = new RegExp(pattern, normalizedFlags);
      
      const matches = Array.from(content.matchAll(regex));

      const locations: MatchLocation[] = [];
      const lines = content.split(/\r?\n/);

      for (const match of matches) {
        if (match.index === undefined) continue;

        // Find line and column for this match
        let lineNum = 0;
        let columnNum = 0;
        let charCount = 0;

        for (let i = 0; i < lines.length; i++) {
          const lineLength = lines[i].length + 1; // +1 for newline
          if (charCount + lineLength > match.index) {
            lineNum = i;
            columnNum = match.index - charCount;
            break;
          }
          charCount += lineLength;
        }

        locations.push({
          line: lineNum + 1, // 1-indexed
          column: columnNum + 1, // 1-indexed
          match: match[0],
        });
      }

      return {
        pattern,
        matched: locations.length > 0,
        locations: locations.length > 0 ? locations : undefined,
      };
    } catch (error) {
      // Invalid regex pattern
      throw new Error(`Invalid regex pattern '${pattern}': ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Evaluate match results based on mustMatch and matchAll logic.
   */
  private evaluateResults(
    results: MatchResult[],
    mustMatch: boolean,
    matchAll: boolean
  ): boolean {
    if (matchAll) {
      // ALL patterns must satisfy their condition
      return results.every((result) => result.matched === mustMatch);
    } else {
      // ANY pattern satisfying its condition passes
      return results.some((result) => result.matched === mustMatch);
    }
  }

  /**
   * Format match results into a human-readable summary.
   */
  private formatMatchResult(
    results: MatchResult[],
    mustMatch: boolean,
    matchAll: boolean,
    passed: boolean
  ): string {
    const patternCount = results.length;
    const matchedCount = results.filter((r) => r.matched).length;
    const condition = mustMatch ? 'must match' : 'must not match';
    const logic = matchAll ? 'all' : 'any';

    if (passed) {
      if (patternCount === 1) {
        const result = results[0]!;
        if (result.locations && result.locations.length > 0) {
          const locationCount = result.locations.length;
          return `Pattern matched ${locationCount} time${locationCount === 1 ? '' : 's'} (${condition})`;
        }
        return `Pattern ${condition} (verified)`;
      } else {
        return `${matchedCount}/${patternCount} patterns ${condition} (${logic} required)`;
      }
    } else {
      if (patternCount === 1) {
        return `Pattern did not ${condition}`;
      } else {
        const failedCount = results.filter((r) => r.matched !== mustMatch).length;
        return `${failedCount}/${patternCount} patterns failed to ${condition} (${logic} required)`;
      }
    }
  }
}
