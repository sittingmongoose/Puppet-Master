/**
 * GateEnforcer class for enforcing AGENTS.md rules during gate verification
 * 
 * Checks agent output against DO and DON'T rules from AGENTS.md files
 * and returns violations with actionable error messages.
 * 
 * See REQUIREMENTS.md Section 24.6 (Enforcement Mechanism) and
 * BUILD_QUEUE_PHASE_8.md PH8-T04.
 */

import type { AgentsDocument } from './multi-level-loader.js';

/**
 * Result of enforcement check
 */
export interface EnforcementResult {
  /** Whether all rules passed */
  passed: boolean;
  /** List of violations found */
  violations: Violation[];
  /** Human-readable summary */
  summary: string;
}

/**
 * A single rule violation
 */
export interface Violation {
  /** Type of violation: 'dont' (violated DON'T rule) or 'do' (missing DO compliance) */
  type: 'dont' | 'do';
  /** The rule text that was violated */
  rule: string;
  /** Context snippet showing where violation occurred */
  context: string;
  /** Line number where violation was found (if applicable) */
  lineNumber?: number;
  /** Suggested fix (if applicable) */
  suggestion?: string;
}

/**
 * GateEnforcer class
 * 
 * Validates agent output against AGENTS.md DO and DON'T rules.
 */
export class GateEnforcer {
  /**
   * Create a new GateEnforcer instance
   */
  constructor() {}

  /**
   * Check agent output against AGENTS.md rules
   * @param output - Agent output to check (code, commands, explanations)
   * @param agentsDoc - Merged AGENTS.md document with DO/DON'T rules
   * @returns Enforcement result with violations
   */
  async check(output: string, agentsDoc: AgentsDocument): Promise<EnforcementResult> {
    const violations: Violation[] = [];

    // Check DON'T rules
    const dontViolations = this.checkDontRules(output, agentsDoc.dontItems);
    violations.push(...dontViolations);

    // Check DO rules
    const doViolations = this.checkDoRules(output, agentsDoc.doItems);
    violations.push(...doViolations);

    const passed = violations.length === 0;
    const summary = this.generateSummary(violations);

    return {
      passed,
      violations,
      summary,
    };
  }

  /**
   * Check output against DON'T rules
   * @param output - Agent output to check
   * @param dontItems - Array of DON'T rule strings
   * @returns Array of violations
   */
  private checkDontRules(output: string, dontItems: string[]): Violation[] {
    const violations: Violation[] = [];

    if (!output || dontItems.length === 0) {
      return violations;
    }

    const lines = output.split('\n');

    for (const rule of dontItems) {
      // Clean rule text (remove emoji, markdown formatting)
      const cleanRule = this.cleanRuleText(rule);
      const lowerRule = cleanRule.toLowerCase();

      // Special handling for missing .js extension in imports
      if (lowerRule.includes('omit') && lowerRule.includes('.js') && lowerRule.includes('import')) {
        const importViolations = this.checkMissingJsExtension(lines);
        violations.push(...importViolations.map(v => ({ ...v, rule: cleanRule })));
        continue;
      }

      // Extract keywords/patterns from rule
      const patterns = this.extractDontPatterns(cleanRule);

      for (const pattern of patterns) {
        // Check each line for violations
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (this.matchPattern(line, pattern)) {
            const context = this.extractContext(lines, i, 3);
            const suggestion = this.generateSuggestion(cleanRule, pattern);

            violations.push({
              type: 'dont',
              rule: cleanRule,
              context,
              lineNumber: i + 1,
              suggestion,
            });

            // Only report first violation per rule
            break;
          }
        }
      }
    }

