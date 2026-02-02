#!/usr/bin/env npx tsx
/**
 * Wiring Audit CLI Runner
 * 
 * Standalone script to run implementation wiring audit.
 * 
 * Usage:
 *   npx tsx scripts/run-wiring-audit.ts [options]
 * 
 * Options:
 *   --fix         Show fix suggestions
 *   --json        Output as JSON
 *   --full        Run full audit (generic + RWM-specific)
 *   --save        Save results to .puppet-master/audits/wiring.json
 *   --project     Project root directory (default: cwd)
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T22 for implementation details.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { runFullAudit, auditRWMWiring } from '../src/audits/rwm-specific-audit.js';
import { WiringAuditor, createDefaultConfig } from '../src/audits/wiring-audit.js';
import type { WiringAuditResult, WiringIssue } from '../src/audits/types.js';

interface CLIOptions {
  fix: boolean;
  json: boolean;
  full: boolean;
  save: boolean;
  project: string;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    fix: false,
    json: false,
    full: false,
    save: false,
    project: process.cwd(),
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--fix') {
      options.fix = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--full') {
      options.full = true;
    } else if (arg === '--save') {
      options.save = true;
    } else if (arg === '--project' && i + 1 < args.length) {
      options.project = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Wiring Audit CLI

Usage: npx tsx scripts/run-wiring-audit.ts [options]

Options:
  --fix         Show fix suggestions for each issue
  --json        Output results as JSON
  --full        Run full audit (generic + RWM-specific)
  --save        Save results to .puppet-master/audits/wiring.json
  --project     Project root directory (default: current directory)
  -h, --help    Show this help message

Examples:
  npx tsx scripts/run-wiring-audit.ts
  npx tsx scripts/run-wiring-audit.ts --fix
  npx tsx scripts/run-wiring-audit.ts --json --save
  npx tsx scripts/run-wiring-audit.ts --full --project /path/to/project
`);
}

function formatIssue(issue: WiringIssue, showFix: boolean): string {
  const icon = issue.severity === 'error' ? '❌' : '⚠️';
  const location = issue.location.line 
    ? `${issue.location.file}:${issue.location.line}`
    : issue.location.file;
  
  let output = `  ${icon} [${issue.type}] ${location}\n`;
  output += `     ${issue.description}\n`;
  
  if (showFix) {
    output += `     💡 ${issue.suggestion}\n`;
  }
  
  return output;
}

function printHumanReadable(result: WiringAuditResult, options: CLIOptions): void {
  const errors = result.issues.filter((i) => i.severity === 'error');
  const warnings = result.issues.filter((i) => i.severity === 'warning');

  console.log('\n═══════════════════════════════════════');
  console.log('       Implementation Wiring Audit     ');
  console.log('═══════════════════════════════════════\n');

  // Summary
  console.log('📊 Summary:');
  console.log(`   Duration: ${result.durationMs}ms`);
  console.log(`   Exports: ${result.summary.totalExports} total, ${result.summary.orphanExports} orphan`);
  console.log(`   Registrations: ${result.summary.totalRegistrations} total, ${result.summary.unusedRegistrations} unused`);
  console.log(`   Imports: ${result.summary.totalImports} total, ${result.summary.deadImports} dead`);
  console.log(`   Event Mismatches: ${result.summary.eventMismatches}`);
  console.log(`   Verifier Gaps: ${result.summary.verifierGaps}`);
  console.log('');

  // Status
  if (result.passed) {
    if (warnings.length === 0) {
      console.log('✅ All checks passed!\n');
    } else {
      console.log(`⚠️  Passed with ${warnings.length} warning(s)\n`);
    }
  } else {
    console.log(`❌ Failed with ${errors.length} error(s) and ${warnings.length} warning(s)\n`);
  }

  // Errors
  if (errors.length > 0) {
    console.log('🔴 Errors:');
    for (const error of errors) {
      console.log(formatIssue(error, options.fix));
    }
  }

  // Warnings
  if (warnings.length > 0) {
    console.log('🟡 Warnings:');
    for (const warning of warnings) {
      console.log(formatIssue(warning, options.fix));
    }
  }

  console.log('───────────────────────────────────────');
}

async function saveResults(result: WiringAuditResult, projectRoot: string): Promise<string> {
  const auditDir = path.join(projectRoot, '.puppet-master', 'audits');
  
  // Ensure directory exists
  await fs.promises.mkdir(auditDir, { recursive: true });
  
  const outputPath = path.join(auditDir, 'wiring.json');
  await fs.promises.writeFile(outputPath, JSON.stringify(result, null, 2));
  
  return outputPath;
}

async function main(): Promise<void> {
  const options = parseArgs();

  console.log(`\nRunning wiring audit on: ${options.project}\n`);

  let result: WiringAuditResult;

  try {
    if (options.full) {
      // Run full audit (generic + RWM-specific)
      const fullResult = await runFullAudit(options.project);
      result = fullResult.combined;
    } else {
      // Run RWM-specific audit only (faster)
      result = await auditRWMWiring(options.project);
    }
  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(2);
  }

  // Output results
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHumanReadable(result, options);
  }

  // Save results if requested
  if (options.save) {
    const outputPath = await saveResults(result, options.project);
    console.log(`\n📁 Results saved to: ${outputPath}\n`);
  }

  // Exit with appropriate code
  process.exit(result.passed ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(2);
});
