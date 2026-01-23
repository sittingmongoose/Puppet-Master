/**
 * Interview command - Generate requirements interview questions
 *
 * Implements the `puppet-master interview` command that:
 * - Loads and parses requirements file (markdown, PDF, text, or docx)
 * - Generates qualifying questions using RequirementsInterviewer
 * - Displays coverage checklist
 * - Optionally saves output files to .puppet-master/requirements/ directory
 *
 * FIX 8: CLI command for standalone requirements interview
 */

import { readFile, writeFile, mkdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname } from 'path';
import { Command } from 'commander';
import { ConfigManager } from '../../config/config-manager.js';
import { RequirementsInterviewer } from '../../start-chain/requirements-interviewer.js';
import type { InterviewResult } from '../../start-chain/requirements-interviewer.js';
import { MarkdownParser } from '../../start-chain/parsers/markdown-parser.js';
import { PdfParser } from '../../start-chain/parsers/pdf-parser.js';
import { TextParser } from '../../start-chain/parsers/text-parser.js';
import { DocxParser } from '../../start-chain/parsers/docx-parser.js';
import type { SupportedFormat, ParsedRequirements, RequirementsSource } from '../../types/requirements.js';
import type { CommandModule } from './index.js';
import { PlatformRegistry } from '../../platforms/registry.js';
import { QuotaManager } from '../../platforms/quota-manager.js';
import { UsageTracker } from '../../memory/usage-tracker.js';
import { applyStepOverride } from '../../config/config-override.js';
import type { Platform } from '../../types/config.js';

/**
 * Options for the interview command
 */
export interface InterviewOptions {
  requirementsPath: string;
  outputDir?: string;
  save?: boolean;
  maxQuestions?: number;
  config?: string;
  useAI?: boolean;
  json?: boolean;
  platform?: Platform;
  model?: string;
}

/**
 * Default output directory
 */
const DEFAULT_OUTPUT_DIR = '.puppet-master';

/**
 * Main action function for the interview command
 */
