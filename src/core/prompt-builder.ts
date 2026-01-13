/**
 * PromptBuilder
 *
 * Constructs prompts for iteration execution and gate reviews.
 * See REQUIREMENTS.md Appendix G (Prompt Templates).
 */

import type { Platform } from '../types/config.js';
import type { Criterion, TestPlan, TestCommand } from '../types/tiers.js';
import type { TierType } from '../types/state.js';
import type { ProgressEntry } from '../memory/progress-manager.js';
import type { AgentsContent } from '../memory/agents-manager.js';
import type { TierNode } from './tier-node.js';

export interface PromptContext {
  subtask: TierNode;
  task: TierNode;
  phase: TierNode;
  projectName: string;
  sessionId: string;
  platform: Platform;
  iterationNumber: number;
  maxIterations: number;
  progressEntries: ProgressEntry[];
  agentsContent: AgentsContent[];
  previousFailures?: FailureInfo[];
}

export interface FailureInfo {
  iterationNumber: number;
  error: string;
  testResults?: string;
  suggestions?: string;
}

export interface GateReviewChildItem {
  id: string;
  title: string;
  status: string;
}

export interface GateReviewContext {
  tierType: TierType;
  itemId: string;
  itemTitle: string;
  sessionId: string;
  platform: Platform;
  childItems: GateReviewChildItem[];
  aggregatedTestResults: string;
  aggregatedAcceptanceResults: string;
  evidencePaths: string[];
  acceptanceCriteria: Criterion[];
  testPlan: TestPlan;
}

export class PromptBuilder {
  buildIterationPrompt(context: PromptContext): string {
    const sections = [
      `# Iteration Prompt for ${context.subtask.id}`,
      this.formatContext(context),
      this.formatMemory(context.progressEntries, context.agentsContent),
      `## Your Assignment\n\n${this.formatAssignment(context.subtask)}`,
      `## Acceptance Criteria\n\nYou MUST satisfy ALL of these:\n\n${this.formatAcceptanceCriteria(
        context.subtask.data.acceptanceCriteria
      )}`,
      `## Test Requirements\n\nAfter implementation, these must pass:\n\n${this.formatTestRequirements(
        context.subtask.data.testPlan
      )}`,
      `## Important Rules\n\n${this.formatRules()}`,
      `## Previous Iteration Failures (if any)\n\n${this.formatPreviousFailures(
        context.previousFailures ?? []
      )}`,
      '## Begin',
    ];

    return sections.join('\n\n');
  }

  buildGateReviewPrompt(context: GateReviewContext): string {
    const tierType = context.tierType.toUpperCase();

    const lines: string[] = [];
    lines.push(`# Gate Review for ${tierType}: ${context.itemId}`);
    lines.push('');
    lines.push('## Overview');
    lines.push('');
    lines.push(`You are performing a ${tierType} gate review for:`);
    lines.push(`- ID: ${context.itemId}`);
    lines.push(`- Title: ${context.itemTitle}`);
    lines.push('');
    lines.push(`**Session ID:** ${context.sessionId}`);
    lines.push(`**Platform:** ${context.platform}`);
    lines.push('');
    lines.push('## Child Items Completed');
    lines.push('');
    lines.push(this.formatChildItems(context.childItems));
    lines.push('');
    lines.push('## Evidence Summary');
    lines.push('');
    lines.push('### Test Results');
    lines.push(context.aggregatedTestResults.trim().length > 0 ? context.aggregatedTestResults : 'None.');
    lines.push('');
    lines.push('### Acceptance Verification Results');
    lines.push(
      context.aggregatedAcceptanceResults.trim().length > 0 ? context.aggregatedAcceptanceResults : 'None.'
    );
    lines.push('');
    lines.push('### Evidence Files');
    lines.push(this.formatEvidencePaths(context.evidencePaths));
    lines.push('');
    lines.push('## Acceptance Criteria for This Gate');
    lines.push('');
    lines.push(this.formatAcceptanceCriteria(context.acceptanceCriteria));
    lines.push('');
    lines.push('## Test Plan for This Gate');
    lines.push('');
    lines.push(this.formatTestRequirements(context.testPlan));
    lines.push('');
    lines.push('## Your Task');
    lines.push('');
    lines.push('1. Review all child evidence');
    lines.push('2. Re-run tier-level tests');
    lines.push('3. Verify tier-level acceptance criteria');
    lines.push('4. Decide: PASS, SELF_FIX (if permitted), KICK_DOWN, or ESCALATE');
    lines.push('');
    lines.push('## Memory Updates Required');
    lines.push('');
    lines.push('If you learned anything that should be recorded:');
    lines.push('- Update AGENTS.md with reusable patterns');
    lines.push('- Note any gotchas or architecture decisions');
    lines.push('');
    lines.push('## Response Format');
    lines.push('');
    lines.push('Provide your decision in this format:');
    lines.push('');
    lines.push('```json');
    lines.push('{');
    lines.push('  "decision": "PASS | SELF_FIX | KICK_DOWN | ESCALATE",');
    lines.push('  "reason": "explanation",');
    lines.push('  "tests_rerun": ["list of commands run"],');
    lines.push('  "acceptance_verified": true | false,');
    lines.push('  "agents_update_required": true | false,');
    lines.push('  "agents_update_content": "content if required",');
    lines.push('  "kick_down_items": [/* if KICK_DOWN */],');
    lines.push('  "escalation_reason": "/* if ESCALATE */"');
    lines.push('}');
    lines.push('```');

    return lines.join('\n');
  }

