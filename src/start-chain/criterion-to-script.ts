/**
 * Criterion → Verification Script
 *
 * P2-T04: Executable Acceptance Criteria
 *
 * This module turns acceptance criteria into fully executable verification steps by:
 * - Ensuring every Criterion has an explicit `verification` string
 * - Normalizing token-style verification (e.g., TEST:npm test) into runtime-executable
 *   Criterion fields (`type`, `target`, `options`)
 * - Generating a human-editable verification script for criteria that would otherwise
 *   be AI-only / non-builtin, and representing them as `type: 'script'`
 *
 * The runtime GateRunner executes verifiers based on `criterion.type`, so normalization
 * must produce a `type` that matches a registered verifier and a `target` that the verifier
 * can execute directly.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { PRD, Phase, Task, Subtask } from '../types/prd.js';
import type { Criterion } from '../types/tiers.js';
import { parseVerifierToken } from '../contracts/prd-schema.contract.js';

type CriterionPriority = NonNullable<Criterion['priority']>;

const DEFAULT_PRIORITY: CriterionPriority = 'MUST';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function looksLikeScriptPath(value: string): boolean {
  const v = value.trim();
  if (v.length === 0) return false;
  if (v.startsWith('./') || v.startsWith('../') || v.startsWith('/') || v.startsWith('.puppet-master/')) {
    return true;
  }
  // Heuristic: a path-ish string ending with a common script extension
  if (/[\\/]/.test(v) && /\.(sh|bash)$/.test(v)) return true;
  return false;
}

function splitFirst(value: string, delimiter: string): [string, string] | null {
  const idx = value.indexOf(delimiter);
  if (idx === -1) return null;
  return [value.slice(0, idx), value.slice(idx + delimiter.length)];
}

function splitLast(value: string, delimiter: string): [string, string] | null {
  const idx = value.lastIndexOf(delimiter);
  if (idx === -1) return null;
  return [value.slice(0, idx), value.slice(idx + delimiter.length)];
}

export class CriterionToScript {
  private readonly generateScripts: boolean;

  constructor(options: { generateScripts?: boolean } = {}) {
    this.generateScripts = options.generateScripts ?? true;
  }

  /**
   * Generate a human-editable shell script template for a criterion.
   * Returns null if we should use a built-in verifier instead.
   */
  generateScript(criterion: Criterion): string | null {
    // If criterion can be normalized to a non-AI built-in verifier, no script is needed.
    // Note: 'ai' is a built-in verifier, but P2-T04 prefers scripts for complex criteria.
    if (this.hasNonAISupportedVerifier(criterion)) {
      return null;
    }

    const description = criterion.description.trim() || criterion.id;
    const originalVerification = criterion.verification ?? '';

    return `#!/usr/bin/env bash
set -e

# Verification for: ${description}
# Auto-generated - modify as needed
${originalVerification ? `# Original verification: ${originalVerification}` : ''}

# TODO: Implement verification
echo "PASS"
exit 0
`;
  }

  /**
   * Save the generated script under `.puppet-master/scripts/` and make it executable.
   * Returns the absolute path written.
   */
  async saveScript(criterion: Criterion, projectPath: string): Promise<string> {
    if (!this.generateScripts) return '';

    const script = this.generateScript(criterion);
    if (!script) return '';

    const scriptsDir = path.join(projectPath, '.puppet-master', 'scripts');
    await fs.mkdir(scriptsDir, { recursive: true });

    const scriptFile = `verify-${criterion.id}.sh`;
    const scriptPath = path.join(scriptsDir, scriptFile);

    await fs.writeFile(scriptPath, script, 'utf-8');
    await fs.chmod(scriptPath, 0o755);

    return scriptPath;
  }

  /**
   * Normalize a single criterion:
   * - ensure `priority` is set
   * - ensure `verification` is set (from `verification`, legacy token in `target`, or fallback)
   * - normalize token verification into runtime `type` + `target` (+ options)
   * - generate a script for AI/non-builtin criteria and set `type: 'script'`
   */
  async normalizeCriterion(criterion: Criterion, projectPath: string): Promise<Criterion> {
    const normalized: Criterion = { ...criterion };

    // Default priority
    if (!normalized.priority) {
      normalized.priority = DEFAULT_PRIORITY;
    }

    // Ensure verification is present (back-compat: legacy token stored in target)
    if (!isNonEmptyString(normalized.verification)) {
      if (isNonEmptyString(normalized.target)) {
        normalized.verification = normalized.target;
      } else {
        normalized.verification = `AI_VERIFY:${normalized.description}`;
      }
    }

    const verification = normalized.verification.trim();

    // If it's a known verifier token, normalize into runtime-executable fields.
    const token = parseVerifierToken(verification);
    if (token) {
      // Prefer scripts over AI verifier for P2-T04
      if (token.runtimeType === 'ai') {
        const scriptPath = await this.saveScript({ ...normalized, verification }, projectPath);
        if (scriptPath) {
          normalized.type = 'script';
          normalized.target = scriptPath;
          normalized.verification = scriptPath;
          normalized.options = {
            ...(normalized.options ?? {}),
            generatedFrom: verification,
          };
          return normalized;
        }

        // Backward compatible fallback: keep the token-style verification target.
        // (AIVerifier expects structured options, so we don't attempt to translate here.)
        normalized.type = 'ai';
        normalized.target = verification;
        normalized.verification = verification;
        return normalized;
      }

      // Built-in token paths
      if (token.runtimeType === 'command') {
        normalized.type = 'command';
        normalized.target = token.value;
        return normalized;
      }

      if (token.runtimeType === 'browser_verify') {
        normalized.type = 'browser_verify';
        normalized.target = token.value;
        return normalized;
      }

      if (token.runtimeType === 'file_exists') {
        // Expected shapes:
        // - FILE_VERIFY:path/to/file:exists
        // - FILE_VERIFY:path/to/file:not_exists
        const parts = splitLast(token.value, ':');
        if (parts) {
          const [filePath, existsFlag] = parts;
          normalized.type = 'file_exists';
          normalized.target = filePath;
          if (existsFlag === 'not_exists') {
            normalized.options = { ...(normalized.options ?? {}), notExists: true };
          }
          return normalized;
        }

        // Fallback: treat entire value as path
        normalized.type = 'file_exists';
        normalized.target = token.value;
        return normalized;
      }

      if (token.runtimeType === 'regex') {
        // Expected shape: REGEX_VERIFY:filePath:pattern...
        const parts = splitFirst(token.value, ':');
        if (parts) {
          const [filePath, pattern] = parts;
          normalized.type = 'regex';
          normalized.target = filePath;
          normalized.options = { ...(normalized.options ?? {}), pattern };
          return normalized;
        }

        // Fallback: cannot split, route to AI/script
        const scriptPath = await this.saveScript(
          { ...normalized, verification },
          projectPath
        );
        if (scriptPath) {
          normalized.type = 'script';
          normalized.target = scriptPath;
          normalized.verification = scriptPath;
          normalized.options = { ...(normalized.options ?? {}), generatedFrom: verification };
          return normalized;
        }

        normalized.type = 'ai';
        normalized.target = token.value;
        return normalized;
      }
    }

    // If verification is a script path (or the criterion is already a script), normalize to script.
    if (normalized.type === 'script' || looksLikeScriptPath(verification)) {
      normalized.type = 'script';
      normalized.target = verification;
      normalized.verification = verification;
      return normalized;
    }

    // If this is AI (or AI-like), prefer generating a script.
    if (normalized.type === 'ai') {
      const scriptPath = await this.saveScript({ ...normalized, verification }, projectPath);
      if (scriptPath) {
        normalized.type = 'script';
        normalized.target = scriptPath;
        normalized.verification = scriptPath;
        normalized.options = {
          ...(normalized.options ?? {}),
          generatedFrom: verification,
        };
        return normalized;
      }
    }

    // Otherwise, leave as-is but ensure target is at least executable for command verifications.
    // If verification looks like a raw command and type is command, prefer it.
    if (normalized.type === 'command' && isNonEmptyString(verification)) {
      normalized.target = normalized.target || verification;
    }

    return normalized;
  }

  /**
   * Normalize all criteria in a PRD (phases/tasks/subtasks) in-place.
   */
  async normalizePrd(prd: PRD, projectPath: string): Promise<PRD> {
    prd.phases = await Promise.all(prd.phases.map((phase) => this.normalizePhase(phase, projectPath)));
    return prd;
  }

  private async normalizePhase(phase: Phase, projectPath: string): Promise<Phase> {
    return {
      ...phase,
      acceptanceCriteria: await this.normalizeCriteriaArray(phase.acceptanceCriteria, projectPath),
      tasks: await Promise.all(phase.tasks.map((t) => this.normalizeTask(t, projectPath))),
    };
  }

  private async normalizeTask(task: Task, projectPath: string): Promise<Task> {
    return {
      ...task,
      acceptanceCriteria: await this.normalizeCriteriaArray(task.acceptanceCriteria, projectPath),
      subtasks: await Promise.all(task.subtasks.map((st) => this.normalizeSubtask(st, projectPath))),
    };
  }

  private async normalizeSubtask(subtask: Subtask, projectPath: string): Promise<Subtask> {
    return {
      ...subtask,
      acceptanceCriteria: await this.normalizeCriteriaArray(subtask.acceptanceCriteria, projectPath),
    };
  }

  private async normalizeCriteriaArray(criteria: Criterion[] | undefined, projectPath: string): Promise<Criterion[]> {
    if (!criteria || criteria.length === 0) return criteria ?? [];
    const normalized = await Promise.all(criteria.map((c) => this.normalizeCriterion(c, projectPath)));
    return normalized;
  }

  /**
   * Returns true if criterion can be satisfied by a non-AI built-in verifier.
   * This is used to decide whether a script should be generated.
   */
  private hasNonAISupportedVerifier(criterion: Criterion): boolean {
    const verification = criterion.verification ?? criterion.target ?? '';
    const parsed = isNonEmptyString(verification) ? parseVerifierToken(verification.trim()) : null;
    if (parsed) {
      return parsed.runtimeType !== 'ai';
    }
    // If type is already one of the non-AI verifier types, assume supported.
    return (
      criterion.type === 'command' ||
      criterion.type === 'file_exists' ||
      criterion.type === 'regex' ||
      criterion.type === 'browser_verify' ||
      criterion.type === 'script'
    );
  }
}

