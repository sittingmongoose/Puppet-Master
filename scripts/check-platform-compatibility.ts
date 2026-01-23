#!/usr/bin/env node
/**
 * Platform Compatibility Check CLI
 * 
 * Standalone script to check for Windows/Unix compatibility issues.
 * 
 * Usage: npm run check:platform
 * 
 * Per BUILD_QUEUE_IMPROVEMENTS.md P1-T24 (Platform Compatibility Validator).
 */

import { PlatformCompatibilityChecker } from '../src/audits/platform-compatibility.js';

async function main(): Promise<void> {
  const checker = new PlatformCompatibilityChecker();
  const issues = await checker.check(process.cwd());

  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  if (errors.length > 0) {
    console.log(`❌ ${errors.length} platform compatibility error(s):\n`);
    for (const e of errors) {
      console.log(`  ${e.file}:${e.line}`);
      console.log(`    ${e.description}`);
      console.log(`    Code: ${e.code}`);
      console.log(`    Fix: ${e.suggestion}\n`);
    }
  }

  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} platform compatibility warning(s):\n`);
    for (const w of warnings) {
      console.log(`  ${w.file}:${w.line}: ${w.description}`);
      console.log(`    Fix: ${w.suggestion}\n`);
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ No platform compatibility issues found');
  }

  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Error running platform compatibility check:', error);
  process.exit(1);
});
