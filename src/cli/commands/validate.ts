/**
 * Validate command - Validate project configuration and state files
 * 
 * Implements the `puppet-master validate` command that:
 * - Validates config.yaml against schema
 * - Validates prd.json structure
 * - Validates AGENTS.md format
 * - Reports all errors (not just first)
 * - Supports --fix flag (reports what could be fixed)
 * - Supports --json output format
 * - Supports --target to filter validation scope
 * 
 * Per BUILD_QUEUE_PHASE_10.md PH10-T08 (CLI Validate Command).
 */

import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { ConfigValidationError } from '../../config/config-schema.js';
import { PrdManager } from '../../memory/prd-manager.js';
import { ValidationGate } from '../../start-chain/validation-gate.js';
import type { ValidationResult as GateValidationResult } from '../../start-chain/validation-gate.js';
import { AgentsManager } from '../../memory/agents-manager.js';
import { existsSync } from 'fs';
import { join } from 'path';
import type { CommandModule } from './index.js';

/**
 * Options for the validate command
 */
export interface ValidateOptions {
  /** Path to config file */
  config?: string;
  /** What to validate: 'all' | 'config' | 'prd' | 'agents' */
  target?: 'all' | 'config' | 'prd' | 'agents';
  /** Attempt auto-repair */
  fix?: boolean;
  /** JSON output format */
  json?: boolean;
  /** Detailed output */
  verbose?: boolean;
}

/**
 * Validation error interface
 */
export interface ValidationError {
  code: string;
  message: string;
  path?: string;
  suggestion?: string;
}

/**
 * Validation warning interface
 */
export interface ValidationWarning {
  code: string;
  message: string;
  suggestion?: string;
}

/**
 * Validation result for a single file
 */
export interface ValidateResult {
  file: string;
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  fixed?: boolean;
}

/**
 * Overall validation summary
 */
export interface ValidationSummary {
  valid: boolean;
  results: ValidateResult[];
}

/**
 * Validate config.yaml using ConfigManager
 */
async function validateConfig(
  configPath?: string
): Promise<ValidateResult> {
  const result: ValidateResult = {
    file: 'config.yaml',
    valid: true,
    errors: [],
    warnings: [],
  };

  try {
    const configManager = new ConfigManager(configPath);
    const config = await configManager.load();
    
    // Validate the loaded config
    try {
      configManager.validate(config);
      // Config is valid
    } catch (error) {
      result.valid = false;
      if (error instanceof ConfigValidationError) {
        result.errors.push({
          code: 'CONFIG_VALIDATION_ERROR',
          message: error.message,
          path: error.path.join('.'),
          suggestion: 'Check the configuration schema in REQUIREMENTS.md',
        });
      } else {
        result.errors.push({
          code: 'CONFIG_UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : String(error),
          suggestion: 'Check config.yaml syntax and structure',
        });
      }
    }
  } catch (error) {
    result.valid = false;
    result.errors.push({
      code: 'CONFIG_LOAD_ERROR',
      message: error instanceof Error ? error.message : String(error),
      suggestion: 'Ensure config.yaml exists and is readable',
    });
  }

  return result;
}

/**
 * Validate prd.json using PrdManager and ValidationGate
 */
async function validatePrd(
  configPath?: string
): Promise<ValidateResult> {
  const result: ValidateResult = {
    file: 'prd.json',
    valid: true,
    errors: [],
    warnings: [],
  };

  try {
    // Load config to get PRD path
    const configManager = new ConfigManager(configPath);
    const config = await configManager.load();
    const prdPath = config.memory.prdFile;

    // Load PRD
    const prdManager = new PrdManager(prdPath);
    const prd = await prdManager.load();

    // Validate PRD structure using ValidationGate
    const validationGate = new ValidationGate();
    const gateResult: GateValidationResult = validationGate.validatePrd(prd);

    // Convert ValidationGate result to ValidateResult format
    result.valid = gateResult.valid;
    result.errors = gateResult.errors.map((err) => ({
      code: err.code,
      message: err.message,
      path: err.path,
      suggestion: err.suggestion,
    }));
    result.warnings = gateResult.warnings.map((warn) => ({
      code: warn.code,
      message: warn.message,
      suggestion: warn.suggestion,
    }));
  } catch (error) {
    result.valid = false;
    if (error instanceof Error && error.message.includes('ENOENT')) {
      result.errors.push({
        code: 'PRD_NOT_FOUND',
        message: `PRD file not found at expected location`,
        suggestion: 'Run `puppet-master init` to create a PRD',
      });
    } else {
      result.errors.push({
        code: 'PRD_LOAD_ERROR',
        message: error instanceof Error ? error.message : String(error),
        suggestion: 'Check prd.json syntax and structure',
      });
    }
  }

  return result;
}