  private formatContext(context: PromptContext): string {
    const lines: string[] = [];
    lines.push('## Context');
    lines.push('');
    lines.push(`You are working on project: ${context.projectName}`);
    lines.push('');
    lines.push('**Current Item:**');
    lines.push(`- ID: ${context.subtask.id}`);
    lines.push(`- Title: ${context.subtask.data.title}`);
    lines.push(`- Parent Task: ${context.task.id} - ${context.task.data.title}`);
    lines.push(`- Parent Phase: ${context.phase.id} - ${context.phase.data.title}`);
    lines.push('');
    lines.push(`**Session ID:** ${context.sessionId}`);
    lines.push(`**Platform:** ${context.platform}`);
    lines.push(`**Iteration:** ${context.iterationNumber} of ${context.maxIterations}`);
    return lines.join('\n');
  }

  private formatMemory(progress: ProgressEntry[], agents: AgentsContent[]): string {
    const lines: string[] = [];
    lines.push('## Memory (Loaded Context)');
    lines.push('');
    lines.push('### Recent Progress (from progress.txt)');
    lines.push(this.formatProgressEntries(progress));
    lines.push('');
    lines.push('### Long-Term Knowledge (from AGENTS.md)');
    lines.push(this.formatAgentsByLevel(agents, 'root'));
    lines.push('');
    lines.push('### Module-Specific Knowledge (if applicable)');
    lines.push(this.formatNonRootAgents(agents));
    return lines.join('\n');
  }

  private formatProgressEntries(entries: ProgressEntry[]): string {
    if (entries.length === 0) {
      return 'None.';
    }

    const lines: string[] = [];
    for (const entry of entries) {
      lines.push(`- ${entry.timestamp} - ${entry.itemId} (${entry.status})`);
      lines.push(`  - Session: ${entry.sessionId}`);
      lines.push(`  - Platform: ${entry.platform}`);
      lines.push(`  - Duration: ${entry.duration}`);

      if (entry.accomplishments.length > 0) {
        lines.push('  - What Was Done:');
        for (const accomplishment of entry.accomplishments) {
          lines.push(`    - ${accomplishment}`);
        }
      }

      if (entry.filesChanged.length > 0) {
        lines.push('  - Files Changed:');
        for (const file of entry.filesChanged) {
          lines.push(`    - \`${file.path}\` - ${file.description}`);
        }
      }

      if (entry.testsRun.length > 0) {
        lines.push('  - Tests Run:');
        for (const test of entry.testsRun) {
          lines.push(`    - \`${test.command}\` - ${test.result}`);
        }
      }

      if (entry.learnings.length > 0) {
        lines.push('  - Learnings:');
        for (const learning of entry.learnings) {
          lines.push(`    - ${learning}`);
        }
      }

      if (entry.nextSteps.length > 0) {
        lines.push('  - Next Steps:');
        for (const step of entry.nextSteps) {
          lines.push(`    - ${step}`);
        }
      }
    }

    return lines.join('\n');
  }

