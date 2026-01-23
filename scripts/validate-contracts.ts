#!/usr/bin/env npx tsx
/**
 * Contract Validation CLI Script
 * 
 * Runs contract validation and exits with code 1 if violations are found.
 * Designed for CI integration.
 * 
 * Usage: npx tsx scripts/validate-contracts.ts [--project-root <path>]
 * 
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T23 for implementation details.
 */

import path from 'path';
import { validateContracts } from '../src/audits/contract-validator.js';

interface CliOptions {
  projectRoot: string;
  verbose: boolean;
  json: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {
    projectRoot: process.cwd(),
    verbose: false,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--project-root' || arg === '-p') {
      options.projectRoot = args[++i] || process.cwd();
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Contract Validation CLI

Validates cross-file contracts to ensure consistency between:
- Backend event emissions and frontend listeners
- Criterion types and registered verifiers  
- PRD prompt types and runtime types

Usage: npx tsx scripts/validate-contracts.ts [options]

Options:
  -p, --project-root <path>  Project root directory (default: cwd)
  -v, --verbose              Show detailed output
  --json                     Output results as JSON
  -h, --help                 Show this help

Exit codes:
  0  All contracts valid
  1  Contract violations found (errors)
  2  Contract validation failed (e.g., missing files)

Examples:
  npx tsx scripts/validate-contracts.ts
  npx tsx scripts/validate-contracts.ts --project-root /path/to/project
  npx tsx scripts/validate-contracts.ts --json
`);
}

function formatViolation(v: {
  contract: string;
  file: string;
  line?: number;
  expected: string;
  actual: string;
  description: string;
  severity: 'error' | 'warning';
}): string {
  const location = v.line ? `${v.file}:${v.line}` : v.file;
  const severity = v.severity === 'error' ? '❌ ERROR' : '⚠️  WARNING';
  return `
  ${severity} [${v.contract}]
    Location: ${location}
    Expected: ${v.expected}
    Actual:   ${v.actual}
    ${v.description}`;
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.verbose) {
    console.log(`\n🔍 Validating contracts in: ${options.projectRoot}\n`);
  }

  try {
    const result = await validateContracts(options.projectRoot);

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      if (result.violations.length === 0) {
        console.log('✅ All contracts valid');
        console.log(`   Duration: ${result.durationMs}ms`);
      } else {
        console.log(`\n❌ ${result.errorCount} error(s), ${result.warningCount} warning(s)\n`);

        // Group violations by contract
        const byContract = new Map<string, typeof result.violations>();
        for (const v of result.violations) {
          const list = byContract.get(v.contract) || [];
          list.push(v);
          byContract.set(v.contract, list);
        }

        for (const [contract, violations] of byContract) {
          console.log(`\n── ${contract} ──`);
          for (const v of violations) {
            console.log(formatViolation(v));
          }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Errors:   ${result.errorCount}`);
        console.log(`   Warnings: ${result.warningCount}`);
        console.log(`   Duration: ${result.durationMs}ms`);
      }
    }

    // Exit with error code if there are errors
    if (result.errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Contract validation failed:', error);
    process.exit(2);
  }
}

main();