/**
 * Validate AGENTS.md using AgentsManager
 */
async function validateAgents(
  configPath?: string
): Promise<ValidateResult> {
  const result: ValidateResult = {
    file: 'AGENTS.md',
    valid: true,
    errors: [],
    warnings: [],
  };

  try {
    // Load config to get project root
    const configManager = new ConfigManager(configPath);
    const config = await configManager.load();
    const projectRoot = config.project.workingDirectory || process.cwd();

    // Check if root AGENTS.md exists (required per STATE_FILES.md)
    const agentsPath = join(projectRoot, 'AGENTS.md');
    if (!existsSync(agentsPath)) {
      result.valid = false;
      result.errors.push({
        code: 'AGENTS_NOT_FOUND',
        message: 'Root AGENTS.md file not found',
        path: agentsPath,
        suggestion: 'Create AGENTS.md in project root per STATE_FILES.md Section 3.2',
      });
      return result;
    }

    // Load and parse AGENTS.md using AgentsManager
    const agentsManager = new AgentsManager({
      rootPath: agentsPath,
      multiLevelEnabled: config.memory.multiLevelAgents || false,
      modulePattern: 'src/*/AGENTS.md',
      phasePattern: '.puppet-master/agents/phase-*.md',
      taskPattern: '.puppet-master/agents/task-*.md',
      projectRoot,
    });

    try {
      const agentsContent = await agentsManager.loadFile(agentsPath, 'root');
      const sections = agentsContent.sections;

      // Validate required sections exist
      // Overview is required
      if (!sections.overview || sections.overview.trim() === '') {
        result.warnings.push({
          code: 'AGENTS_MISSING_OVERVIEW',
          message: 'Project Overview section is missing or empty',
          suggestion: 'Add a Project Overview section describing the project',
        });
      }

      // Architecture Notes (optional but recommended)
      if (sections.architectureNotes.length === 0) {
        result.warnings.push({
          code: 'AGENTS_MISSING_ARCHITECTURE',
          message: 'Architecture Notes section is missing',
          suggestion: 'Consider adding Architecture Notes section for reusable patterns',
        });
      }

      // Codebase Patterns (optional but recommended)
      if (sections.codebasePatterns.length === 0) {
        result.warnings.push({
          code: 'AGENTS_MISSING_PATTERNS',
          message: 'Codebase Patterns section is missing',
          suggestion: 'Consider adding Codebase Patterns section for reusable patterns',
        });
      }

      // Common Failure Modes (optional but recommended)
      if (sections.commonFailureModes.length === 0) {
        result.warnings.push({
          code: 'AGENTS_MISSING_FAILURE_MODES',
          message: 'Common Failure Modes section is missing',
          suggestion: 'Consider adding Common Failure Modes section to document known issues',
        });
      }

      // DO/DON'T sections (optional but recommended)
      if (sections.doItems.length === 0 && sections.dontItems.length === 0) {
        result.warnings.push({
          code: 'AGENTS_MISSING_DO_DONT',
          message: 'DO and DON\'T sections are missing',
          suggestion: 'Consider adding DO and DON\'T sections for best practices',
        });
      }

      // Check if content is too short (might be empty or malformed)
      if (agentsContent.content.trim().length < 100) {
        result.warnings.push({
          code: 'AGENTS_CONTENT_TOO_SHORT',
          message: 'AGENTS.md content appears to be very short',
          suggestion: 'Ensure AGENTS.md contains sufficient documentation per STATE_FILES.md',
        });
      }
    } catch (error) {
      result.valid = false;
      result.errors.push({
        code: 'AGENTS_PARSE_ERROR',
        message: error instanceof Error ? error.message : String(error),
        suggestion: 'Check AGENTS.md markdown syntax and structure',
      });
    }
  } catch (error) {
    result.valid = false;
    result.errors.push({
      code: 'AGENTS_LOAD_ERROR',
      message: error instanceof Error ? error.message : String(error),
      suggestion: 'Check AGENTS.md file accessibility and permissions',
    });
  }

  return result;
}

/**
 * Format validation results as human-readable output
 */
