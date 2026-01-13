/**
 * PromptBuilder tests
 *
 * Comprehensive test coverage for prompt building functionality.
 * Tests prompt structure per REQUIREMENTS.md Appendix G.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PromptBuilder } from './prompt-builder.js';
import type { PromptContext, FailureInfo, GateReviewContext } from './prompt-builder.js';
import { TierNode, createTierNode } from './tier-node.js';
import type { TierNodeData } from './tier-node.js';
import type { ProgressEntry } from '../memory/progress-manager.js';
import type { AgentsContent } from '../memory/agents-manager.js';
import type { Platform } from '../types/config.js';

describe('PromptBuilder', () => {
  let builder: PromptBuilder;
  let now: string;

  beforeEach(() => {
    builder = new PromptBuilder();
    now = new Date().toISOString();
  });

  function createPhaseNode(): TierNode {
    const data: TierNodeData = {
      id: 'PH-001',
      type: 'phase',
      title: 'Test Phase',
      description: 'Phase Description',
      plan: {
        id: 'PH-001',
        title: 'Test Phase',
        description: 'Phase Description',
        approach: ['Step 1', 'Step 2'],
        dependencies: ['Dep1'],
      },
      acceptanceCriteria: [
        {
          id: 'PH-AC-001',
          description: 'Phase criterion 1',
          type: 'manual',
          target: '',
        },
      ],
      testPlan: {
        commands: [
          {
            command: 'npm',
            args: ['test', '--', '-t', 'phase'],
            workingDirectory: '.',
          },
        ],
        failFast: true,
      },
      evidence: [],
      iterations: 0,
      maxIterations: 1,
      createdAt: now,
      updatedAt: now,
    };
    return createTierNode(data);
  }

  function createTaskNode(parent?: TierNode): TierNode {
    const data: TierNodeData = {
      id: 'TK-001-001',
      type: 'task',
      title: 'Test Task',
      description: 'Task Description',
      plan: {
        id: 'TK-001-001',
        title: 'Test Task',
        description: 'Task Description',
        approach: ['Task Step 1'],
      },
      acceptanceCriteria: [],
      testPlan: {
        commands: [],
        failFast: false,
      },
      evidence: [],
      iterations: 0,
      maxIterations: 1,
      createdAt: now,
      updatedAt: now,
    };
    return createTierNode(data, parent);
  }

  function createSubtaskNode(parent?: TierNode): TierNode {
    const data: TierNodeData = {
      id: 'ST-001-001-001',
      type: 'subtask',
      title: 'Test Subtask',
      description: 'Subtask Description',
      plan: {
        id: 'ST-001-001-001',
        title: 'Test Subtask',
        description: 'Subtask Description',
        approach: ['Subtask Step 1', 'Subtask Step 2'],
        dependencies: ['Subtask Dep'],
      },
      acceptanceCriteria: [
        {
          id: 'ST-AC-001',
          description: 'Subtask criterion 1',
          type: 'command',
          target: 'npm test',
        },
        {
          id: 'ST-AC-002',
          description: 'Subtask criterion 2',
          type: 'file_exists',
          target: 'src/file.ts',
        },
      ],
      testPlan: {
        commands: [
          {
            command: 'npm',
            args: ['run', 'typecheck'],
          },
          {
            command: 'npm',
            args: ['test', '--', '-t', 'subtask'],
            workingDirectory: 'src',
          },
        ],
        failFast: true,
      },
      evidence: [],
      iterations: 0,
      maxIterations: 3,
      createdAt: now,
      updatedAt: now,
    };
    return createTierNode(data, parent);
  }

  function createProgressEntries(): ProgressEntry[] {
    return [
      {
        timestamp: '2026-01-10T12:00:00Z',
        itemId: 'ST-001-001-001',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        duration: '5m 30s',
        status: 'SUCCESS',
        accomplishments: ['Created file', 'Updated tests'],
        filesChanged: [
          { path: 'src/file.ts', description: 'Created new file' },
        ],
        testsRun: [
          { command: 'npm test', result: 'PASS' },
        ],
        learnings: ['Learning 1', 'Learning 2'],
        nextSteps: ['Next step 1'],
      },
      {
        timestamp: '2026-01-10T11:00:00Z',
        itemId: 'ST-001-001-000',
        sessionId: 'PM-2026-01-10-11-00-00-001',
        platform: 'codex',
        duration: '3m 15s',
        status: 'PARTIAL',
        accomplishments: ['Partial work'],
        filesChanged: [],
        testsRun: [],
        learnings: [],
        nextSteps: [],
      },
    ];
  }

  function createAgentsContent(): AgentsContent[] {
    return [
      {
        level: 'root',
        path: 'AGENTS.md',
        content: '# Root AGENTS.md\n\nRoot level knowledge content.',
        sections: {
          overview: '',
          architectureNotes: [],
          codebasePatterns: [],
          toolingRules: [],
          commonFailureModes: [],
          doItems: [],
          dontItems: [],
          testing: [],
          directoryStructure: [],
        },
      },
      {
        level: 'module',
        path: 'src/core/AGENTS.md',
        content: '# Module AGENTS.md\n\nModule specific knowledge.',
        sections: {
          overview: '',
          architectureNotes: [],
          codebasePatterns: [],
          toolingRules: [],
          commonFailureModes: [],
          doItems: [],
          dontItems: [],
          testing: [],
          directoryStructure: [],
        },
      },
    ];
  }

  function createFailureInfo(): FailureInfo[] {
    return [
      {
        iterationNumber: 1,
        error: 'Test failed',
        testResults: 'npm test: FAILED',
        suggestions: 'Fix the test',
      },
      {
        iterationNumber: 2,
        error: 'Type error',
        suggestions: 'Check types',
      },
    ];
  }

  describe('buildIterationPrompt', () => {
    it('should create complete prompt with all sections', () => {
      const phase = createPhaseNode();
      const task = createTaskNode(phase);
      const subtask = createSubtaskNode(task);

      const context: PromptContext = {
        subtask,
        task,
        phase,
        projectName: 'Test Project',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        iterationNumber: 1,
        maxIterations: 3,
        progressEntries: createProgressEntries(),
        agentsContent: createAgentsContent(),
      };

      const prompt = builder.buildIterationPrompt(context);

      // Check header
      expect(prompt).toContain('# Iteration Prompt for ST-001-001-001');

      // Check Context section
      expect(prompt).toContain('## Context');
      expect(prompt).toContain('You are working on project: Test Project');
      expect(prompt).toContain('ID: ST-001-001-001');
      expect(prompt).toContain('Title: Test Subtask');
      expect(prompt).toContain('Parent Task: TK-001-001 - Test Task');
      expect(prompt).toContain('Parent Phase: PH-001 - Test Phase');
      expect(prompt).toContain('**Session ID:** PM-2026-01-10-12-00-00-001');
      expect(prompt).toContain('**Platform:** cursor');
      expect(prompt).toContain('**Iteration:** 1 of 3');

      // Check Memory section
      expect(prompt).toContain('## Memory (Loaded Context)');
      expect(prompt).toContain('### Recent Progress (from progress.txt)');
      expect(prompt).toContain('### Long-Term Knowledge (from AGENTS.md)');
      expect(prompt).toContain('### Module-Specific Knowledge (if applicable)');

      // Check Assignment section
      expect(prompt).toContain('## Your Assignment');

      // Check Acceptance Criteria section
      expect(prompt).toContain('## Acceptance Criteria');
      expect(prompt).toContain('You MUST satisfy ALL of these:');

      // Check Test Requirements section
      expect(prompt).toContain('## Test Requirements');
      expect(prompt).toContain('After implementation, these must pass:');

      // Check Important Rules section
      expect(prompt).toContain('## Important Rules');

      // Check Begin section
      expect(prompt).toContain('## Begin');
    });

    it('should include progress entries formatted correctly', () => {
      const phase = createPhaseNode();
      const task = createTaskNode(phase);
      const subtask = createSubtaskNode(task);

      const entries = createProgressEntries();
      const context: PromptContext = {
        subtask,
        task,
        phase,
        projectName: 'Test Project',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        iterationNumber: 1,
        maxIterations: 3,
        progressEntries: entries,
        agentsContent: [],
      };

      const prompt = builder.buildIterationPrompt(context);

      expect(prompt).toContain('2026-01-10T12:00:00Z');
      expect(prompt).toContain('ST-001-001-001');
      expect(prompt).toContain('SUCCESS');
      expect(prompt).toContain('Session: PM-2026-01-10-12-00-00-001');
      expect(prompt).toContain('Platform: cursor');
      expect(prompt).toContain('Duration: 5m 30s');
      expect(prompt).toContain('Created file');
      expect(prompt).toContain('Updated tests');
      expect(prompt).toContain('Files Changed:');
      expect(prompt).toContain('`src/file.ts` - Created new file');
      expect(prompt).toContain('npm test');
      expect(prompt).toContain('PASS');
      expect(prompt).toContain('Learning 1');
      expect(prompt).toContain('Learning 2');
      expect(prompt).toContain('Next Steps:');
      expect(prompt).toContain('Next step 1');
    });

    it('should include AGENTS.md content (root and module-specific)', () => {
      const phase = createPhaseNode();
      const task = createTaskNode(phase);
      const subtask = createSubtaskNode(task);

      const agentsContent = createAgentsContent();
      const context: PromptContext = {
        subtask,
        task,
        phase,
        projectName: 'Test Project',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        iterationNumber: 1,
        maxIterations: 3,
        progressEntries: [],
        agentsContent,
      };

      const prompt = builder.buildIterationPrompt(context);

      // Check root content
      expect(prompt).toContain('### Long-Term Knowledge (from AGENTS.md)');
      expect(prompt).toContain('# Root AGENTS.md');
      expect(prompt).toContain('Root level knowledge content.');

      // Check module content
      expect(prompt).toContain('### Module-Specific Knowledge (if applicable)');
      expect(prompt).toContain('(module) src/core/AGENTS.md');
      expect(prompt).toContain('# Module AGENTS.md');
      expect(prompt).toContain('Module specific knowledge.');
    });

    it('should format acceptance criteria as checklist', () => {
      const phase = createPhaseNode();
      const task = createTaskNode(phase);
      const subtask = createSubtaskNode(task);

      const context: PromptContext = {
        subtask,
        task,
        phase,
        projectName: 'Test Project',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        iterationNumber: 1,
        maxIterations: 3,
        progressEntries: [],
        agentsContent: [],
      };

      const prompt = builder.buildIterationPrompt(context);

      expect(prompt).toContain('- [ ] ST-AC-001: Subtask criterion 1');
      expect(prompt).toContain('- [ ] ST-AC-002: Subtask criterion 2');
    });

    it('should include previous failure info on retry', () => {
      const phase = createPhaseNode();
      const task = createTaskNode(phase);
      const subtask = createSubtaskNode(task);

      const failures = createFailureInfo();
      const context: PromptContext = {
        subtask,
        task,
        phase,
        projectName: 'Test Project',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        iterationNumber: 3,
        maxIterations: 3,
        progressEntries: [],
        agentsContent: [],
        previousFailures: failures,
      };

      const prompt = builder.buildIterationPrompt(context);

      expect(prompt).toContain('## Previous Iteration Failures (if any)');
      expect(prompt).toContain('Iteration 1:');
      expect(prompt).toContain('Error: Test failed');
      expect(prompt).toContain('Test Results: npm test: FAILED');
      expect(prompt).toContain('Suggestions: Fix the test');
      expect(prompt).toContain('Iteration 2:');
      expect(prompt).toContain('Error: Type error');
      expect(prompt).toContain('Suggestions: Check types');
    });

    it('should handle empty progress entries', () => {
      const phase = createPhaseNode();
      const task = createTaskNode(phase);
      const subtask = createSubtaskNode(task);

      const context: PromptContext = {
        subtask,
        task,
        phase,
        projectName: 'Test Project',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        iterationNumber: 1,
        maxIterations: 3,
        progressEntries: [],
        agentsContent: [],
      };

      const prompt = builder.buildIterationPrompt(context);

      expect(prompt).toContain('### Recent Progress (from progress.txt)');
      expect(prompt).toContain('None.');
    });

    it('should handle empty agents content', () => {
      const phase = createPhaseNode();
      const task = createTaskNode(phase);
      const subtask = createSubtaskNode(task);

      const context: PromptContext = {
        subtask,
        task,
        phase,
        projectName: 'Test Project',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        iterationNumber: 1,
        maxIterations: 3,
        progressEntries: [],
        agentsContent: [],
      };

      const prompt = builder.buildIterationPrompt(context);

      expect(prompt).toContain('### Long-Term Knowledge (from AGENTS.md)');
      expect(prompt).toContain('None.');
      expect(prompt).toContain('### Module-Specific Knowledge (if applicable)');
      expect(prompt).toContain('None.');
    });

    it('should handle empty acceptance criteria', () => {
      const phase = createPhaseNode();
      const task = createTaskNode(phase);
      const subtask = createSubtaskNode(task);
      // Override with empty criteria
      subtask.data.acceptanceCriteria = [];

      const context: PromptContext = {
        subtask,
        task,
        phase,
        projectName: 'Test Project',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        iterationNumber: 1,
        maxIterations: 3,
        progressEntries: [],
        agentsContent: [],
      };

      const prompt = builder.buildIterationPrompt(context);

      expect(prompt).toContain('## Acceptance Criteria');
      expect(prompt).toContain('- [ ] No acceptance criteria specified.');
    });

    it('should handle empty test plan', () => {
      const phase = createPhaseNode();
      const task = createTaskNode(phase);
      const subtask = createSubtaskNode(task);
      // Override with empty test plan
      subtask.data.testPlan = { commands: [], failFast: false };

      const context: PromptContext = {
        subtask,
        task,
        phase,
        projectName: 'Test Project',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        iterationNumber: 1,
        maxIterations: 3,
        progressEntries: [],
        agentsContent: [],
      };

      const prompt = builder.buildIterationPrompt(context);

      expect(prompt).toContain('## Test Requirements');
      expect(prompt).toContain('- (No test commands specified.)');
    });

    it('should handle missing previous failures', () => {
      const phase = createPhaseNode();
      const task = createTaskNode(phase);
      const subtask = createSubtaskNode(task);

      const context: PromptContext = {
        subtask,
        task,
        phase,
        projectName: 'Test Project',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        iterationNumber: 1,
        maxIterations: 3,
        progressEntries: [],
        agentsContent: [],
        // previousFailures is optional
      };

      const prompt = builder.buildIterationPrompt(context);

      expect(prompt).toContain('## Previous Iteration Failures (if any)');
      expect(prompt).toContain('None.');
    });

    it('should format test commands correctly', () => {
      const phase = createPhaseNode();
      const task = createTaskNode(phase);
      const subtask = createSubtaskNode(task);

      const context: PromptContext = {
        subtask,
        task,
        phase,
        projectName: 'Test Project',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        iterationNumber: 1,
        maxIterations: 3,
        progressEntries: [],
        agentsContent: [],
      };

      const prompt = builder.buildIterationPrompt(context);

      expect(prompt).toContain('`npm run typecheck`');
      expect(prompt).toContain('`(cd src && npm test -- -t subtask)`');
    });

    it('should include assignment with plan description and approach', () => {
      const phase = createPhaseNode();
      const task = createTaskNode(phase);
      const subtask = createSubtaskNode(task);

      const context: PromptContext = {
        subtask,
        task,
        phase,
        projectName: 'Test Project',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        iterationNumber: 1,
        maxIterations: 3,
        progressEntries: [],
        agentsContent: [],
      };

      const prompt = builder.buildIterationPrompt(context);

      expect(prompt).toContain('## Your Assignment');
      expect(prompt).toContain('Subtask Description');
      expect(prompt).toContain('**Approach:**');
      expect(prompt).toContain('- Subtask Step 1');
      expect(prompt).toContain('- Subtask Step 2');
      expect(prompt).toContain('**Dependencies:**');
      expect(prompt).toContain('- Subtask Dep');
    });
  });

  describe('buildGateReviewPrompt', () => {
    it('should create complete gate review prompt', () => {
      const context: GateReviewContext = {
        tierType: 'task',
        itemId: 'TK-001-001',
        itemTitle: 'Test Task',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        childItems: [
          { id: 'ST-001', title: 'Subtask 1', status: 'passed' },
          { id: 'ST-002', title: 'Subtask 2', status: 'passed' },
        ],
        aggregatedTestResults: 'All tests passed',
        aggregatedAcceptanceResults: 'All criteria met',
        evidencePaths: ['evidence/test.log', 'evidence/screenshot.png'],
        acceptanceCriteria: [
          {
            id: 'TK-AC-001',
            description: 'Task criterion',
            type: 'manual',
            target: '',
          },
        ],
        testPlan: {
          commands: [
            {
              command: 'npm',
              args: ['test'],
            },
          ],
          failFast: true,
        },
      };

      const prompt = builder.buildGateReviewPrompt(context);

      // Check header
      expect(prompt).toContain('# Gate Review for TASK: TK-001-001');

      // Check Overview section
      expect(prompt).toContain('## Overview');
      expect(prompt).toContain('ID: TK-001-001');
      expect(prompt).toContain('Title: Test Task');
      expect(prompt).toContain('**Session ID:** PM-2026-01-10-12-00-00-001');
      expect(prompt).toContain('**Platform:** cursor');

      // Check Child Items section
      expect(prompt).toContain('## Child Items Completed');
      expect(prompt).toContain('ST-001 - Subtask 1 (passed)');
      expect(prompt).toContain('ST-002 - Subtask 2 (passed)');

      // Check Evidence Summary section
      expect(prompt).toContain('## Evidence Summary');
      expect(prompt).toContain('### Test Results');
      expect(prompt).toContain('All tests passed');
      expect(prompt).toContain('### Acceptance Verification Results');
      expect(prompt).toContain('All criteria met');
      expect(prompt).toContain('### Evidence Files');
      expect(prompt).toContain('`evidence/test.log`');
      expect(prompt).toContain('`evidence/screenshot.png`');

      // Check Acceptance Criteria section
      expect(prompt).toContain('## Acceptance Criteria for This Gate');
      expect(prompt).toContain('- [ ] TK-AC-001: Task criterion');

      // Check Test Plan section
      expect(prompt).toContain('## Test Plan for This Gate');
      expect(prompt).toContain('`npm test`');

      // Check Your Task section
      expect(prompt).toContain('## Your Task');
      expect(prompt).toContain('1. Review all child evidence');

      // Check Response Format section
      expect(prompt).toContain('## Response Format');
      expect(prompt).toContain('```json');
    });

    it('should handle empty child items', () => {
      const context: GateReviewContext = {
        tierType: 'phase',
        itemId: 'PH-001',
        itemTitle: 'Test Phase',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        childItems: [],
        aggregatedTestResults: '',
        aggregatedAcceptanceResults: '',
        evidencePaths: [],
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
      };

      const prompt = builder.buildGateReviewPrompt(context);

      expect(prompt).toContain('## Child Items Completed');
      expect(prompt).toContain('None.');
    });

    it('should handle empty evidence', () => {
      const context: GateReviewContext = {
        tierType: 'task',
        itemId: 'TK-001',
        itemTitle: 'Test Task',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        childItems: [],
        aggregatedTestResults: '',
        aggregatedAcceptanceResults: '',
        evidencePaths: [],
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
      };

      const prompt = builder.buildGateReviewPrompt(context);

      expect(prompt).toContain('### Test Results');
      expect(prompt).toContain('None.');
      expect(prompt).toContain('### Acceptance Verification Results');
      expect(prompt).toContain('None.');
      expect(prompt).toContain('### Evidence Files');
      expect(prompt).toContain('None.');
    });

    it('should format tier type in uppercase', () => {
      const context: GateReviewContext = {
        tierType: 'subtask',
        itemId: 'ST-001',
        itemTitle: 'Test Subtask',
        sessionId: 'PM-2026-01-10-12-00-00-001',
        platform: 'cursor',
        childItems: [],
        aggregatedTestResults: '',
        aggregatedAcceptanceResults: '',
        evidencePaths: [],
        acceptanceCriteria: [],
        testPlan: { commands: [], failFast: false },
      };

      const prompt = builder.buildGateReviewPrompt(context);

      expect(prompt).toContain('# Gate Review for SUBTASK: ST-001');
    });
  });
});
