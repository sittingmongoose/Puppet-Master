/**
 * Plan command - Generate PRD, architecture, and tier plan from requirements
 * 
 * Implements the `puppet-master plan` command that:
 * - Loads and parses requirements file (markdown, PDF, text, or docx)
 * - Uses StartChainPipeline to generate PRD, architecture, and tier plan
 * - Validates all artifacts and enforces coverage thresholds
 * - Saves output files to .puppet-master/ directory
 */

import { readFile, mkdir, copyFile, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname } from 'path';
import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { StartChainPipeline } from '../../core/start-chain/pipeline.js';
import { MarkdownParser } from '../../start-chain/parsers/markdown-parser.js';
import { PdfParser } from '../../start-chain/parsers/pdf-parser.js';
import { TextParser } from '../../start-chain/parsers/text-parser.js';
import { DocxParser } from '../../start-chain/parsers/docx-parser.js';
import type { SupportedFormat, ParsedRequirements, RequirementsSource } from '../../types/requirements.js';
import type { CommandModule } from './index.js';
import { PlatformRegistry } from '../../platforms/registry.js';
import { QuotaManager } from '../../platforms/quota-manager.js';
import { UsageTracker } from '../../memory/usage-tracker.js';
import { applyConfigOverrides, type StartChainOverride } from '../../config/config-override.js';
import type { Platform } from '../../types/config.js';

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
  // CLI overrides for start chain steps
  prdPlatform?: Platform;
  prdModel?: string;
  architecturePlatform?: Platform;
  architectureModel?: string;
  interviewPlatform?: Platform;
  interviewModel?: string;
  validationPlatform?: Platform;
  validationModel?: string;
  // New Start Chain flags
  skipInterview?: boolean;
  skipInventory?: boolean;
  coverageThreshold?: number; // 0-100 percentage
  maxRepairPasses?: number;
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
    const dryRun = options.dryRun ?? false;

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
    let config = await configManager.load();

    // Apply CLI overrides if provided
    const overrides: StartChainOverride = {};
    if (options.prdPlatform || options.prdModel) {
      overrides.prd = {
        platform: options.prdPlatform,
        model: options.prdModel,
      };
    }
    if (options.architecturePlatform || options.architectureModel) {
      overrides.architecture = {
        platform: options.architecturePlatform,
        model: options.architectureModel,
      };
    }
    if (options.interviewPlatform || options.interviewModel) {
      overrides.requirementsInterview = {
        platform: options.interviewPlatform,
        model: options.interviewModel,
      };
    }
    if (options.validationPlatform || options.validationModel) {
      overrides.validation = {
        platform: options.validationPlatform,
        model: options.validationModel,
      };
    }

    if (Object.keys(overrides).length > 0) {
      config = applyConfigOverrides(config, overrides);
      console.log('Applied CLI overrides to configuration');
    }

    // Extract project name from config or parsed title
    const projectName = config.project.name || parsed.title || 'Untitled Project';

    // Validate coverage threshold if provided
    if (options.coverageThreshold !== undefined) {
      if (options.coverageThreshold < 0 || options.coverageThreshold > 100) {
        throw new Error(`Coverage threshold must be between 0 and 100, got ${options.coverageThreshold}`);
      }
    }

    // Validate max repair passes if provided
    if (options.maxRepairPasses !== undefined) {
      if (options.maxRepairPasses < 0 || !Number.isInteger(options.maxRepairPasses)) {
        throw new Error(`Max repair passes must be a non-negative integer, got ${options.maxRepairPasses}`);
      }
    }

    // Apply coverage threshold and max repair passes to multiPass config
    if (options.coverageThreshold !== undefined || options.maxRepairPasses !== undefined) {
      if (!config.startChain) {
        config.startChain = {};
      }
      if (!config.startChain.multiPass) {
        config.startChain.multiPass = {};
      }
      if (options.coverageThreshold !== undefined) {
        config.startChain.multiPass.coverageThreshold = options.coverageThreshold / 100; // Convert % to ratio
      }
      if (options.maxRepairPasses !== undefined) {
        config.startChain.multiPass.maxRepairPasses = options.maxRepairPasses;
      }
    }

    // Warn if skip-inventory is used (inventory step not yet implemented)
    if (options.skipInventory) {
      console.warn('[WARNING] --skip-inventory flag is set, but inventory step is not yet implemented in StartChainPipeline.');
    }

    // Initialize Start Chain dependencies
    // Note: StartChainPipeline requires AI dependencies, so we always initialize them
    // The pipeline will handle useAI logic internally
    console.log('Initializing AI platform dependencies...');
    const platformRegistry = PlatformRegistry.createDefault(config);
    const usagePath = join(outputDir, 'usage', 'usage.jsonl');
    const usageTracker = new UsageTracker(usagePath);
    const quotaManager = new QuotaManager(usageTracker, config.budgets, config.budgetEnforcement);

    // Create Start Chain pipeline
    const pipeline = new StartChainPipeline(
      config,
      platformRegistry,
      quotaManager,
      usageTracker
    );

    // Execute pipeline
    console.log('Executing Start Chain pipeline...');
    const result = await pipeline.execute({
      parsed,
      projectPath: outputDir,
      projectName,
      skipInterview: options.skipInterview ?? false,
    });

    // Handle dry-run mode
    if (dryRun) {
      console.log('\n[DRY RUN] Files would be saved to:');
      console.log(`  - ${result.prdPath}`);
      console.log(`  - ${result.architecturePath}`);
      console.log(`  - ${result.planPaths.join(', ')}`);
      if (result.interviewPaths) {
        console.log(`  - ${result.interviewPaths.questionsPath}`);
        console.log(`  - ${result.interviewPaths.assumptionsPath}`);
        console.log(`  - ${result.interviewPaths.jsonPath}`);
      }
      if (result.coverageReportPath) {
        console.log(`  - ${result.coverageReportPath}`);
      }
      return;
    }

    // Copy original requirements file (pipeline doesn't do this)
    await mkdir(join(outputDir, 'requirements'), { recursive: true });
    const requirementsDest = join(outputDir, 'requirements', `original${extname(options.requirementsPath)}`);
    await copyFile(options.requirementsPath, requirementsDest);
    console.log(`  ✓ Saved requirements copy: ${requirementsDest}`);

    // Display summary
    console.log('\n=== Generation Summary ===');
    console.log(`Project: ${result.prd.project || projectName}`);
    console.log(`Phases: ${result.prd.phases.length}`);
    console.log(`Tasks: ${result.prd.metadata.totalTasks}`);
    console.log(`Subtasks: ${result.prd.metadata.totalSubtasks}`);
    console.log(`Architecture document: ${result.architecture.length} characters`);
    if (result.coverageReport) {
      const coveragePercent = (result.coverageReport.coverageRatio * 100).toFixed(1);
      console.log(`Coverage: ${coveragePercent}%`);
    }
    if (result.interview) {
      console.log(`Interview questions: ${result.interview.questions.length}`);
    }

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
      .option('--prd-platform <platform>', 'Override platform for PRD generation (cursor, codex, claude, gemini, copilot)')
      .option('--prd-model <model>', 'Override model for PRD generation')
      .option('--architecture-platform <platform>', 'Override platform for architecture generation (cursor, codex, claude, gemini, copilot)')
      .option('--architecture-model <model>', 'Override model for architecture generation')
      .option('--interview-platform <platform>', 'Override platform for requirements interview (cursor, codex, claude, gemini, copilot)')
      .option('--interview-model <model>', 'Override model for requirements interview')
      .option('--validation-platform <platform>', 'Override platform for validation (cursor, codex, claude, gemini, copilot)')
      .option('--validation-model <model>', 'Override model for validation')
      .option('--skip-interview', 'Skip requirements interview step')
      .option('--skip-inventory', 'Skip requirements inventory extraction (not recommended)')
      .option('--coverage-threshold <percent>', 'Minimum coverage required (0-100)', parseFloat)
      .option('--max-repair-passes <n>', 'Max Start Chain repair loops for coverage/quality gap fill', parseInt)
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