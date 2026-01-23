/**
 * RWM Custom Tools for GitHub Copilot SDK
 *
 * These tools are exposed to Copilot via the SDK, allowing the agent to
 * signal completion, report being stuck, and interact with RWM internals.
 *
 * These tools replace the legacy text-based signals:
 * - <ralph>COMPLETE</ralph> -> mark_complete tool
 * - <ralph>GUTTER</ralph> -> mark_stuck tool
 *
 * Benefits:
 * - Structured data (learnings, files changed, reasons)
 * - No text parsing needed
 * - Explicit intent from the agent
 */

/**
 * Tool definition interface matching Copilot SDK expectations.
 */
export interface CopilotTool {
  name: string;
  description: string;
  parameters?: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
  handler: (params: Record<string, unknown>) => Promise<unknown>;
}

/**
 * Result from mark_complete tool.
 */
export interface MarkCompleteResult {
  status: 'complete';
  learnings: string[];
  filesChanged: string[];
  testsPassed?: boolean;
  summary?: string;
}

/**
 * Result from mark_stuck tool.
 */
export interface MarkStuckResult {
  status: 'gutter';
  reason: string;
  blockers: string[];
  suggestedActions?: string[];
}

/**
 * Result from get_acceptance_criteria tool.
 */
export interface AcceptanceCriteriaResult {
  criteria: string[];
  testPlan?: string;
  verificationTokens?: string[];
}

/**
 * Result from record_evidence tool.
 */
export interface RecordEvidenceResult {
  evidenceId: string;
  type: string;
  timestamp: string;
  stored: boolean;
}

/**
 * Callback interface for tool handlers.
 * Allows RWM to receive tool invocations and respond.
 */
export interface ToolCallbacks {
  onMarkComplete?: (result: MarkCompleteResult) => Promise<void>;
  onMarkStuck?: (result: MarkStuckResult) => Promise<void>;
  getAcceptanceCriteria?: () => Promise<AcceptanceCriteriaResult>;
  recordEvidence?: (type: string, data: string) => Promise<RecordEvidenceResult>;
}

/**
 * Creates the set of RWM custom tools for Copilot SDK.
 *
 * @param callbacks - Optional callbacks to handle tool invocations
 * @returns Array of tool definitions
 */