  private formatAgentsByLevel(agents: AgentsContent[], level: AgentsContent['level']): string {
    const matches = agents.filter((agent) => agent.level === level);
    if (matches.length === 0) {
      return 'None.';
    }

    return matches
      .map((agent) => (agent.content.trim().length > 0 ? agent.content.trim() : 'None.'))
      .join('\n\n');
  }

  private formatNonRootAgents(agents: AgentsContent[]): string {
    const nonRoot = agents.filter((agent) => agent.level !== 'root');
    if (nonRoot.length === 0) {
      return 'None.';
    }

    return nonRoot
      .map((agent) => {
        const label = `(${agent.level}) ${agent.path}`;
        const content = agent.content.trim().length > 0 ? agent.content.trim() : 'None.';
        return `${label}\n\n${content}`;
      })
      .join('\n\n');
  }

  private formatAssignment(subtask: TierNode): string {
    const plan = subtask.data.plan;
    const lines: string[] = [];

    lines.push(plan.description);

    if (plan.approach && plan.approach.length > 0) {
      lines.push('');
      lines.push('**Approach:**');
      for (const step of plan.approach) {
        lines.push(`- ${step}`);
      }
    }

    if (plan.dependencies && plan.dependencies.length > 0) {
      lines.push('');
      lines.push('**Dependencies:**');
      for (const dep of plan.dependencies) {
        lines.push(`- ${dep}`);
      }
    }

    return lines.join('\n').trim();
  }

  private formatAcceptanceCriteria(criteria: Criterion[]): string {
    if (criteria.length === 0) {
      return '- [ ] No acceptance criteria specified.';
    }

    return criteria.map((criterion) => `- [ ] ${criterion.id}: ${criterion.description}`).join('\n');
  }

  private formatTestRequirements(testPlan: TestPlan): string {
    if (testPlan.commands.length === 0) {
      return '- (No test commands specified.)';
    }

    return testPlan.commands.map((cmd) => `- \`${this.formatTestCommand(cmd)}\``).join('\n');
  }

  private formatTestCommand(cmd: TestCommand): string {
    const args = cmd.args?.map((arg) => this.quoteIfNeeded(arg)) ?? [];
    const full = [cmd.command, ...args].filter((part) => part.trim().length > 0).join(' ');
    if (cmd.workingDirectory && cmd.workingDirectory.trim().length > 0) {
      return `(cd ${cmd.workingDirectory} && ${full})`;
    }
    return full;
  }

  private quoteIfNeeded(value: string): string {
    if (value.length === 0) {
      return '""';
    }
    if (/[\s"]/u.test(value)) {
      return `"${value.replace(/"/gu, '\\"')}"`;
    }
    return value;
  }

  private formatRules(): string {
    return [
      '1. ONLY work on the current subtask scope',
      '2. Do NOT modify files outside the specified scope',
      '3. Run tests after making changes',
      '4. If you encounter a gotcha or pattern worth remembering, note it clearly',
      '5. Signal completion with: `<ralph>COMPLETE</ralph>`',
      '6. If stuck, signal: `<ralph>GUTTER</ralph>`',
    ].join('\n');
  }

  private formatPreviousFailures(failures: FailureInfo[]): string {
    if (failures.length === 0) {
      return 'None.';
    }

    const lines: string[] = [];
    for (const failure of failures) {
      lines.push(`- Iteration ${failure.iterationNumber}:`);
      lines.push(`  - Error: ${failure.error}`);
      if (failure.testResults && failure.testResults.trim().length > 0) {
        lines.push(`  - Test Results: ${failure.testResults}`);
      }
      if (failure.suggestions && failure.suggestions.trim().length > 0) {
        lines.push(`  - Suggestions: ${failure.suggestions}`);
      }
    }
    return lines.join('\n');
  }

  private formatChildItems(items: GateReviewChildItem[]): string {
    if (items.length === 0) {
      return 'None.';
    }

    return items.map((item) => `- ${item.id} - ${item.title} (${item.status})`).join('\n');
  }

  private formatEvidencePaths(paths: string[]): string {
    if (paths.length === 0) {
      return 'None.';
    }

    return paths.map((path) => `- \`${path}\``).join('\n');
  }
}