    return violations;
  }

  /**
   * Check for missing .js extension in local imports
   * @param lines - Array of lines to check
   * @returns Array of violations
   */
  private checkMissingJsExtension(lines: string[]): Violation[] {
    const violations: Violation[] = [];
    // Match: from './path' or from "../path" (local imports)
    const importRegex = /from\s+['"](\.\.?\/[^'"]+)['"]/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match: RegExpExecArray | null;

      // Reset regex lastIndex for each line
      importRegex.lastIndex = 0;

      while ((match = importRegex.exec(line)) !== null) {
        const importPath = match[1];
        
        // Skip if it's a directory import (ends with /)
        if (importPath.endsWith('/')) {
          continue;
        }

        // Check if it already has .js extension
        if (importPath.endsWith('.js') || importPath.endsWith('.js"') || importPath.endsWith(".js'")) {
          continue;
        }

        // If it doesn't end with .js, it's a violation
        // (whether it has no extension or has a different extension like .ts)
        const context = this.extractContext(lines, i, 3);
        violations.push({
          type: 'dont',
          rule: 'Omit .js extension in imports',
          context,
          lineNumber: i + 1,
          suggestion: "Add '.js' extension to local imports (e.g., 'from ./file.js')",
        });
      }
    }

    return violations;
  }

  /**
   * Check output against DO rules
   * @param output - Agent output to check
   * @param doItems - Array of DO rule strings
   * @returns Array of violations (missing compliance)
   */
  private checkDoRules(output: string, doItems: string[]): Violation[] {
    const violations: Violation[] = [];

    if (!output || doItems.length === 0) {
      return violations;
    }

    const lines = output.split('\n');

    for (const rule of doItems) {
      // Clean rule text (remove emoji, markdown formatting)
      const cleanRule = this.cleanRuleText(rule);

      // Extract required patterns from rule
      const requiredPatterns = this.extractDoPatterns(cleanRule);

      // Check if any required pattern is present
      let found = false;
      for (const pattern of requiredPatterns) {
        if (this.matchPattern(output, pattern)) {
          found = true;
          break;
        }
      }

      // If rule requires something but it's not found, it's a violation
      // But only if the rule is about something that should be present in code
      if (!found && this.isCodeRule(cleanRule)) {
        const context = this.extractContext(lines, 0, 5);
        const suggestion = this.generateDoSuggestion(cleanRule);

        violations.push({
          type: 'do',
          rule: cleanRule,
          context,
          suggestion,
        });
      }
    }

    return violations;
  }

  /**
   * Clean rule text by removing emojis and markdown formatting
   * @param rule - Raw rule text
   * @returns Cleaned rule text
   */
  private cleanRuleText(rule: string): string {
    return rule
      .replace(/^[✅❌]\s*/, '') // Remove leading emoji
      .replace(/^-\s*/, '') // Remove leading dash
      .trim();
  }

  /**
   * Extract patterns to check from DON'T rule
   * @param rule - DON'T rule text
   * @returns Array of patterns to match
   */
  private extractDontPatterns(rule: string): string[] {
    const patterns: string[] = [];
    const lowerRule = rule.toLowerCase();

    // Common patterns based on AGENTS.md rules
    if (lowerRule.includes('jest') && (lowerRule.includes('pattern') || lowerRule.includes('use'))) {
      patterns.push('jest.fn()', 'jest.mock(', 'jest.spyOn(', 'from \'@jest/globals\'', 'from "@jest/globals"');
    }

    // Note: Missing .js extension is checked separately in checkDontRules
    // because we need to verify the import path doesn't end with .js

    if (lowerRule.includes('import') && lowerRule.includes('platform') && lowerRule.includes('type')) {
      patterns.push("import { Platform }", "import { Platform } from");
    }

    if (lowerRule.includes('reuse') && (lowerRule.includes('session') || lowerRule.includes('process'))) {
      patterns.push('session.reuse', 'reuseSession', 'resumeSession');
    }

    if (lowerRule.includes('thread') && lowerRule.includes('terminology')) {
      patterns.push('Thread-', 'thread-', 'Thread_', 'thread_');
    }

    if (lowerRule.includes('api') && lowerRule.includes('call')) {
      patterns.push('fetch(', 'axios.', 'http.request(', 'https.request(');
    }

    if (lowerRule.includes('exec()') && lowerRule.includes('spawn')) {
      patterns.push('exec(', 'child_process.exec(');
    }

    if (lowerRule.includes('blanket') && lowerRule.includes('*.log')) {
      patterns.push('*.log', '**/*.log');
    }

    // If no specific patterns found, try to extract keywords
    if (patterns.length === 0) {
      const keywords = this.extractKeywords(rule);
      patterns.push(...keywords);
    }

    return patterns;
  }

  /**
   * Extract required patterns from DO rule
   * @param rule - DO rule text
   * @returns Array of patterns that should be present
   */
  private extractDoPatterns(rule: string): string[] {
    const patterns: string[] = [];
    const lowerRule = rule.toLowerCase();

    // Common patterns based on AGENTS.md rules
    if (lowerRule.includes('.js') && lowerRule.includes('import')) {
      patterns.push("from './", "from '../", "from './", "from '../");
      // We'll check these more carefully - they should have .js
    }

    if (lowerRule.includes('vitest') && lowerRule.includes('test')) {
      patterns.push("from 'vitest'", 'from "vitest"', 'vi.fn()', 'vi.mock(');
    }

    if (lowerRule.includes('import type') && lowerRule.includes('export type')) {
      patterns.push('import type', 'export type');
    }

    if (lowerRule.includes('session id') && lowerRule.includes('pm-')) {
      patterns.push('PM-', 'pm-');
    }

    if (lowerRule.includes('spawn') && lowerRule.includes('process')) {
      patterns.push('spawn(', 'child_process.spawn(');
    }

    // If no specific patterns found, try to extract keywords
    if (patterns.length === 0) {
      const keywords = this.extractKeywords(rule);
      patterns.push(...keywords);
    }

    return patterns;
  }

  /**
   * Extract keywords from rule text
   * @param rule - Rule text
   * @returns Array of keyword patterns
   */
  private extractKeywords(rule: string): string[] {
    // Extract quoted strings, function names, etc.
    const keywords: string[] = [];
    const quoted = rule.match(/['"`]([^'"`]+)['"`]/g);
    if (quoted) {
      keywords.push(...quoted.map(q => q.slice(1, -1)));
    }

    // Extract function calls (e.g., "use vi.fn()" -> "vi.fn()")
    const functionCalls = rule.match(/\b\w+\.\w+\(\)/g);
    if (functionCalls) {
      keywords.push(...functionCalls);
    }

    return keywords;
  }

  /**
   * Check if a rule is about code that should be present
   * @param rule - Rule text
   * @returns True if rule requires code patterns
   */
  private isCodeRule(rule: string): boolean {
    const lowerRule = rule.toLowerCase();
    // Rules about code patterns, not just process/behavior
    return (
      lowerRule.includes('import') ||
      lowerRule.includes('export') ||
      lowerRule.includes('.js') ||
      lowerRule.includes('vitest') ||
      lowerRule.includes('spawn') ||
      lowerRule.includes('type')
    );
  }

  /**
   * Match pattern against content (case-insensitive)
   * @param content - Content to search
   * @param pattern - Pattern to match
   * @returns True if pattern found
   */
  private matchPattern(content: string, pattern: string): boolean {
    // Case-insensitive search
    return content.toLowerCase().includes(pattern.toLowerCase());
  }

  /**
   * Extract context around a line number
   * @param lines - Array of lines
   * @param lineIndex - Index of the line
   * @param contextLines - Number of lines before/after to include
   * @returns Context snippet
   */
  private extractContext(lines: string[], lineIndex: number, contextLines: number): string {
    const start = Math.max(0, lineIndex - contextLines);
    const end = Math.min(lines.length, lineIndex + contextLines + 1);
    const context = lines.slice(start, end);

    // Add line numbers
    return context
      .map((line, idx) => {
        const actualLineNum = start + idx + 1;
        return `${actualLineNum}: ${line}`;
      })
      .join('\n');
  }

  /**
   * Generate suggestion for DON'T violation
   * @param rule - Rule text
   * @param pattern - Pattern that was found
   * @returns Suggestion string
   */
  private generateSuggestion(rule: string, pattern: string): string | undefined {
    const lowerRule = rule.toLowerCase();

    if (lowerRule.includes('jest') && pattern.includes('jest')) {
      return "Use 'vi.fn()' from vitest instead of 'jest.fn()'";
    }

    if (lowerRule.includes('.js') && lowerRule.includes('import')) {
      return "Add '.js' extension to local imports (e.g., 'from ./file.js')";
    }

    if (lowerRule.includes('import') && lowerRule.includes('platform') && lowerRule.includes('type')) {
      return "Use 'import type { Platform }' instead of 'import { Platform }'";
    }

    if (lowerRule.includes('exec()')) {
      return "Use 'spawn()' instead of 'exec()' for process spawning";
    }

    if (lowerRule.includes('thread')) {
      return "Use 'Session' terminology instead of 'Thread'";
    }

    return undefined;
  }

  /**
   * Generate suggestion for DO violation
   * @param rule - Rule text
   * @returns Suggestion string
   */
  private generateDoSuggestion(rule: string): string | undefined {
    const lowerRule = rule.toLowerCase();

    if (lowerRule.includes('.js') && lowerRule.includes('import')) {
      return "Add '.js' extension to all local imports";
    }

    if (lowerRule.includes('vitest')) {
      return "Use Vitest for testing (import from 'vitest')";
    }

    if (lowerRule.includes('import type')) {
      return "Use 'import type' and 'export type' for type aliases";
    }

    if (lowerRule.includes('session id')) {
      return "Use Session ID format 'PM-YYYY-MM-DD-HH-MM-SS-NNN'";
    }

    if (lowerRule.includes('spawn')) {
      return "Use 'spawn()' for process spawning";
    }

    return undefined;
  }

  /**
   * Generate human-readable summary
   * @param violations - Array of violations
   * @returns Summary string
   */
  private generateSummary(violations: Violation[]): string {
    if (violations.length === 0) {
      return 'All AGENTS.md rules passed.';
    }

    const dontCount = violations.filter(v => v.type === 'dont').length;
    const doCount = violations.filter(v => v.type === 'do').length;

    const parts: string[] = [];
    parts.push(`Found ${violations.length} AGENTS.md rule violation(s):`);

    if (dontCount > 0) {
      parts.push(`- ${dontCount} DON'T rule violation(s)`);
    }

    if (doCount > 0) {
      parts.push(`- ${doCount} missing DO compliance(s)`);
    }

    parts.push('');
    parts.push('Violations:');

    for (const violation of violations) {
      const typeLabel = violation.type === 'dont' ? 'DON\'T' : 'DO';
      const lineInfo = violation.lineNumber ? ` (line ${violation.lineNumber})` : '';
      parts.push(`- [${typeLabel}] ${violation.rule}${lineInfo}`);
      if (violation.suggestion) {
        parts.push(`  → ${violation.suggestion}`);
      }
    }

    return parts.join('\n');
  }

  /**
   * Check if AGENTS.md update was required but not provided.
   * Parses gate response JSON to check agents_update_required flag.
   * 
   * @param gateResponse - JSON response from gate reviewer
   * @returns Violation if update was required but not provided, null otherwise
   */
  checkAgentsUpdateRequired(gateResponse: string): Violation | null {
    try {
      // Extract JSON from response (may be wrapped in markdown code block)
      const jsonMatch = gateResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : gateResponse.trim();
      
      const parsed = JSON.parse(jsonStr);
      
      // Check if agents_update_required is true
      if (parsed.agents_update_required === true) {
        // Check if agents_update_content is provided and non-empty
        const hasContent = parsed.agents_update_content && 
          typeof parsed.agents_update_content === 'string' && 
          parsed.agents_update_content.trim().length > 0;
        
        if (!hasContent) {
          return {
            type: 'do',
            rule: 'AGENTS.md update required but not provided',
            context: 'agents_update_required: true, but agents_update_content is missing or empty',
            suggestion: 'Provide agents_update_content with the learnings to add to AGENTS.md',
          };
        }
      }
      
      return null;
    } catch {
      // If JSON parsing fails, assume no violation (can't enforce)
      return null;
    }
  }
}