export function createRwmTools(callbacks?: ToolCallbacks): CopilotTool[] {
  return [
    {
      name: 'mark_complete',
      description:
        'Signal that the current iteration task is complete. Call this when you have finished all required work, tests pass, and acceptance criteria are met.',
      parameters: {
        type: 'object',
        properties: {
          learnings: {
            type: 'array',
            description:
              'Key learnings from this iteration (patterns discovered, gotchas to avoid, etc.)',
          },
          filesChanged: {
            type: 'array',
            description: 'List of files that were created or modified',
          },
          testsPassed: {
            type: 'boolean',
            description: 'Whether all tests passed (if applicable)',
          },
          summary: {
            type: 'string',
            description: 'Brief summary of what was accomplished',
          },
        },
        required: ['learnings', 'filesChanged'],
      },
      handler: async (params: Record<string, unknown>): Promise<MarkCompleteResult> => {
        const result: MarkCompleteResult = {
          status: 'complete',
          learnings: (params.learnings as string[]) ?? [],
          filesChanged: (params.filesChanged as string[]) ?? [],
          testsPassed: params.testsPassed as boolean | undefined,
          summary: params.summary as string | undefined,
        };

        if (callbacks?.onMarkComplete) {
          await callbacks.onMarkComplete(result);
        }

        return result;
      },
    },
    {
      name: 'mark_stuck',
      description:
        'Signal that you are stuck and cannot proceed. Call this when you encounter blockers that prevent completion (missing dependencies, unclear requirements, permission issues, etc.).',
      parameters: {
        type: 'object',
        properties: {
          reason: {
            type: 'string',
            description: 'Why you are stuck (be specific)',
          },
          blockers: {
            type: 'array',
            description: 'List of specific blockers preventing progress',
          },
          suggestedActions: {
            type: 'array',
            description: 'Suggested actions to unblock (if any)',
          },
        },
        required: ['reason', 'blockers'],
      },
      handler: async (params: Record<string, unknown>): Promise<MarkStuckResult> => {
        const result: MarkStuckResult = {
          status: 'gutter',
          reason: (params.reason as string) ?? 'Unknown reason',
          blockers: (params.blockers as string[]) ?? [],
          suggestedActions: params.suggestedActions as string[] | undefined,
        };

        if (callbacks?.onMarkStuck) {
          await callbacks.onMarkStuck(result);
        }

        return result;
      },
    },
    {
      name: 'get_acceptance_criteria',
      description:
        'Get the acceptance criteria for the current task. Use this to understand what needs to be accomplished and how it will be verified.',
      parameters: {
        type: 'object',
        properties: {},
      },
      handler: async (): Promise<AcceptanceCriteriaResult> => {
        if (callbacks?.getAcceptanceCriteria) {
          return callbacks.getAcceptanceCriteria();
        }

        // Default response if no callback provided
        return {
          criteria: ['No acceptance criteria available'],
        };
      },
    },
    {
      name: 'record_evidence',
      description:
        'Store evidence for verification (screenshots, test outputs, logs). Use this to document proof of completion or to capture debugging information.',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description:
              'Type of evidence (screenshot, test_output, log, error, custom)',
          },
          data: {
            type: 'string',
            description:
              'Evidence data (base64 for images, text for logs, JSON for structured data)',
          },
          description: {
            type: 'string',
            description: 'Description of what this evidence shows',
          },
        },
        required: ['type', 'data'],
      },
      handler: async (params: Record<string, unknown>): Promise<RecordEvidenceResult> => {
        const type = params.type as string;
        const data = params.data as string;

        if (callbacks?.recordEvidence) {
          return callbacks.recordEvidence(type, data);
        }

        // Default response if no callback provided
        return {
          evidenceId: `evidence-${Date.now()}`,
          type,
          timestamp: new Date().toISOString(),
          stored: false,
        };
      },
    },
  ];
}

/**
 * Creates tools with callbacks wired to RWM managers.
 *
 * This is the production factory that connects tools to actual RWM functionality.
 *
 * @param prdManager - PRD manager for acceptance criteria
 * @param evidenceStore - Evidence store for recording evidence
 * @param progressManager - Progress manager for recording learnings
 * @returns Configured tools ready for SDK use
 */
export function createProductionTools(
  // Type imports would come from actual modules
  // For now, use 'any' and cast at call site
  prdManager?: { getCurrentCriteria?: () => Promise<AcceptanceCriteriaResult> },
  evidenceStore?: { capture?: (type: string, data: string) => Promise<RecordEvidenceResult> },
  progressManager?: { recordLearnings?: (learnings: string[]) => Promise<void> }
): CopilotTool[] {
  const callbacks: ToolCallbacks = {
    onMarkComplete: async (result) => {
      // Record learnings to progress manager
      if (progressManager?.recordLearnings && result.learnings.length > 0) {
        await progressManager.recordLearnings(result.learnings);
      }
    },
    onMarkStuck: async (result) => {
      // Log stuck state for debugging
      console.warn(`[Copilot] Agent stuck: ${result.reason}`);
      console.warn(`[Copilot] Blockers: ${result.blockers.join(', ')}`);
    },
    getAcceptanceCriteria: async () => {
      if (prdManager?.getCurrentCriteria) {
        return prdManager.getCurrentCriteria();
      }
      return { criteria: ['No criteria available'] };
    },
    recordEvidence: async (type, data) => {
      if (evidenceStore?.capture) {
        return evidenceStore.capture(type, data);
      }
      return {
        evidenceId: `evidence-${Date.now()}`,
        type,
        timestamp: new Date().toISOString(),
        stored: false,
      };
    },
  };

  return createRwmTools(callbacks);
}
