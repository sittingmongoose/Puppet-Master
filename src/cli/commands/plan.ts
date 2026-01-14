/**
 * Plan command - Generate PRD, architecture, and tier plan from requirements
 * 
 * Implements the `puppet-master plan` command that:
 * - Loads and parses requirements file (markdown, PDF, text, or docx)
 * - Generates PRD using PrdGenerator
 * - Generates architecture document using ArchGenerator
 * - Generates tier plan using TierPlanGenerator
 * - Validates all artifacts using ValidationGate
 * - Saves output files to .puppet-master/ directory
 */

import { readFile, writeFile, mkdir, copyFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import {
  PrdGenerator,
  ArchGenerator,
  TierPlanGenerator,
  ValidationGate,
} from '../../start-chain/index.js';
import type { TierPlan } from '../../start-chain/index.js';
import type { PRD } from '../../types/prd.js';
import { MarkdownParser } from '../../start-chain/parsers/markdown-parser.js';
import { PdfParser } from '../../start-chain/parsers/pdf-parser.js';
import { TextParser } from '../../start-chain/parsers/text-parser.js';
import { DocxParser } from '../../start-chain/parsers/docx-parser.js';
import type { SupportedFormat, ParsedRequirements, RequirementsSource } from '../../types/requirements.js';
import type { CommandModule } from './index.js';
import { PlatformRegistry } from '../../platforms/registry.js';
import { QuotaManager } from '../../platforms/quota-manager.js';
import { UsageTracker } from '../../memory/usage-tracker.js';

/**
 * Options for the plan command
 */
export interface PlanOptions {
  requirementsPath: string;
  outputDir?: string;
  validate?: boolean;
  dryRun?: boolean;
  config?: string;
  useAI?: boolean;
}

/**
 * Default output directory
 */
const DEFAULT_OUTPUT_DIR = '.puppet-master';

/**
 * Main action function for the plan command
 */
export async function planAction(options: PlanOptions): Promise<void> {
  try {
    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    const validate = options.validate ?? true;
    const dryRun = options.dryRun ?? false;
    const useAI = options.useAI ?? true;

    // Step 1: Detect file format and load requirements
    console.log(`Loading requirements from: ${options.requirementsPath}`);
    
    if (!existsSync(options.requirementsPath)) {
      throw new Error(`Requirements file not found: ${options.requirementsPath}`);
    }

    const format = detectFileFormat(options.requirementsPath);
    if (!format) {
      throw new Error(
        `Unsupported file format. Supported formats: markdown (.md), PDF (.pdf), text (.txt), Word (.docx)\n` +
        `Detected extension: ${extname(options.requirementsPath)}`
      );
    }

    // Get file stats for RequirementsSource
    const stats = await stat(options.requirementsPath);
    const source: RequirementsSource = {
      path: options.requirementsPath,
      format,
      size: stats.size,
      lastModified: stats.mtime.toISOString(),
    };

    // Step 2: Parse requirements
    console.log(`Parsing ${format} requirements file...`);
    const parsed = await parseRequirements(options.requirementsPath, format, source);

    if (parsed.parseErrors.length > 0) {
      console.warn('Parse warnings:');
      for (const error of parsed.parseErrors) {
        console.warn(`  - ${error}`);
      }
    }

    // Step 3: Load config for tier plan generation
    console.log('Loading configuration...');
    const configManager = new ConfigManager(options.config);
    const config = await configManager.load();

    // Extract project name from config or parsed title
    const projectName = config.project.name || parsed.title || 'Untitled Project';

    // Step 3.5: Initialize AI dependencies (if using AI)
    let platformRegistry: PlatformRegistry | undefined;
    let quotaManager: QuotaManager | undefined;
    let usageTracker: UsageTracker | undefined;

    if (useAI) {
      console.log('Initializing AI platform dependencies...');
      platformRegistry = PlatformRegistry.createDefault(config);
      const usagePath = join(outputDir, 'usage', 'usage.jsonl');
      usageTracker = new UsageTracker(usagePath);
      quotaManager = new QuotaManager(usageTracker, config.budgets);
    }

    // Step 4: Generate PRD
    console.log(useAI ? 'Generating PRD with AI...' : 'Generating PRD (rule-based)...');
    const prdGenerator = new PrdGenerator(
      { projectName },
      platformRegistry,
      quotaManager,
      config,
      usageTracker
    );
    
    let prd: PRD;
    if (useAI) {
      try {
        prd = await prdGenerator.generateWithAI(parsed, true);
      } catch (error) {
        console.warn('AI PRD generation failed, using rule-based fallback:', error instanceof Error ? error.message : String(error));
        prd = prdGenerator.generate(parsed);
      }
    } else {
      prd = prdGenerator.generate(parsed);
    }

    // Step 5: Generate architecture
    console.log(useAI ? 'Generating architecture document with AI...' : 'Generating architecture document (template-based)...');
    const archGenerator = new ArchGenerator(
      { projectName },
      platformRegistry,
      quotaManager,
      config,
      usageTracker
    );
    
    let architecture: string;
    if (useAI) {
      try {
        architecture = await archGenerator.generateWithAI(parsed, prd, true);
      } catch (error) {
        console.warn('AI architecture generation failed, using template-based fallback:', error instanceof Error ? error.message : String(error));
        architecture = archGenerator.generate(parsed, prd);
      }
    } else {
      architecture = archGenerator.generate(parsed, prd);
    }

    // Step 6: Generate tier plan
    console.log('Generating tier plan...');
    const tierPlanGenerator = new TierPlanGenerator(config);
    const tierPlan = tierPlanGenerator.generate(prd);

    // Step 7: Validate all artifacts
    if (validate) {
      console.log('Validating generated artifacts...');
      const validationGate = new ValidationGate();
      const validationResult = validationGate.validateAll(prd, architecture, tierPlan, config);

      // Display validation results
      if (validationResult.errors.length > 0) {
        console.error('\nValidation Errors:');
        for (const error of validationResult.errors) {
          console.error(`  [${error.code}] ${error.message}`);
          if (error.path) {
            console.error(`    Path: ${error.path}`);
          }
          if (error.suggestion) {
            console.error(`    Suggestion: ${error.suggestion}`);
          }
        }
      }

      if (validationResult.warnings.length > 0) {
        console.warn('\nValidation Warnings:');
        for (const warning of validationResult.warnings) {
          console.warn(`  [${warning.code}] ${warning.message}`);
          if (warning.suggestion) {
            console.warn(`    Suggestion: ${warning.suggestion}`);
          }
        }
      }

      if (!validationResult.valid) {
        throw new Error(
          `Validation failed with ${validationResult.errors.length} error(s). ` +
          `Please fix the issues above before proceeding.`
        );
      }

      console.log('✓ Validation passed');
    }

    // Step 8: Display summary
    console.log('\n=== Generation Summary ===');
    console.log(`Project: ${projectName}`);
    console.log(`Phases: ${prd.phases.length}`);
    console.log(`Tasks: ${prd.metadata.totalTasks}`);
    console.log(`Subtasks: ${prd.metadata.totalSubtasks}`);
    console.log(`Architecture document: ${architecture.length} characters`);

    // Step 9: Save files (unless dry run)
    if (dryRun) {
      console.log('\n[DRY RUN] Files would be saved to:');
      console.log(`  - ${join(outputDir, 'requirements', `original${extname(options.requirementsPath)}`)}`);
      console.log(`  - ${join(outputDir, 'prd.json')}`);
      console.log(`  - ${join(outputDir, 'architecture.md')}`);
      console.log(`  - ${join(outputDir, 'plans', 'tier-plan.md')}`);
      return;
    }

    console.log('\nSaving files...');

    // Create output directories
    await mkdir(join(outputDir, 'requirements'), { recursive: true });
    await mkdir(join(outputDir, 'plans'), { recursive: true });

    // Copy original requirements file
    const requirementsDest = join(outputDir, 'requirements', `original${extname(options.requirementsPath)}`);
    await copyFile(options.requirementsPath, requirementsDest);
    console.log(`  ✓ Saved requirements copy: ${requirementsDest}`);

    // Save PRD
    const prdPath = join(outputDir, 'prd.json');
    await writeFile(prdPath, JSON.stringify(prd, null, 2), 'utf-8');
    console.log(`  ✓ Saved PRD: ${prdPath}`);

    // Save architecture
    const archPath = join(outputDir, 'architecture.md');
    await writeFile(archPath, architecture, 'utf-8');
    console.log(`  ✓ Saved architecture: ${archPath}`);

    // Save tier plan (optional, as markdown)
    const tierPlanMarkdown = generateTierPlanMarkdown(tierPlan, prd);
    const tierPlanPath = join(outputDir, 'plans', 'tier-plan.md');
    await writeFile(tierPlanPath, tierPlanMarkdown, 'utf-8');
    console.log(`  ✓ Saved tier plan: ${tierPlanPath}`);

    console.log('\n✓ Plan generation complete!');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error generating plan:', errorMessage);
    throw error;
  }
}

/**
 * Detect file format from file extension
 */
function detectFileFormat(filePath: string): SupportedFormat | null {
  const ext = extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.md':
    case '.markdown':
      return 'markdown';
    case '.pdf':
      return 'pdf';
    case '.txt':
      return 'text';
    case '.docx':
      return 'docx';
    default:
      return null;
  }
}

