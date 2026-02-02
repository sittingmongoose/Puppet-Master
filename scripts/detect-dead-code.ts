#!/usr/bin/env npx tsx
/**
 * Dead Code Detection CLI Runner
 * 
 * Standalone script to detect dead code (unused classes, functions, methods).
 * 
 * Usage:
 *   npx tsx scripts/detect-dead-code.ts [options]
 * 
 * Options:
 *   --json        Output as JSON
 *   --save        Save results to .puppet-master/audits/dead-code.json
 *   --top N       Show top N largest orphans (default: 10)
 *   --project     Project root directory (default: cwd)
 *   --include-tests  Include test files in analysis
 *   --no-methods  Skip unused method detection
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T25 for implementation details.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { detectDeadCode } from '../src/audits/dead-code-detector.js';
import type { DeadCodeReport, DeadCodeIssue, DeadCodeDetectorConfig } from '../src/audits/types.js';

interface CLIOptions {
  json: boolean;
  save: boolean;
  top: number;
  project: string;
  includeTests: boolean;
  checkMethods: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    json: false,
    save: false,
    top: 10,
    project: process.cwd(),
    includeTests: false,
    checkMethods: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') {
      options.json = true;
    } else if (arg === '--save') {
      options.save = true;
    } else if (arg === '--top' && i + 1 < args.length) {
      options.top = parseInt(args[++i], 10);
    } else if (arg === '--project' && i + 1 < args.length) {
      options.project = args[++i];
    } else if (arg === '--include-tests') {
      options.includeTests = true;
    } else if (arg === '--no-methods') {
      options.checkMethods = false;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Dead Code Detection CLI

Usage: npx tsx scripts/detect-dead-code.ts [options]

Options:
  --json           Output results as JSON
  --save           Save results to .puppet-master/audits/dead-code.json
  --top N          Show top N largest orphans (default: 10)
  --project PATH   Project root directory (default: current directory)
  --include-tests  Include test files in analysis
  --no-methods     Skip unused method detection
  -h, --help       Show this help message

Examples:
  npx tsx scripts/detect-dead-code.ts
  npx tsx scripts/detect-dead-code.ts --top 20
  npx tsx scripts/detect-dead-code.ts --json --save
  npx tsx scripts/detect-dead-code.ts --project /path/to/project
`);
}

function formatIssue(issue: DeadCodeIssue): string {
  const icon = getTypeIcon(issue.type);
  const location = `${issue.file}:${issue.line}`;
  
  let output = `  ${icon} [${issue.type}] ${location}\n`;
  output += `     ${issue.description}\n`;
  output += `     📏 ${issue.linesOfCode} lines\n`;
  
  return output;
}

function getTypeIcon(type: string): string {
  switch (type) {
    case 'orphan_export':
      return '📦';
    case 'unused_class':
      return '🏗️';
    case 'unused_function':
      return '🔧';
    case 'unused_method':
      return '⚙️';
    case 'unreachable_code':
      return '🚫';
    case 'unused_parameter':
      return '📝';
    default:
      return '⚠️';
  }
}

function printHumanReadable(report: DeadCodeReport, options: CLIOptions): void {
  const errors = report.issues.filter((i) => i.severity === 'error');
  const warnings = report.issues.filter((i) => i.severity === 'warning');

  console.log('\n═══════════════════════════════════════');
  console.log('       Dead Code Detection Report      ');
  console.log('═══════════════════════════════════════\n');

  // Summary
  console.log('📊 Summary:');
  console.log(`   Duration: ${report.durationMs}ms`);
  console.log(`   Total Dead Lines: ${report.summary.totalDeadLines}`);
  console.log('');
  console.log('   By Type:');
  for (const [type, lines] of Object.entries(report.summary.byType)) {
    if (lines > 0) {
      console.log(`     ${getTypeIcon(type)} ${type}: ${lines} lines`);
    }
  }
  console.log('');

  // Status
  if (report.passed) {
    if (warnings.length === 0) {
      console.log('✅ No dead code detected!\n');
    } else {
      console.log(`⚠️  Found ${warnings.length} potential dead code issue(s)\n`);
    }
  } else {
    console.log(`❌ Found ${errors.length} error(s) and ${warnings.length} warning(s)\n`);
  }

  // Largest orphans
  if (report.summary.largestOrphans.length > 0) {
    const topN = Math.min(options.top, report.summary.largestOrphans.length);
    console.log(`🔝 Top ${topN} Largest Dead Code Items:`);
    for (let i = 0; i < topN; i++) {
      const issue = report.summary.largestOrphans[i];
      console.log(`\n  ${i + 1}. ${issue.symbol} (${issue.linesOfCode} lines)`);
      console.log(`     ${issue.file}:${issue.line}`);
      console.log(`     ${issue.description}`);
    }
    console.log('');
  }

  // All issues (grouped by type)
  if (report.issues.length > 0) {
    console.log('───────────────────────────────────────');
    console.log('All Issues:\n');

    // Group by type
    const byType = new Map<string, DeadCodeIssue[]>();
    for (const issue of report.issues) {
      const existing = byType.get(issue.type) ?? [];
      existing.push(issue);
      byType.set(issue.type, existing);
    }

    for (const [type, issues] of byType) {
      console.log(`${getTypeIcon(type)} ${type.toUpperCase()} (${issues.length}):\n`);
      for (const issue of issues.slice(0, 20)) {
        console.log(formatIssue(issue));
      }
      if (issues.length > 20) {
        console.log(`  ... and ${issues.length - 20} more\n`);
      }
    }
  }

  console.log('───────────────────────────────────────');
}

async function saveResults(report: DeadCodeReport, projectRoot: string): Promise<string> {
  const auditDir = path.join(projectRoot, '.puppet-master', 'audits');
  
  // Ensure directory exists
  await fs.promises.mkdir(auditDir, { recursive: true });
  
  const outputPath = path.join(auditDir, 'dead-code.json');
  await fs.promises.writeFile(outputPath, JSON.stringify(report, null, 2));
  
  return outputPath;
}

async function main(): Promise<void> {
  const options = parseArgs();

  console.log(`\nRunning dead code detection on: ${options.project}\n`);

  const detectorOptions: Partial<DeadCodeDetectorConfig> = {
    includeTests: options.includeTests,
    checkMethods: options.checkMethods,
  };

  let report: DeadCodeReport;

  try {
    report = await detectDeadCode(options.project, detectorOptions);
  } catch (error) {
    console.error('Detection failed:', error);
    process.exit(2);
  }

  // Output results
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHumanReadable(report, options);
  }

  // Save results if requested
  if (options.save) {
    const outputPath = await saveResults(report, options.project);
    console.log(`\n📁 Results saved to: ${outputPath}\n`);
  }

  // Exit with appropriate code
  // Note: We exit 0 even with warnings (they're informational)
  process.exit(report.summary.errorCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(2);
});
