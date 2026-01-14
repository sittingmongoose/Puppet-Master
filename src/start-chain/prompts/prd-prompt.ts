/**
 * PRD Generation Prompt Template
 * 
 * Template for generating PRD (Product Requirements Document) from requirements.
 * Based on REQUIREMENTS.md Section 5.2 (Start Chain PRD Generation Prompt Template).
 */

import type { ParsedRequirements, ParsedSection } from '../../types/requirements.js';

/**
 * Builds the PRD generation prompt from parsed requirements.
 * 
 * @param parsed - Parsed requirements document
 * @param projectName - Project name for the PRD
 * @returns Complete prompt string for AI platform
 */
export function buildPrdPrompt(parsed: ParsedRequirements, projectName: string): string {
  // Format requirements content
  const requirementsContent = formatRequirementsContent(parsed);

  return `# PRD Generation Request

## Input Requirements Document

${requirementsContent}

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

interface Phase {
  id: string;                    // Format: "PH-001", "PH-002", etc.
  title: string;
  description: string;
  status: ItemStatus;            // "pending" for new items
  priority: number;
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
  tasks: Task[];
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
  createdAt: string;
  notes: string;
}

interface Criterion {
  id: string;                    // Format: "{itemId}-AC-001", "{itemId}-AC-002", etc.
  description: string;
  type: 'regex' | 'file_exists' | 'browser_verify' | 'command' | 'manual' | 'test' | 'cli_verify' | 'perf_verify' | 'ai_verify';
  target: string;                // For verifier tokens: "TEST:npm test", "CLI_VERIFY:npm run typecheck", etc.
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
   - \`TEST:npm test\` - Run test suite
   - \`CLI_VERIFY:npm run typecheck\` - Run type checking
   - \`FILE_VERIFY:src/auth.ts:exists\` - Verify file exists
   - \`REGEX_VERIFY:package.json:"version": "1\\.0\\.0"\` - Verify pattern in file
   - \`BROWSER_VERIFY:login-success\` - Browser verification scenario
4. Order items by dependency (earlier items don't depend on later)
5. Include test commands where applicable in testPlan
6. Use standard verifier tokens: TEST:, CLI_VERIFY:, BROWSER_VERIFY:, FILE_VERIFY:, REGEX_VERIFY:
7. Generate IDs following the format: PH-XXX, TK-XXX-XXX, ST-XXX-XXX-XXX
8. Set all status fields to "pending" for new items
9. Set createdAt to current ISO timestamp
10. Set branchName to "ralph/main" (default branch)

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