/**
 * Parse requirements file based on format
 */
async function parseRequirements(
  filePath: string,
  format: SupportedFormat,
  source: RequirementsSource
): Promise<ParsedRequirements> {
  switch (format) {
    case 'markdown': {
      const content = await readFile(filePath, 'utf-8');
      const parser = new MarkdownParser();
      return parser.parse(content, source);
    }
    
    case 'pdf': {
      const buffer = await readFile(filePath);
      const parser = new PdfParser();
      return await parser.parse(buffer, source);
    }
    
    case 'text': {
      const content = await readFile(filePath, 'utf-8');
      const parser = new TextParser();
      return parser.parse(content, source);
    }
    
    case 'docx': {
      const buffer = await readFile(filePath);
      const parser = new DocxParser();
      return await parser.parse(buffer, source);
    }
    
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Generate markdown representation of tier plan
 */
function generateTierPlanMarkdown(tierPlan: TierPlan, prd: PRD): string {
  const lines: string[] = [
    '# Tier Execution Plan',
    '',
    'This document outlines the platform assignments and execution parameters for each tier.',
    '',
  ];

  for (const phasePlan of tierPlan.phases) {
    const phase = prd.phases.find(p => p.id === phasePlan.phaseId);
    const phaseTitle = phase?.title || phasePlan.phaseId;

    lines.push(`## Phase: ${phasePlan.phaseId} - ${phaseTitle}`);
    lines.push('');
    lines.push(`- **Platform:** ${phasePlan.platform}`);
    lines.push(`- **Max Iterations:** ${phasePlan.maxIterations}`);
    lines.push(`- **Escalation:** ${phasePlan.escalation || 'None'}`);
    lines.push('');

    if (phasePlan.tasks.length > 0) {
      lines.push('### Tasks');
      lines.push('');

      for (const taskPlan of phasePlan.tasks) {
        const task = phase?.tasks.find(t => t.id === taskPlan.taskId);
        const taskTitle = task?.title || taskPlan.taskId;

        lines.push(`#### Task: ${taskPlan.taskId} - ${taskTitle}`);
        lines.push('');
        lines.push(`- **Platform:** ${taskPlan.platform}`);
        lines.push(`- **Max Iterations:** ${taskPlan.maxIterations}`);
        lines.push('');

        if (taskPlan.subtasks.length > 0) {
          lines.push('**Subtasks:**');
          for (const subtaskPlan of taskPlan.subtasks) {
            const subtask = task?.subtasks.find(s => s.id === subtaskPlan.subtaskId);
            const subtaskTitle = subtask?.title || subtaskPlan.subtaskId;

            lines.push(`- ${subtaskPlan.subtaskId} - ${subtaskTitle}`);
            lines.push(`  - Platform: ${subtaskPlan.platform}`);
            lines.push(`  - Max Iterations: ${subtaskPlan.maxIterations}`);
          }
          lines.push('');
        }
      }
    }

    lines.push('');
  }

  return lines.join('\n');
}

/**
 * PlanCommand class implementing CommandModule interface
 */
export class PlanCommand implements CommandModule {
  /**
   * Register the plan command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('plan')
      .description('Generate PRD, architecture, and tier plan from requirements file')
      .argument('<requirements>', 'Path to requirements file (markdown, PDF, text, or docx)')
      .option('-o, --output-dir <path>', 'Output directory for generated files', DEFAULT_OUTPUT_DIR)
      .option('--no-validate', 'Skip validation of generated artifacts')
      .option('--dry-run', 'Validate and display summary without saving files')
      .option('-c, --config <path>', 'Path to config file')
      .option('--no-use-ai', 'Skip AI generation, use rule-based/template-based fallback')
      .action(async (requirementsPath: string, options: Omit<PlanOptions, 'requirementsPath'>) => {
        await planAction({
          requirementsPath,
          ...options,
        });
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const planCommand = new PlanCommand();