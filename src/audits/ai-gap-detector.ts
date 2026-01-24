/**
 * AI Gap Detector for RWM Puppet Master
 *
 * Uses AI to find implementation gaps that static analysis misses.
 * Compares PRD, architecture, and codebase to identify:
 * - Missing implementations
 * - Integration gaps
 * - Architectural mismatches
 * - Missing error handling
 * - Missing edge cases
 * - Incomplete features
 * - Untested paths
 * - Configuration gaps
 *
 * See BUILD_QUEUE_IMPROVEMENTS.md P1-T26 for implementation details.
 */

import { promises as fs } from 'fs';
import { join, relative } from 'path';
import type { PRD } from '../types/prd.js';
import type { PlatformRegistry } from '../platforms/registry.js';
import type { QuotaManager } from '../platforms/quota-manager.js';
import type { ExecutionRequest } from '../types/platforms.js';
import type {
  GapDetectionInput,
  GapDetectionResult,
  DetectedGap,
  GapDetectionCoverage,
  CodebaseStructure,
  CodebaseFile,
  CodebaseModule,
  TestInfo,
  AIGapDetectorConfig,
  GapDetectionPRDSummary,
  GapDetectionPhaseSummary,
  GapDetectionTaskSummary,
  GapDetectionSubtaskSummary,
  GapType,
  GapSeverity,
} from '../types/gap-detection.js';
import {
  DEFAULT_AI_GAP_DETECTOR_CONFIG,
  GAP_DETECTION_RESPONSE_SCHEMA,
} from '../types/gap-detection.js';

/**
 * AIGapDetector class.
 *
 * Performs AI-assisted gap analysis between PRD specifications,
 * architecture design, and actual codebase implementation.
 */
export class AIGapDetector {
  private readonly config: AIGapDetectorConfig;
  private readonly platformRegistry?: PlatformRegistry;
  private readonly quotaManager?: QuotaManager;

  /**
   * Creates a new AIGapDetector instance.
   *
   * @param config - Configuration options (defaults to DEFAULT_AI_GAP_DETECTOR_CONFIG)
   * @param platformRegistry - Optional platform registry for AI invocation
   * @param quotaManager - Optional quota manager for rate limiting
   */
  constructor(
    config: Partial<AIGapDetectorConfig> = {},
    platformRegistry?: PlatformRegistry,
    quotaManager?: QuotaManager
  ) {
    this.config = { ...DEFAULT_AI_GAP_DETECTOR_CONFIG, ...config };
    this.platformRegistry = platformRegistry;
    this.quotaManager = quotaManager;
  }

