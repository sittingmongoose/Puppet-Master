/**
 * PRD Generation Prompt Template
 * 
 * Template for generating PRD (Product Requirements Document) from requirements.
 * Based on REQUIREMENTS.md Appendix G: Start Chain PRD Generation Prompt Template.
 */

import type { ParsedRequirements, ParsedSection } from '../../types/requirements.js';

/**
 * Builds the PRD generation prompt from parsed requirements.
 *
 * @param parsed - Parsed requirements document
 * @param projectName - Project name for the PRD
 * @param interviewAssumptions - Optional assumptions from requirements interview (FIX 2)
 * @returns Complete prompt string for AI platform
 */
export function buildPrdPrompt(
  parsed: ParsedRequirements,
  projectName: string,
  interviewAssumptions?: string[]
): string {
  // Format requirements content
  const requirementsContent = formatRequirementsContent(parsed);

  // FIX 2: Format interview assumptions section if provided
  const assumptionsSection = interviewAssumptions && interviewAssumptions.length > 0
    ? `
## Default Assumptions (from Requirements Interview)

The following assumptions were documented during requirements interview.
Use these when requirements are unclear or ambiguous:

${interviewAssumptions.map(a => `- ${a}`).join('\n')}

`
    : '';

  return `# PRD Generation Request

## Input Requirements Document

${requirementsContent}
${assumptionsSection}
## Your Task

Generate a structured PRD (prd.json) from the requirements above.

## Output Format

Generate valid JSON matching this schema:

\`\`\`typescript
interface PRD {
  project: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  branchName: string;
  description: string;
  
  phases: Phase[];
  
  metadata: {
    totalPhases: number;
    completedPhases: number;
    totalTasks: number;
    completedTasks: number;
    totalSubtasks: number;
    completedSubtasks: number;
  };
}

interface SourceRef {
  sourcePath: string;            // File path to the source requirements document
  sectionPath: string;           // Section heading path (e.g., "Requirements > Section 4.2")
  excerptHash: string;           // SHA-256 hash of the source text excerpt
  lineNumbers?: [number, number]; // Optional line number range [start, end]
}

interface Phase {
  id: string;                    // Format: "PH-001", "PH-002", etc.
  title: string;
  description: string;
  status: ItemStatus;            // "pending" for new items
  priority: number;
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  tasks: Task[];
  sourceRefs?: SourceRef[];     // Optional: links back to source requirements sections
  createdAt: string;
  notes: string;
}

interface Task {
  id: string;                    // Format: "TK-001-001", "TK-001-002", etc.
  phaseId: string;
  title: string;
  description: string;
  status: ItemStatus;            // "pending" for new items
  priority: number;
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  subtasks: Subtask[];
  sourceRefs?: SourceRef[];     // Optional: links back to source requirements sections
  createdAt: string;
  notes: string;
}

interface Subtask {
  id: string;                    // Format: "ST-001-001-001", "ST-001-001-002", etc.
  taskId: string;
  title: string;
  description: string;
  status: ItemStatus;            // "pending" for new items
  priority: number;
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  iterations: [];                // Empty array for new items
  maxIterations: number;          // Default: 3
  sourceRefs?: SourceRef[];     // Optional: links back to source requirements sections
  createdAt: string;
  notes: string;
}

interface Criterion {
  id: string;                    // Format: "{itemId}-AC-001", "{itemId}-AC-002", etc.
  description: string;
  type: 'regex' | 'file_exists' | 'browser_verify' | 'command' | 'ai' | 'script';
  /**
   * Runtime target for the verifier. This should be directly executable by the runtime verifier.
   * Examples:
   * - command: \`npm test\`
   * - file_exists: \`src/auth.ts\`
   * - regex: \`package.json\`
   * - browser_verify: \`https://example.com/login\`
   * - script: \`.puppet-master/scripts/verify-ST-001-001-001-AC-001.sh\`
   */
  target: string;
  /**
   * Explicit verification instruction for this criterion.
   * Use spec tokens for built-in verifiers (preferred), or a script path for script-based criteria.
   *
   * Examples:
   * - \`TEST:npm test\`
   * - \`CLI_VERIFY:npm run typecheck\`
   * - \`FILE_VERIFY:src/auth.ts:exists\`
   * - \`REGEX_VERIFY:package.json:"version": "1\\.0\\.0"\`
   * - \`BROWSER_VERIFY:https://example.com/login\`
   * - \`./verify-dark-mode.sh\`
   */
  verification: string;
  /** Priority for this criterion (defaults to MUST if omitted) */
  priority?: 'MUST' | 'SHOULD' | 'COULD';
}

interface TestPlan {
  commands: TestCommand[];
  failFast: boolean;             // Default: true
}

interface TestCommand {
  command: string;
  args?: string[];
  workingDirectory?: string;
  timeout?: number;
}

type ItemStatus = 'pending' | 'planning' | 'running' | 'gating' | 'passed' | 'failed' | 'escalated' | 'reopened';
\`\`\`

## Rules

1. Break work into Phases → Tasks → Subtasks
2. Each Subtask must be ~1 context window of work (focused, testable unit)
3. Include explicit verifier tokens in acceptance criteria where applicable:
   - \`TEST:npm test\` - Run test suite (type: 'command')
   - \`CLI_VERIFY:npm run typecheck\` - Run type checking (type: 'command')
   - \`FILE_VERIFY:src/auth.ts:exists\` - Verify file exists (type: 'file_exists')
   - \`REGEX_VERIFY:package.json:"version": "1\\.0\\.0"\` - Verify pattern in file (type: 'regex')
   - \`BROWSER_VERIFY:login-success\` - Browser verification scenario (type: 'browser_verify')
   - \`PERF_VERIFY:...\` - Performance verification (type: 'command')
   - \`AI_VERIFY:...\` - AI-assisted verification (type: 'ai')
4. Map criterion types correctly:
   - 'command' - For TEST:, CLI_VERIFY:, PERF_VERIFY: tokens (runs shell commands)
   - 'file_exists' - For FILE_VERIFY: tokens (checks file existence)
   - 'regex' - For REGEX_VERIFY: tokens (pattern matching in files)
   - 'browser_verify' - For BROWSER_VERIFY: tokens (browser automation)
   - 'ai' - For AI_VERIFY: tokens or when human-like judgment is needed
   - NEVER use 'manual' - all criteria must be machine-verifiable
5. Order items by dependency (earlier items don't depend on later)
6. Include test commands where applicable in testPlan
7. Generate IDs following the format: PH-XXX, TK-XXX-XXX, ST-XXX-XXX-XXX
8. Set all status fields to "pending" for new items
9. Set createdAt to current ISO timestamp
10. Set branchName to "ralph/main" (default branch)
11. **IMPORTANT: Include sourceRefs for traceability:**
    - For each Phase, Task, and Subtask, include a sourceRefs array that maps back to the requirement section(s) it addresses
    - sourcePath: The file path from the requirements document (use the source path from the input)
    - sectionPath: Build a hierarchical path like "DocumentTitle > SectionTitle > SubsectionTitle" for each section this PRD item covers
    - excerptHash: Calculate SHA-256 hash of the relevant excerpt text from the source section (use the section content)
    - lineNumbers: Optional [start, end] line numbers if available
    - Example: If a Phase addresses "Requirements > Authentication > JWT Tokens", include a sourceRef with sectionPath: "Requirements > Authentication > JWT Tokens"

## Project Name

Project: ${projectName}

## Generate the PRD now

Output ONLY valid JSON, no markdown formatting or code blocks around the JSON.`;
}

