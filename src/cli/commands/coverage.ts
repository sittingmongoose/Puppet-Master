/**
 * Coverage command - View requirements coverage
 *
 * Implements `puppet-master coverage`:
 * - Display coverage summary from .puppet-master/requirements/coverage.json
 * - Show missing requirements
 * - Show covered requirements with their linked tiers
 *
 * Feature parity with GUI /api/coverage endpoints.
 */

import { Command } from 'commander';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import type { CoverageReport } from '../../start-chain/validators/coverage-validator.js';
import type { CommandModule } from './index.js';

export interface CoverageOptions {
  projectPath?: string;
  json?: boolean;
  showMissing?: boolean;
}

/**
 * Main coverage action
 */
export async function coverageAction(options: CoverageOptions): Promise<void> {
  try {
    const projectDir = options.projectPath ? resolve(options.projectPath) : process.cwd();
    const coveragePath = join(projectDir, '.puppet-master', 'requirements', 'coverage.json');

    if (!existsSync(coveragePath)) {
      console.error('Coverage report not found.');
      console.error('Run Start Chain to generate a coverage report.');
      console.error(`Expected path: ${coveragePath}`);
      process.exit(1);
    }

    const fileContent = await fs.readFile(coveragePath, 'utf-8');
    const coverageReport: CoverageReport = JSON.parse(fileContent);

    // Validate structure
    if (typeof coverageReport.coverageRatio !== 'number' || !Array.isArray(coverageReport.missingRequirements)) {
      console.error('Invalid coverage report format');
      process.exit(1);
    }

    if (options.json) {
      console.log(JSON.stringify(coverageReport, null, 2));
      return;
    }

    // Print summary
    const percentage = (coverageReport.coverageRatio * 100).toFixed(1);
    const bar = generateProgressBar(coverageReport.coverageRatio * 100);
    
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              Requirements Coverage Report                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log();
    console.log(`Coverage: ${percentage}% ${bar}`);
    console.log(`Section Coverage: ${(coverageReport.sectionCoverageRatio * 100).toFixed(1)}%`);
    console.log();

    // Coverage stats
    console.log('Statistics:');
    console.log('-'.repeat(50));
    console.log(`  Source Characters: ${coverageReport.sourceChars}`);
    console.log(`  Extracted Characters: ${coverageReport.extractedChars}`);
    console.log(`  Headings: ${coverageReport.headingsCount}`);
    console.log(`  Bullets: ${coverageReport.bulletsCount}`);
    console.log(`  Phases: ${coverageReport.phasesCount}`);
    console.log(`  Sections: ${coverageReport.coveredRequirementSections}/${coverageReport.totalRequirementSections}`);
    console.log();

    // Missing requirements
    if (coverageReport.missingRequirements.length > 0) {
      if (options.showMissing !== false) {
        console.log(`Missing Requirements (${coverageReport.missingRequirements.length}):`);
        console.log('-'.repeat(50));
        for (const missing of coverageReport.missingRequirements.slice(0, 20)) {
          const id = missing.requirementId || missing.sectionPath;
          const text = missing.excerpt.slice(0, 60);
          console.log(`  ❌ ${id}: ${text}...`);
        }
        if (coverageReport.missingRequirements.length > 20) {
          console.log(`  ... and ${coverageReport.missingRequirements.length - 20} more`);
        }
        console.log();
      }
    } else {
      console.log('✅ All requirements are covered!');
      console.log();
    }

    // Generic criteria warnings
    if (coverageReport.genericCriteriaCount > 0) {
      console.log(`⚠️  Generic Criteria Detected: ${coverageReport.genericCriteriaCount}`);
      for (const example of coverageReport.genericCriteriaExamples.slice(0, 5)) {
        console.log(`    • "${example}"`);
      }
      console.log();
    }

    // Validation summary
    console.log(`Validation: ${coverageReport.passed ? '✅ PASSED' : '❌ FAILED'}`);
    if (coverageReport.errors.length > 0) {
      console.log(`  Errors: ${coverageReport.errors.length}`);
    }
    if (coverageReport.warnings.length > 0) {
      console.log(`  Warnings: ${coverageReport.warnings.length}`);
    }
  } catch (error) {
    console.error('Error loading coverage report:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Generate a progress bar string
 */
function generateProgressBar(percentage: number, width: number = 20): string {
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty);
}

export class CoverageCommand implements CommandModule {
  register(program: Command): void {
    program
      .command('coverage')
      .description('View requirements coverage report')
      .option('-p, --project-path <path>', 'Project directory path')
      .option('--json', 'Output as JSON')
      .option('--show-missing', 'Show missing requirements (default: true)', true)
      .option('--no-show-missing', 'Hide missing requirements list')
      .action(async (opts) => {
        await coverageAction({
          projectPath: opts.projectPath,
          json: opts.json,
          showMissing: opts.showMissing,
        });
      });
  }
}

export const coverageCommand = new CoverageCommand();