export async function interviewAction(options: InterviewOptions): Promise<void> {
  try {
    const outputDir = options.outputDir || DEFAULT_OUTPUT_DIR;
    const save = options.save ?? false;
    const useAI = options.useAI ?? true;
    const maxQuestions = options.maxQuestions ?? 10;
    const jsonOutput = options.json ?? false;

    // Step 1: Detect file format and load requirements
    if (!jsonOutput) {
      console.log(`Loading requirements from: ${options.requirementsPath}`);
    }

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
    if (!jsonOutput) {
      console.log(`Parsing ${format} requirements file...`);
    }
    const parsed = await parseRequirements(options.requirementsPath, format, source);

    if (parsed.parseErrors.length > 0 && !jsonOutput) {
      console.warn('Parse warnings:');
      for (const error of parsed.parseErrors) {
        console.warn(`  - ${error}`);
      }
    }

    // Step 3: Load config
    if (!jsonOutput) {
      console.log('Loading configuration...');
    }
    const configManager = new ConfigManager(options.config);
    let config = await configManager.load();

    // Apply CLI overrides if provided
    if (options.platform || options.model) {
      config = applyStepOverride(config, 'requirementsInterview', {
        platform: options.platform,
        model: options.model,
      });
      if (!jsonOutput) {
        console.log('Applied CLI overrides to configuration');
      }
    }

    // Extract project name from config or parsed title
    const projectName = config.project.name || parsed.title || 'Untitled Project';

    // Step 4: Initialize AI dependencies (if using AI)
    let platformRegistry: PlatformRegistry | undefined;
    let quotaManager: QuotaManager | undefined;
    let usageTracker: UsageTracker | undefined;

    if (useAI) {
      if (!jsonOutput) {
        console.log('Initializing AI platform dependencies...');
      }
      platformRegistry = PlatformRegistry.createDefault(config);
      const usagePath = join(outputDir, 'usage', 'usage.jsonl');
      usageTracker = new UsageTracker(usagePath);
      quotaManager = new QuotaManager(usageTracker, config.budgets);
    }

    // Step 5: Run interview
    if (!jsonOutput) {
      console.log(useAI ? 'Generating interview questions with AI...' : 'Generating interview questions (rule-based)...');
    }

    const interviewer = new RequirementsInterviewer(
      { projectName, maxQuestions },
      platformRegistry,
      quotaManager,
      config,
      usageTracker
    );

    let interview: InterviewResult;
    if (useAI) {
      interview = await interviewer.interviewWithAI(parsed, true);
    } else {
      interview = interviewer.generateQuestions(parsed);
    }

    // Step 6: Output results
    if (jsonOutput) {
      // JSON output mode - just print JSON
      console.log(JSON.stringify(interview, null, 2));
    } else {
      // Human-readable output
      displayInterviewResults(interview);
    }

    // Step 7: Save files if requested
    if (save && !jsonOutput) {
      console.log('\nSaving files...');

      // Create output directories
      const requirementsDir = join(outputDir, 'requirements');
      await mkdir(requirementsDir, { recursive: true });

      // Save questions.md
      const questionsPath = join(requirementsDir, 'questions.md');
      const questionsContent = formatQuestionsMarkdown(interview);
      await writeFile(questionsPath, questionsContent, 'utf-8');
      console.log(`  ✓ Saved questions: ${questionsPath}`);

      // Save assumptions.md
      const assumptionsPath = join(requirementsDir, 'assumptions.md');
      const assumptionsContent = formatAssumptionsMarkdown(interview);
      await writeFile(assumptionsPath, assumptionsContent, 'utf-8');
      console.log(`  ✓ Saved assumptions: ${assumptionsPath}`);

      // Save interview.json
      const jsonPath = join(requirementsDir, 'interview.json');
      await writeFile(jsonPath, JSON.stringify(interview, null, 2), 'utf-8');
      console.log(`  ✓ Saved JSON: ${jsonPath}`);

      console.log('\n✓ Interview complete!');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running interview:', errorMessage);
    throw error;
  }
}

/**
 * Display interview results in human-readable format
 */
function displayInterviewResults(interview: InterviewResult): void {
  console.log('\n=== Requirements Interview Results ===\n');

  console.log(`Project: ${interview.sourceDocument.title}`);
  console.log(`Source: ${interview.sourceDocument.path}`);
  console.log(`Sections: ${interview.sourceDocument.sectionCount}`);
  console.log(`Generated: ${interview.timestamp}`);
  console.log('');

  // Display coverage checklist
  console.log('=== Coverage Checklist ===\n');

  for (const coverage of interview.coverageChecklist) {
    const categoryName = coverage.category.replace(/_/g, ' ').toUpperCase();
    const statusIcon =
      coverage.status === 'covered' ? '✓' :
      coverage.status === 'out_of_scope' ? '-' : '✗';
    const statusColor =
      coverage.status === 'covered' ? '\x1b[32m' :    // Green
      coverage.status === 'out_of_scope' ? '\x1b[33m' : // Yellow
      '\x1b[31m';  // Red
    const reset = '\x1b[0m';

    console.log(`${statusColor}[${statusIcon}]${reset} ${categoryName}: ${coverage.status.replace(/_/g, ' ')}`);

    if (coverage.citations && coverage.citations.length > 0) {
      console.log(`    Citations: ${coverage.citations.slice(0, 2).join(', ')}${coverage.citations.length > 2 ? '...' : ''}`);
    }
    if (coverage.rationale) {
      console.log(`    Rationale: ${coverage.rationale.substring(0, 80)}${coverage.rationale.length > 80 ? '...' : ''}`);
    }
  }

  // Display questions
  if (interview.questions.length > 0) {
    console.log('\n=== Qualifying Questions ===\n');

    const criticalQuestions = interview.questions.filter(q => q.priority === 'critical');
    const highQuestions = interview.questions.filter(q => q.priority === 'high');
    const mediumQuestions = interview.questions.filter(q => q.priority === 'medium');
    const lowQuestions = interview.questions.filter(q => q.priority === 'low');

    if (criticalQuestions.length > 0) {
      console.log('\x1b[31m--- CRITICAL ---\x1b[0m');
      for (const q of criticalQuestions) {
        displayQuestion(q);
      }
    }

    if (highQuestions.length > 0) {
      console.log('\x1b[33m--- HIGH ---\x1b[0m');
      for (const q of highQuestions) {
        displayQuestion(q);
      }
    }

    if (mediumQuestions.length > 0) {
      console.log('\x1b[36m--- MEDIUM ---\x1b[0m');
      for (const q of mediumQuestions) {
        displayQuestion(q);
      }
    }

    if (lowQuestions.length > 0) {
      console.log('\x1b[32m--- LOW ---\x1b[0m');
      for (const q of lowQuestions) {
        displayQuestion(q);
      }
    }
  } else {
    console.log('\n✓ No clarifying questions needed - requirements appear comprehensive!');
  }

  // Summary
  console.log('\n=== Summary ===\n');
  console.log(`Total Questions: ${interview.questions.length}`);
  console.log(`  Critical: ${interview.questions.filter(q => q.priority === 'critical').length}`);
  console.log(`  High: ${interview.questions.filter(q => q.priority === 'high').length}`);
  console.log(`  Medium: ${interview.questions.filter(q => q.priority === 'medium').length}`);
  console.log(`  Low: ${interview.questions.filter(q => q.priority === 'low').length}`);

  const coveredCount = interview.coverageChecklist.filter(c => c.status === 'covered').length;
  const missingCount = interview.coverageChecklist.filter(c => c.status === 'missing').length;
  const outOfScopeCount = interview.coverageChecklist.filter(c => c.status === 'out_of_scope').length;

  console.log('');
  console.log(`Coverage: ${coveredCount}/9 categories covered`);
  if (missingCount > 0) {
    console.log(`  Missing: ${missingCount}`);
  }
  if (outOfScopeCount > 0) {
    console.log(`  Out of Scope: ${outOfScopeCount}`);
  }
}

/**
 * Display a single question
 */
function displayQuestion(q: { id: string; category: string; question: string; defaultAssumption: string; rationale: string }): void {
  console.log(`\n${q.id} [${q.category.replace(/_/g, ' ')}]`);
  console.log(`  Q: ${q.question}`);
  console.log(`  Default: ${q.defaultAssumption}`);
  console.log(`  Why: ${q.rationale}`);
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
 * Format interview results as questions markdown
 */
function formatQuestionsMarkdown(interview: InterviewResult): string {
  const lines: string[] = [
    '# Requirements Interview Questions',
    '',
    `Generated: ${interview.timestamp}`,
    `Source: ${interview.sourceDocument.path}`,
    '',
    '## Qualifying Questions',
    '',
  ];

  // Group questions by priority
  const byPriority = {
    critical: interview.questions.filter(q => q.priority === 'critical'),
    high: interview.questions.filter(q => q.priority === 'high'),
    medium: interview.questions.filter(q => q.priority === 'medium'),
    low: interview.questions.filter(q => q.priority === 'low'),
  };

  for (const [priority, questions] of Object.entries(byPriority)) {
    if (questions.length > 0) {
      lines.push(`### ${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`);
      lines.push('');

      for (const q of questions) {
        lines.push(`**${q.id}** [${q.category}]: ${q.question}`);
        lines.push('');
        lines.push(`*Rationale:* ${q.rationale}`);
        lines.push('');
        lines.push(`*Default Assumption:* ${q.defaultAssumption}`);
        lines.push('');
        lines.push('---');
        lines.push('');
      }
    }
  }

  // Add Coverage Checklist
  lines.push('## Coverage Checklist');
  lines.push('');
  lines.push('Major component categories and their coverage status:');
  lines.push('');

  for (const coverage of interview.coverageChecklist) {
    const categoryName = coverage.category.replace(/_/g, ' ').toUpperCase();

    if (coverage.status === 'covered') {
      lines.push(`- [x] **${categoryName}**: Covered`);
      if (coverage.citations && coverage.citations.length > 0) {
        lines.push(`  - Citations: ${coverage.citations.join(', ')}`);
      }
    } else if (coverage.status === 'missing') {
      lines.push(`- [ ] **${categoryName}**: Missing`);
      if (coverage.topQuestion) {
        lines.push(`  - Question: ${coverage.topQuestion}`);
      }
      if (coverage.defaultAssumption) {
        lines.push(`  - Default: ${coverage.defaultAssumption}`);
      }
    } else if (coverage.status === 'out_of_scope') {
      lines.push(`- [-] **${categoryName}**: Out of Scope`);
      if (coverage.rationale) {
        lines.push(`  - Rationale: ${coverage.rationale}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format interview results as assumptions markdown
 */
function formatAssumptionsMarkdown(interview: InterviewResult): string {
  const lines: string[] = [
    '# Default Assumptions',
    '',
    `Generated: ${interview.timestamp}`,
    `Source: ${interview.sourceDocument.path}`,
    '',
    'These assumptions will be used for PRD generation unless overridden:',
    '',
  ];

  for (const q of interview.questions) {
    const categoryName = q.category.replace(/_/g, ' ').toUpperCase();
    lines.push(`## ${categoryName}`);
    lines.push('');
    lines.push(`**Question:** ${q.question}`);
    lines.push('');
    lines.push(`**Assumption:** ${q.defaultAssumption}`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * InterviewCommand class implementing CommandModule interface
 */
export class InterviewCommand implements CommandModule {
  /**
   * Register the interview command with the Commander.js program
   */
  register(program: Command): void {
    program
      .command('interview')
      .description('Generate requirements interview questions to identify gaps and ambiguities')
      .argument('<requirements>', 'Path to requirements file (markdown, PDF, text, or docx)')
      .option('-o, --output-dir <path>', 'Output directory for generated files', DEFAULT_OUTPUT_DIR)
      .option('-s, --save', 'Save results to .puppet-master/requirements/ directory')
      .option('-m, --max-questions <number>', 'Maximum number of questions to generate', '10')
      .option('-c, --config <path>', 'Path to config file')
      .option('--no-use-ai', 'Skip AI generation, use rule-based fallback')
      .option('--json', 'Output results as JSON (machine-readable)')
      .option('--platform <platform>', 'Override platform for interview (cursor, codex, claude, gemini, copilot)')
      .option('--model <model>', 'Override model for interview')
      .action(async (requirementsPath: string, options: Omit<InterviewOptions, 'requirementsPath'>) => {
        await interviewAction({
          requirementsPath,
          maxQuestions: options.maxQuestions ? parseInt(String(options.maxQuestions), 10) : undefined,
          ...options,
        });
      });
  }
}

/**
 * Export singleton instance for registration
 */
export const interviewCommand = new InterviewCommand();