/**
 * Formats parsed requirements into a readable string for the prompt.
 */
function formatRequirementsContent(parsed: ParsedRequirements): string {
  const lines: string[] = [];

  if (parsed.title) {
    lines.push(`# ${parsed.title}`);
    lines.push('');
  }

  // Add sections recursively
  for (const section of parsed.sections) {
    lines.push(formatSection(section, 0));
  }

  // Add extracted goals and constraints if present
  if (parsed.extractedGoals.length > 0) {
    lines.push('');
    lines.push('## Goals');
    for (const goal of parsed.extractedGoals) {
      lines.push(`- ${goal}`);
    }
  }

  if (parsed.extractedConstraints.length > 0) {
    lines.push('');
    lines.push('## Constraints');
    for (const constraint of parsed.extractedConstraints) {
      lines.push(`- ${constraint}`);
    }
  }

  return lines.join('\n');
}

/**
 * Formats a section recursively with proper heading levels.
 */
function formatSection(section: ParsedSection, baseLevel: number): string {
  const lines: string[] = [];
  const headingLevel = '#'.repeat(baseLevel + section.level);
  lines.push(`${headingLevel} ${section.title}`);
  lines.push('');

  if (section.content.trim()) {
    lines.push(section.content.trim());
    lines.push('');
  }

  for (const child of section.children) {
    lines.push(formatSection(child, baseLevel));
  }

  return lines.join('\n');
}