  /**
   * Detects gaps between PRD, architecture, and codebase.
   *
   * @param input - Gap detection input with PRD, architecture, codebase structure
   * @returns Gap detection result with detected gaps and metrics
   */
  async detectGaps(input: GapDetectionInput): Promise<GapDetectionResult> {
    const startTime = Date.now();

    try {
      // Build the comprehensive prompt
      const prompt = this.buildPrompt(input);

      // If no platform registry, return empty result (allows testing without AI)
      if (!this.platformRegistry) {
        return this.createEmptyResult(startTime, 'No platform registry provided - running in mock mode');
      }

      // Check quota
      if (this.quotaManager) {
        const canProceed = await this.quotaManager.canProceed(this.config.platform);
        if (!canProceed) {
          return this.createEmptyResult(startTime, `Quota exceeded for platform ${this.config.platform}`);
        }
      }

      // Get platform runner
      const runner = this.platformRegistry.get(this.config.platform);
      if (!runner) {
        return this.createEmptyResult(startTime, `Platform ${this.config.platform} not available`);
      }

      // Build execution request
      const request: ExecutionRequest = {
        prompt,
        workingDirectory: input.codebaseStructure.projectRoot,
        model: this.config.model,
        timeout: this.config.timeout,
        hardTimeout: this.config.timeout ? this.config.timeout * 2 : undefined,
        nonInteractive: true,
      };

      // Execute AI request
      const result = await runner.execute(request);

      // Parse response
      if (result.exitCode === 0 && result.output) {
        return this.parseResponse(result.output, startTime);
      } else {
        return this.createEmptyResult(
          startTime,
          `AI execution failed: ${result.error || 'Unknown error'}`
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.createEmptyResult(startTime, `Gap detection failed: ${errorMessage}`);
    }
  }

  /**
   * Builds the comprehensive prompt for AI gap detection.
   *
   * @param input - Gap detection input
   * @returns Formatted prompt string
   */
  buildPrompt(input: GapDetectionInput): string {
    const prdSummary = this.formatPRDSummary(input.prd);
    const codebaseSummary = this.formatCodebaseStructure(input.codebaseStructure);
    const testsSummary = this.formatTestInfo(input.existingTests);

    return `You are a senior software architect performing a gap analysis between a PRD, architecture design, and existing codebase.

## Your Task
Identify gaps, misalignments, and missing pieces that could cause the implementation to fail or be incomplete.

## PRD Summary
${prdSummary}

## Architecture
${input.architecture}

## Codebase Structure
${codebaseSummary}

## Existing Tests
${testsSummary}

## Gap Categories to Check

### 1. Missing Implementation
- PRD items that have no corresponding code
- Features described but not implemented
- Acceptance criteria with no verification code

### 2. Integration Gaps
- Components that exist but aren't connected
- APIs defined but not called
- Events emitted but not handled
- Dependencies registered but not injected

### 3. Architectural Mismatches
- Code that doesn't follow the architecture
- Missing layers (e.g., no error handling layer)
- Incorrect dependency directions

### 4. Missing Error Handling
- External calls without try/catch
- No timeout handling
- No retry logic where specified
- No graceful degradation

### 5. Missing Edge Cases
- Boundary conditions not handled
- Empty/null inputs not checked
- Concurrent access not considered

### 6. Incomplete Features
- Partial implementations
- TODOs or FIXMEs in critical paths
- Stubbed methods

### 7. Untested Paths
- Code paths with no test coverage
- Integration points untested
- Error paths untested

### 8. Configuration Gaps
- Config options referenced but not defined
- Environment differences not handled
- Secrets not properly managed

## Output Format
Return a JSON object with this structure:
${JSON.stringify(GAP_DETECTION_RESPONSE_SCHEMA, null, 2)}

## Example Output
\`\`\`json
{
  "gaps": [
    {
      "id": "GAP-001",
      "type": "missing_implementation",
      "severity": "critical",
      "prdItemId": "ST-001-001-001",
      "location": "src/core/orchestrator.ts",
      "description": "PRD requires branch strategy but orchestrator doesn't use it",
      "evidence": "BranchStrategy is implemented in src/git/branch-strategy.ts but never instantiated in orchestrator",
      "suggestedFix": "Inject BranchStrategy into Orchestrator and call ensureBranch() before tier execution"
    }
  ],
  "coverage": {
    "prdItemsCovered": 45,
    "prdItemsTotal": 50,
    "architectureComponentsCovered": 8,
    "architectureComponentsTotal": 10
  },
  "confidence": 0.85
}
\`\`\`

## Important Instructions
1. Be specific - reference exact file paths and PRD item IDs
2. Provide evidence - explain WHY you think something is a gap
3. Prioritize by severity - critical gaps should block deployment
4. Don't flag style issues - only functional gaps
5. Consider the "no manual tests" requirement - gaps in automated verification are critical
6. Focus on the DELTA between what the PRD specifies and what the codebase implements
7. Return ONLY valid JSON, no markdown code blocks or explanations outside the JSON

Return the JSON response now:`;
  }

  /**
   * Formats PRD summary for the prompt.
   *
   * @param prdSummary - PRD summary object
   * @returns Formatted string
   */
  private formatPRDSummary(prdSummary: GapDetectionPRDSummary): string {
    const lines: string[] = [];

    lines.push(`Project: ${prdSummary.project}`);
    lines.push(`Phases: ${prdSummary.phaseCount}, Tasks: ${prdSummary.taskCount}, Subtasks: ${prdSummary.subtaskCount}`);
    lines.push('');

    for (const phase of prdSummary.phases) {
      lines.push(`## Phase: ${phase.id} - ${phase.title}`);
      for (const task of phase.tasks) {
        lines.push(`  ### Task: ${task.id} - ${task.title}`);
        for (const subtask of task.subtasks) {
          lines.push(`    - ${subtask.id}: ${subtask.title}`);
          if (subtask.acceptanceCriteria.length > 0) {
            lines.push(`      Criteria: ${subtask.acceptanceCriteria.join('; ')}`);
          }
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Formats codebase structure for the prompt.
   *
   * @param structure - Codebase structure
   * @returns Formatted string
   */
  private formatCodebaseStructure(structure: CodebaseStructure): string {
    const lines: string[] = [];

    lines.push(`Project Root: ${structure.projectRoot}`);
    lines.push(`Source Directories: ${structure.sourceDirs.join(', ')}`);
    lines.push(`Entry Points: ${structure.entryPoints.join(', ')}`);
    if (structure.totalLinesOfCode) {
      lines.push(`Total Lines of Code: ~${structure.totalLinesOfCode}`);
    }
    lines.push('');

    // List modules
    lines.push('### Modules');
    for (const module of structure.modules) {
      lines.push(`- ${module.name} (${module.path})`);
      if (module.description) {
        lines.push(`  Description: ${module.description}`);
      }
      lines.push(`  Exports: ${module.exports.slice(0, 10).join(', ')}${module.exports.length > 10 ? '...' : ''}`);
      lines.push(`  Dependencies: ${module.dependencies.join(', ') || 'none'}`);
    }

    // List key files
    lines.push('');
    lines.push('### Key Source Files');
    const sourceFiles = structure.files.filter(f => f.isSource).slice(0, 30);
    for (const file of sourceFiles) {
      const exportInfo = file.exports ? ` (exports: ${file.exports.slice(0, 5).join(', ')}${file.exports.length > 5 ? '...' : ''})` : '';
      lines.push(`- ${file.path}${exportInfo}`);
    }

    if (structure.files.filter(f => f.isSource).length > 30) {
      lines.push(`... and ${structure.files.filter(f => f.isSource).length - 30} more source files`);
    }

    return lines.join('\n');
  }

  /**
   * Formats test information for the prompt.
   *
   * @param tests - Test information array
   * @returns Formatted string
   */
  private formatTestInfo(tests: TestInfo[]): string {
    if (tests.length === 0) {
      return 'No tests found.';
    }

    const lines: string[] = [];
    for (const test of tests) {
      const framework = test.framework ? ` (${test.framework})` : '';
      lines.push(`- ${test.file}: ${test.testCount} tests${framework}`);
      if (test.coveragePatterns.length > 0) {
        lines.push(`  Covers: ${test.coveragePatterns.join(', ')}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Parses AI response into GapDetectionResult.
   *
   * @param output - Raw AI output
   * @param startTime - Start timestamp for duration calculation
   * @returns Parsed gap detection result
   */
  private parseResponse(output: string, startTime: number): GapDetectionResult {
    const durationMs = Date.now() - startTime;

    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = output.trim();

      // Remove markdown code blocks if present
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      // Parse JSON
      const parsed = JSON.parse(jsonStr) as {
        gaps: Array<{
          id: string;
          type: string;
          severity: string;
          prdItemId?: string;
          location?: string;
          description: string;
          evidence: string;
          suggestedFix: string;
        }>;
        coverage: {
          prdItemsCovered: number;
          prdItemsTotal: number;
          architectureComponentsCovered: number;
          architectureComponentsTotal: number;
        };
        confidence: number;
      };

      // Validate and transform gaps
      const gaps: DetectedGap[] = parsed.gaps.map((gap, index) => ({
        id: gap.id || `GAP-${String(index + 1).padStart(3, '0')}`,
        type: this.validateGapType(gap.type),
        severity: this.validateSeverity(gap.severity),
        prdItemId: gap.prdItemId,
        location: gap.location,
        description: gap.description,
        evidence: gap.evidence,
        suggestedFix: gap.suggestedFix,
      }));

      // Validate coverage
      const coverage: GapDetectionCoverage = {
        prdItemsCovered: parsed.coverage?.prdItemsCovered ?? 0,
        prdItemsTotal: parsed.coverage?.prdItemsTotal ?? 0,
        architectureComponentsCovered: parsed.coverage?.architectureComponentsCovered ?? 0,
        architectureComponentsTotal: parsed.coverage?.architectureComponentsTotal ?? 0,
      };

      // Validate confidence
      const confidence = Math.min(1, Math.max(0, parsed.confidence ?? 0.5));

      return {
        gaps,
        coverage,
        confidence,
        timestamp: new Date().toISOString(),
        durationMs,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return this.createEmptyResult(startTime, `Failed to parse AI response: ${errorMessage}`);
    }
  }

  /**
   * Validates and normalizes gap type.
   */
  private validateGapType(type: string): GapType {
    const validTypes: GapType[] = [
      'missing_implementation',
      'integration_gap',
      'architectural_mismatch',
      'missing_error_handling',
      'missing_edge_case',
      'incomplete_feature',
      'untested_path',
      'config_gap',
    ];

    if (validTypes.includes(type as GapType)) {
      return type as GapType;
    }

    // Try to map common variations
    const normalized = type.toLowerCase().replace(/[_\s-]+/g, '_');
    if (validTypes.includes(normalized as GapType)) {
      return normalized as GapType;
    }

    // Default to missing_implementation
    return 'missing_implementation';
  }

  /**
   * Validates and normalizes severity.
   */
  private validateSeverity(severity: string): GapSeverity {
    const validSeverities: GapSeverity[] = ['critical', 'high', 'medium', 'low'];

    if (validSeverities.includes(severity as GapSeverity)) {
      return severity as GapSeverity;
    }

    // Default to medium
    return 'medium';
  }

  /**
   * Creates an empty result (for errors or mock mode).
   */
  private createEmptyResult(startTime: number, warning: string): GapDetectionResult {
    return {
      gaps: [],
      coverage: {
        prdItemsCovered: 0,
        prdItemsTotal: 0,
        architectureComponentsCovered: 0,
        architectureComponentsTotal: 0,
      },
      confidence: 0,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      warnings: [warning],
    };
  }

  // ==========================================================================
  // Helper Methods for Building Input
  // ==========================================================================

  /**
   * Recursively walks a directory and collects files matching patterns.
   * @param dir - Directory to walk
   * @param patterns - File extension patterns to match (e.g., ['.ts', '.js'])
   * @param excludePatterns - Patterns to exclude (e.g., ['node_modules', '.test.'])
   * @returns Array of file paths
   */
  private static async walkDirectory(
    dir: string,
    patterns: string[],
    excludePatterns: string[] = []
  ): Promise<string[]> {
    const results: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        // Check if should be excluded
        const shouldExclude = excludePatterns.some(pattern =>
          fullPath.includes(pattern) || entry.name.includes(pattern)
        );
        if (shouldExclude) continue;

        if (entry.isDirectory()) {
          const subResults = await AIGapDetector.walkDirectory(fullPath, patterns, excludePatterns);
          results.push(...subResults);
        } else if (entry.isFile()) {
          const matchesPattern = patterns.some(pattern =>
            entry.name.endsWith(pattern) || entry.name.includes(pattern)
          );
          if (matchesPattern) {
            results.push(fullPath);
          }
        }
      }
    } catch {
      // Directory doesn't exist or not accessible
    }

    return results;
  }

  /**
   * Builds codebase structure from project root.
   *
   * @param projectRoot - Project root directory
   * @param sourceDirs - Source directories to scan (default: ['src'])
   * @returns Codebase structure
   */
  static async buildCodebaseStructure(
    projectRoot: string,
    sourceDirs: string[] = ['src']
  ): Promise<CodebaseStructure> {
    const files: CodebaseFile[] = [];
    const modules: CodebaseModule[] = [];
    const entryPoints: string[] = [];
    const configFiles: string[] = [];

    // Find all source files
    for (const srcDir of sourceDirs) {
      const srcPath = join(projectRoot, srcDir);

      try {
        // Walk directory for source files
        const sourcePatterns = ['.ts', '.js', '.tsx', '.jsx'];
        const excludePatterns = ['node_modules', '.test.', '.spec.'];
        const matches = await AIGapDetector.walkDirectory(srcPath, sourcePatterns, excludePatterns);

        for (const filePath of matches) {
          const relativePath = relative(projectRoot, filePath);
          const stat = await fs.stat(filePath);

          const file: CodebaseFile = {
            path: relativePath,
            size: stat.size,
            isSource: true,
            exports: await AIGapDetector.extractExports(filePath),
            imports: await AIGapDetector.extractImports(filePath),
          };

          files.push(file);

          // Detect entry points
          if (relativePath.includes('index.ts') || relativePath.includes('main.ts') ||
              relativePath.includes('cli/') || relativePath.includes('server.')) {
            entryPoints.push(relativePath);
          }
        }

        // Build modules from top-level directories in src
        const srcEntries = await fs.readdir(srcPath, { withFileTypes: true }).catch(() => []);
        for (const entry of srcEntries) {
          if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
            const moduleName = entry.name;
            const moduleFiles = files.filter(f => f.path.startsWith(join(srcDir, moduleName)));

            const moduleExports = moduleFiles.flatMap(f => f.exports || []);
            const moduleImports = moduleFiles.flatMap(f => f.imports || []);

            // Extract dependencies (other modules this module imports from)
            const dependencies = [...new Set(
              moduleImports
                .filter(imp => imp.startsWith('../') || imp.startsWith('./'))
                .map(imp => {
                  const match = imp.match(/^\.\.?\/([^/]+)/);
                  return match ? match[1] : null;
                })
                .filter((d): d is string => d !== null && d !== moduleName)
            )];

            modules.push({
              name: moduleName,
              path: join(srcDir, moduleName),
              files: moduleFiles.map(f => f.path),
              exports: [...new Set(moduleExports)],
              dependencies,
            });
          }
        }
      } catch {
        // Directory doesn't exist or not accessible
      }
    }

    // Find config files in project root
    try {
      const rootEntries = await fs.readdir(projectRoot, { withFileTypes: true });
      for (const entry of rootEntries) {
        if (entry.isFile()) {
          const name = entry.name;
          if (name.endsWith('.json') || name.endsWith('.yaml') || name.endsWith('.yml') ||
              name.includes('.config.') || name === 'tsconfig.json' || name === 'package.json') {
            configFiles.push(name);
          }
        }
      }
    } catch {
      // Ignore errors
    }

    // Calculate approximate lines of code
    let totalLines = 0;
    for (const file of files.filter(f => f.isSource)) {
      try {
        const content = await fs.readFile(join(projectRoot, file.path), 'utf-8');
        totalLines += content.split('\n').length;
      } catch {
        // Ignore errors
      }
    }

    return {
      projectRoot,
      sourceDirs,
      files,
      modules,
      entryPoints,
      configFiles,
      totalLinesOfCode: totalLines,
    };
  }

  /**
   * Extracts export names from a TypeScript/JavaScript file.
   */
  private static async extractExports(filePath: string): Promise<string[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const exports: string[] = [];

      // Match export declarations
      const exportRegex = /export\s+(?:(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+)?(\w+)/g;
      let match;
      while ((match = exportRegex.exec(content)) !== null) {
        if (match[1] && match[1] !== 'default') {
          exports.push(match[1]);
        }
      }

      // Match named exports
      const namedExportRegex = /export\s*\{\s*([^}]+)\s*\}/g;
      while ((match = namedExportRegex.exec(content)) !== null) {
        const names = match[1].split(',').map(n => n.trim().split(/\s+as\s+/)[0].trim());
        exports.push(...names.filter(n => n && n !== 'type'));
      }

      return [...new Set(exports)];
    } catch {
      return [];
    }
  }

  /**
   * Extracts import module names from a TypeScript/JavaScript file.
   */
  private static async extractImports(filePath: string): Promise<string[]> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const imports: string[] = [];

      // Match import statements
      const importRegex = /import\s+(?:(?:type\s+)?(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        if (match[1]) {
          imports.push(match[1]);
        }
      }

      return [...new Set(imports)];
    } catch {
      return [];
    }
  }

  /**
   * Finds existing tests in the project.
   *
   * @param projectRoot - Project root directory
   * @returns Array of test information
   */
  static async findExistingTests(projectRoot: string): Promise<TestInfo[]> {
    const tests: TestInfo[] = [];

    try {
      // Walk directory for test files
      const testPatterns = ['.test.ts', '.spec.ts', '.test.js', '.spec.js'];
      const excludePatterns = ['node_modules'];
      const allTestFiles = await AIGapDetector.walkDirectory(projectRoot, testPatterns, excludePatterns);

      for (const testFile of allTestFiles) {
        const content = await fs.readFile(testFile, 'utf-8');
        const relativePath = relative(projectRoot, testFile);

        // Count test cases
        const itMatches = content.match(/\b(?:it|test)\s*\(/g);
        const testCount = itMatches ? itMatches.length : 0;

        // Detect framework
        let framework: 'vitest' | 'jest' | 'mocha' | 'other' = 'other';
        if (content.includes('from \'vitest\'') || content.includes('from "vitest"')) {
          framework = 'vitest';
        } else if (content.includes('@jest/') || content.includes('jest.')) {
          framework = 'jest';
        } else if (content.includes('from \'mocha\'') || content.includes('from "mocha"')) {
          framework = 'mocha';
        } else if (content.includes('describe(')) {
          // Generic describe - could be mocha, jasmine, or other
          framework = 'mocha';
        }

        // Extract coverage patterns (what does this test cover?)
        const coveragePatterns: string[] = [];
        const describeMatches = content.match(/describe\s*\(\s*['"]([^'"]+)['"]/g);
        if (describeMatches) {
          for (const descMatch of describeMatches) {
            const nameMatch = descMatch.match(/['"]([^'"]+)['"]/);
            if (nameMatch) {
              coveragePatterns.push(nameMatch[1]);
            }
          }
        }

        tests.push({
          file: relativePath,
          testCount,
          coveragePatterns,
          framework,
        });
      }
    } catch {
      // Ignore errors
    }

    return tests;
  }

  /**
   * Summarizes a PRD for gap detection input.
   *
   * @param prd - Full PRD object
   * @returns Summarized PRD for gap detection
   */
  static summarizePRD(prd: PRD): GapDetectionPRDSummary {
    let taskCount = 0;
    let subtaskCount = 0;

    const phases: GapDetectionPhaseSummary[] = prd.phases.map(phase => {
      const tasks: GapDetectionTaskSummary[] = phase.tasks.map(task => {
        taskCount++;

        const subtasks: GapDetectionSubtaskSummary[] = task.subtasks.map(subtask => {
          subtaskCount++;

          return {
            id: subtask.id,
            title: subtask.title,
            acceptanceCriteria: subtask.acceptanceCriteria.map(c => c.description),
          };
        });

        return {
          id: task.id,
          title: task.title,
          subtasks,
        };
      });

      return {
        id: phase.id,
        title: phase.title,
        tasks,
      };
    });

    return {
      project: prd.project,
      phaseCount: prd.phases.length,
      taskCount,
      subtaskCount,
      phases,
    };
  }
}

/**
 * Factory function to create AIGapDetector with default configuration.
 *
 * @param config - Optional partial configuration
 * @param platformRegistry - Optional platform registry
 * @param quotaManager - Optional quota manager
 * @returns Configured AIGapDetector instance
 */
export function createAIGapDetector(
  config?: Partial<AIGapDetectorConfig>,
  platformRegistry?: PlatformRegistry,
  quotaManager?: QuotaManager
): AIGapDetector {
  return new AIGapDetector(config, platformRegistry, quotaManager);
}