function formatHumanReadable(summary: ValidationSummary): string {
  const lines: string[] = [];

  for (const result of summary.results) {
    lines.push(`Validating ${result.file}...`);

    if (result.valid && result.errors.length === 0 && result.warnings.length === 0) {
      lines.push('✓ Valid\n');
    } else if (result.valid && result.warnings.length > 0) {
      lines.push('⚠ Valid with warnings\n');
    } else {
      lines.push('✗ Invalid\n');
    }

    // Display errors
    for (const error of result.errors) {
      lines.push(`  Error: ${error.code} - ${error.message}`);
      if (error.path) {
        lines.push(`    Path: ${error.path}`);
      }
      if (error.suggestion) {
        lines.push(`    Suggestion: ${error.suggestion}`);
      }
      lines.push('');
    }

    // Display warnings
    for (const warning of result.warnings) {
      lines.push(`  Warning: ${warning.code} - ${warning.message}`);
      if (warning.suggestion) {
        lines.push(`    Suggestion: ${warning.suggestion}`);
      }
      lines.push('');
    }

    // Display fix status if --fix was attempted
    if (result.fixed !== undefined) {
      if (result.fixed) {
        lines.push('  ✓ Auto-fixed\n');
      } else {
        lines.push('  ⚠ Could not auto-fix (manual intervention required)\n');
      }
    }
  }

  // Summary
  const totalErrors = summary.results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = summary.results.reduce((sum, r) => sum + r.warnings.length, 0);
  const allValid = summary.results.every((r) => r.valid && r.errors.length === 0);

  lines.push('---');
  lines.push(`Summary: ${allValid ? 'All valid' : `${totalErrors} error(s), ${totalWarnings} warning(s)`}`);

  return lines.join('\n');
}

/**
 * Format validation results as JSON output
 */
function formatJSON(summary: ValidationSummary): string {
  return JSON.stringify(summary, null, 2);
}

/**
 * Attempt to fix validation issues (placeholder for future implementation)
 */
async function attemptFixes(
  results: ValidateResult[],
  _options: ValidateOptions
): Promise<ValidateResult[]> {
  // For now, --fix flag reports what could be fixed but doesn't actually fix
  // This is because auto-fixing config/PRD is too risky
  const fixedResults = results.map((result) => {
    if (result.errors.length === 0) {
      return { ...result, fixed: true };
    }

    // Report what could potentially be fixed
    const fixableErrors = result.errors.filter((err) => {
      // Config and PRD errors are generally not auto-fixable
      if (result.file === 'config.yaml' || result.file === 'prd.json') {
        return false;
      }
      // AGENTS.md could potentially have some auto-fixable issues
      if (result.file === 'AGENTS.md') {
        return err.code.startsWith('AGENTS_MISSING_');
      }
      return false;
    });

    if (fixableErrors.length > 0) {
      result.warnings.push({
        code: 'AUTO_FIX_AVAILABLE',
        message: `${fixableErrors.length} issue(s) could potentially be auto-fixed`,
        suggestion: 'Manual review recommended before auto-fixing',
      });
    }

    return { ...result, fixed: false };
  });

  return fixedResults;
}

/**
 * Main validate action function
 */
export async function validateAction(options: ValidateOptions): Promise<void> {
  try {
    const target = options.target || 'all';
    const results: ValidateResult[] = [];

    // Determine which validators to run
    const shouldValidateConfig = target === 'all' || target === 'config';
    const shouldValidatePrd = target === 'all' || target === 'prd';
    const shouldValidateAgents = target === 'all' || target === 'agents';

    // Run validators
    if (shouldValidateConfig) {
      results.push(await validateConfig(options.config));
    }

    if (shouldValidatePrd) {
      results.push(await validatePrd(options.config));
    }

    if (shouldValidateAgents) {
      results.push(await validateAgents(options.config));
    }

    // Attempt fixes if --fix flag is set
    let finalResults = results;
    if (options.fix) {
      finalResults = await attemptFixes(results, options);
    }

    // Create summary
    const summary: ValidationSummary = {
      valid: finalResults.every((r) => r.valid && r.errors.length === 0),
      results: finalResults,
    };

    // Output results
    if (options.json) {
      console.log(formatJSON(summary));
    } else {
      console.log(formatHumanReadable(summary));
    }

    // Exit with appropriate code
    if (summary.valid) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running validation:', errorMessage);
    
    if (options.verbose && error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

/**
 * ValidateCommand class implementing CommandModule interface
 */
export class ValidateCommand implements CommandModule {
  /**
   * Register the validate command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('validate')
      .description('Validate project configuration and state files')
      .option('-c, --config <path>', 'Path to config file')
      .option('--target <type>', 'What to validate: all, config, prd, agents', 'all')
      .option('--fix', 'Attempt auto-repair (reports what could be fixed)')
      .option('--json', 'Output results as JSON')
      .option('-v, --verbose', 'Show detailed output')
      .action(async (options: ValidateOptions) => {
        await validateAction(options);
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const validateCommand = new ValidateCommand();
