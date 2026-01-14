/**
 * Architecture Generation Prompt Template
 * 
 * Template for generating architecture documents from requirements and PRD.
 * Based on REQUIREMENTS.md Section 5.3 (Architecture generation).
 */

import type { ParsedRequirements } from '../../types/requirements.js';
import type { PRD } from '../../types/prd.js';

/**
 * Builds the architecture generation prompt from parsed requirements and PRD.
 * 
 * @param parsed - Parsed requirements document
 * @param prd - Generated PRD structure
 * @param projectName - Project name
 * @returns Complete prompt string for AI platform
 */
export function buildArchPrompt(
  parsed: ParsedRequirements,
  prd: PRD,
  projectName: string
): string {
  const requirementsSummary = formatRequirementsSummary(parsed);
  const prdSummary = formatPrdSummary(prd);

  return `# Architecture Document Generation Request

## Project: ${projectName}

## Input Requirements

${requirementsSummary}

## Generated PRD Structure

${prdSummary}

## Your Task

Synthesize a comprehensive architecture document for this project. The architecture should:

1. **Overview**: High-level description of the system, its purpose, and key goals
2. **Module Breakdown**: Detailed breakdown of modules/components based on the PRD phases and tasks
3. **Dependencies**: Identify dependencies between modules, external libraries, and services
4. **Tech Stack**: Recommend appropriate technologies based on requirements (languages, frameworks, databases, tools)
5. **Test Strategy**: Outline testing approach (unit, integration, e2e) based on PRD test plans
6. **Directory Structure**: Suggest a logical directory structure for the codebase

## Output Format

Generate a markdown document with the following structure:

\`\`\`markdown
# Architecture Document

## Overview
[2-3 paragraph overview of the system]

## Module Breakdown
[Detailed breakdown of each module from PRD phases]

## Dependencies
[Internal dependencies between modules, external dependencies]

## Tech Stack
[Recommended technologies organized by category]

## Test Strategy
[Testing approach and tools]

## Directory Structure
[Suggested directory structure]
\`\`\`

## Guidelines

1. The architecture should be for the TARGET project (not Puppet Master itself)
2. Base module breakdown on the PRD phases and tasks
3. Identify dependencies between phases/tasks
4. Recommend technologies that match the requirements
5. Suggest a directory structure that supports the module breakdown
6. Keep the architecture practical and implementable
7. Consider scalability and maintainability

## Generate the architecture document now

Output the complete markdown document.`;
}

/**
 * Formats a concise summary of requirements for the prompt.
 */
function formatRequirementsSummary(parsed: ParsedRequirements): string {
  const lines: string[] = [];

  if (parsed.title) {
    lines.push(`**Title:** ${parsed.title}`);
    lines.push('');
  }

  // Add top-level sections
  if (parsed.sections.length > 0) {
    lines.push('**Sections:**');
    for (const section of parsed.sections) {
      lines.push(`- ${section.title}`);
      if (section.content.trim()) {
        const preview = section.content.trim().split('\n')[0];
        if (preview && preview.length < 150) {
          lines.push(`  ${preview}`);
        }
      }
    }
    lines.push('');
  }

  // Add goals
  if (parsed.extractedGoals.length > 0) {
    lines.push('**Goals:**');
    for (const goal of parsed.extractedGoals) {
      lines.push(`- ${goal}`);
    }
    lines.push('');
  }

  // Add constraints
  if (parsed.extractedConstraints.length > 0) {
    lines.push('**Constraints:**');
    for (const constraint of parsed.extractedConstraints) {
      lines.push(`- ${constraint}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Formats a concise summary of PRD structure for the prompt.
 */
function formatPrdSummary(prd: PRD): string {
  const lines: string[] = [];

  lines.push(`**Project:** ${prd.project}`);
  lines.push(`**Description:** ${prd.description}`);
  lines.push('');
  lines.push(`**Phases:** ${prd.phases.length}`);
  lines.push('');

  for (const phase of prd.phases) {
    lines.push(`### Phase: ${phase.id} - ${phase.title}`);
    if (phase.description) {
      const preview = phase.description.trim().split('\n')[0];
      if (preview && preview.length < 200) {
        lines.push(`  ${preview}`);
      }
    }
    lines.push(`  **Tasks:** ${phase.tasks.length}`);
    
    for (const task of phase.tasks) {
      lines.push(`  - Task: ${task.id} - ${task.title}`);
      lines.push(`    **Subtasks:** ${task.subtasks.length}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
