#!/usr/bin/env npx tsx
/**
 * Integration Path Validation CLI Runner
 *
 * Validates that all critical integration paths have test coverage.
 * P0 paths MUST have tests - CI blocks merge if missing.
 *
 * Usage:
 *   npx tsx scripts/validate-integration-paths.ts [options]
 *
 * Options:
 *   --json              Output as JSON
 *   --save              Save results to .puppet-master/audits/integration-paths.md
 *   --project PATH      Project root directory (default: cwd)
 *   --include-skipped   Include skipped tests as valid coverage
 *   --include-todo      Include todo tests as valid coverage
 *   --category CAT      Only validate paths in this category
 *   --verbose           Show detailed output
 *
 * Exit codes:
 *   0 - All P0 paths have test coverage
 *   1 - Some P0 paths are missing test coverage
 *   2 - Runtime error
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T27 for implementation details.
 */

import {
  IntegrationPathValidator,
  type IntegrationPathValidationResult,
  type PathValidationResult,
} from '../src/audits/integration-path-validator.js';
import {
  INTEGRATION_PATH_MATRIX,
  getPathsByCategory,
  type IntegrationPathCategory,
} from '../src/audits/integration-path-matrix.js';

interface CLIOptions {
  json: boolean;
  save: boolean;
  project: string;
  includeSkipped: boolean;
  includeTodo: boolean;
  category?: IntegrationPathCategory;
  verbose: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    json: false,
    save: false,
    project: process.cwd(),
    includeSkipped: false,
    includeTodo: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') {
      options.json = true;
    } else if (arg === '--save') {
      options.save = true;
    } else if (arg === '--project' && i + 1 < args.length) {
      options.project = args[++i];
    } else if (arg === '--include-skipped') {
      options.includeSkipped = true;
    } else if (arg === '--include-todo') {
      options.includeTodo = true;
    } else if (arg === '--category' && i + 1 < args.length) {
      options.category = args[++i] as IntegrationPathCategory;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Integration Path Validation CLI

Validates that all critical integration paths have test coverage.
P0 paths MUST have tests - CI blocks merge if missing.

Usage: npx tsx scripts/validate-integration-paths.ts [options]

Options:
  --json              Output results as JSON
  --save              Save results to .puppet-master/audits/integration-paths.md
  --project PATH      Project root directory (default: current directory)
  --include-skipped   Include skipped tests as valid coverage
  --include-todo      Include todo tests as valid coverage
  --category CAT      Only validate paths in this category
                      (gui, cli, verification, git, start-chain)
  --verbose, -v       Show detailed output
  -h, --help          Show this help message

Exit codes:
  0 - All P0 paths have test coverage
  1 - Some P0 paths are missing test coverage
  2 - Runtime error

Examples:
  npx tsx scripts/validate-integration-paths.ts
  npx tsx scripts/validate-integration-paths.ts --save
  npx tsx scripts/validate-integration-paths.ts --category gui --verbose
  npx tsx scripts/validate-integration-paths.ts --json > results.json
`);
}

function getStatusIcon(result: PathValidationResult): string {
  if (result.passed) {
    return '✅';
  }
  if (!result.testFileExists) {
    return '❌';
  }
  return '⚠️';
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'p0':
      return '🔴 P0';
    case 'p1':
      return '🟡 P1';
    case 'p2':
      return '🟢 P2';
    default:
      return priority;
  }
}

function printHumanReadable(
  result: IntegrationPathValidationResult,
  options: CLIOptions
): void {
  console.log('\n═══════════════════════════════════════════');
  console.log('   Integration Path Test Coverage Report   ');
  console.log('═══════════════════════════════════════════\n');

  // Summary
  console.log('📊 Summary:');
  console.log(`   Duration: ${result.durationMs}ms`);
  console.log(`   Project: ${result.projectRoot}`);
  console.log('');
  console.log('   Coverage by Priority:');
  console.log(
    `     🔴 P0 (Critical):    ${result.summary.p0Passed}/${result.summary.p0Total} (${percentage(result.summary.p0Passed, result.summary.p0Total)})`
  );
  console.log(
    `     🟡 P1 (Important):   ${result.summary.p1Passed}/${result.summary.p1Total} (${percentage(result.summary.p1Passed, result.summary.p1Total)})`
  );
  console.log(
    `     🟢 P2 (Nice-to-have): ${result.summary.p2Passed}/${result.summary.p2Total} (${percentage(result.summary.p2Passed, result.summary.p2Total)})`
  );
  console.log('');

  // Overall status
  if (result.passed) {
    console.log('✅ All P0 critical paths have test coverage!\n');
  } else {
    console.log('❌ FAILED: Some P0 critical paths are missing test coverage!\n');
  }

  // Group by category
  const categories: IntegrationPathCategory[] = [
    'gui',
    'cli',
    'verification',
    'git',
    'start-chain',
  ];

  for (const category of categories) {
    const categoryResults = result.results.filter(
      (r) => r.path.category === category
    );
    if (categoryResults.length === 0) continue;

    const passed = categoryResults.filter((r) => r.passed).length;
    console.log(`\n─── ${category.toUpperCase()} (${passed}/${categoryResults.length}) ───\n`);

    for (const pathResult of categoryResults) {
      const icon = getStatusIcon(pathResult);
      const priority = getPriorityLabel(pathResult.path.priority);
      console.log(
        `${icon} ${priority} ${pathResult.path.name} (${pathResult.path.id})`
      );

      if (options.verbose) {
        console.log(`   ${pathResult.path.description}`);
        console.log(`   Test: ${pathResult.path.testFile}`);
        console.log(`   Pattern: ${pathResult.path.testPattern}`);
      }

      if (pathResult.passed) {
        if (options.verbose) {
          console.log(
            `   Matching: ${pathResult.matchingTests.join(', ')}`
          );
        }
        if (pathResult.warning) {
          console.log(`   ⚠️  ${pathResult.warning}`);
        }
      } else {
        console.log(`   ⚠️  ${pathResult.error}`);
      }

      if (options.verbose) {
        console.log('');
      }
    }
  }

  console.log('\n───────────────────────────────────────────');

  // Show failures summary
  const failures = result.results.filter(
    (r) => !r.passed && r.path.priority === 'p0'
  );
  if (failures.length > 0) {
    console.log('\n❌ P0 Paths Missing Tests:\n');
    for (const failure of failures) {
      console.log(`   - ${failure.path.id}: ${failure.path.name}`);
      console.log(`     Test file: ${failure.path.testFile}`);
      console.log(`     Pattern: ${failure.path.testPattern}`);
      console.log('');
    }
  }
}

function percentage(passed: number, total: number): string {
  if (total === 0) return 'N/A';
  const pct = (passed / total) * 100;
  return `${pct.toFixed(0)}%`;
}

async function main(): Promise<void> {
  const options = parseArgs();

  if (!options.json) {
    console.log(`\nValidating integration paths in: ${options.project}\n`);
  }

  // Get paths to validate
  let paths = INTEGRATION_PATH_MATRIX;
  if (options.category) {
    paths = getPathsByCategory(options.category);
    if (!options.json) {
      console.log(`Filtering to category: ${options.category} (${paths.length} paths)\n`);
    }
  }

  // Create validator
  const validator = new IntegrationPathValidator({
    projectRoot: options.project,
    paths,
    includeSkipped: options.includeSkipped,
    includeTodo: options.includeTodo,
  });

  let result: IntegrationPathValidationResult;

  try {
    result = await validator.validateAll();
  } catch (error) {
    console.error('Validation failed:', error);
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
    const reportPath = await validator.saveReport(result);
    console.log(`\n📁 Results saved to: ${reportPath}\n`);
  }

  // Exit with appropriate code
  // Exit 1 if ANY P0 path is missing tests
  if (!result.passed) {
    const p0Failures = result.results.filter(
      (r) => !r.passed && r.path.priority === 'p0'
    );
    console.error(`\n❌ ${p0Failures.length} P0 integration paths missing tests!`);
    console.error('P0 paths MUST have integration tests before merge.\n');
    process.exit(1);
  }

  // Warn about P1 failures but don't block
  const p1Failures = result.results.filter(
    (r) => !r.passed && r.path.priority === 'p1'
  );
  if (p1Failures.length > 0 && !options.json) {
    console.log(`\n⚠️  ${p1Failures.length} P1 paths missing tests (not blocking)\n`);
  }

  if (!options.json) {
    console.log('\n✅ All P0 integration paths have test coverage\n');
  }
  process.exit(0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(2);
});
