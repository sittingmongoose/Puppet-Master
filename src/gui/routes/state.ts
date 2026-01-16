/**
 * State API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for querying orchestrator state, tier hierarchy,
 * progress entries, and agents documentation.
 * See BUILD_QUEUE_PHASE_9.md PH9-T02 for specification.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import type { TierStateManager } from '../../core/tier-state-manager.js';
import type { OrchestratorStateMachine } from '../../core/orchestrator-state-machine.js';
import type { ProgressManager, ProgressEntry } from '../../memory/progress-manager.js';
import type { AgentsManager } from '../../memory/agents-manager.js';
import type { OrchestratorState } from '../../types/state.js';
import { TierNode } from '../../core/tier-node.js';
import type { TierNodeData } from '../../core/tier-node.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Create state routes.
 * 
 * Returns Express Router with state query endpoints.
 * Dependencies are optional and can be mocked for initial implementation.
 */
export function createStateRoutes(
  tierManager: TierStateManager | null,
  orchestrator: OrchestratorStateMachine | null,
  progressManager: ProgressManager | null,
  agentsManager: AgentsManager | null
): Router {
  const router = createRouter();

  /**
   * GET /api/state
   * Returns current orchestrator state and completion statistics.
   */
  router.get('/state', async (_req: Request, res: Response) => {
    try {
      const orchestratorState: OrchestratorState = orchestrator?.getCurrentState() || 'idle';
      const currentPhase = tierManager?.getCurrentPhase() || null;
      const currentTask = tierManager?.getCurrentTask() || null;
      const currentSubtask = tierManager?.getCurrentSubtask() || null;

      // Calculate completion stats
      const stats = calculateCompletionStats(tierManager);

      res.json({
        orchestratorState,
        currentPhaseId: currentPhase?.id || null,
        currentTaskId: currentTask?.id || null,
        currentSubtaskId: currentSubtask?.id || null,
        completionStats: stats,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/tiers
   * Returns the full tier hierarchy.
   */
  router.get('/tiers', async (_req: Request, res: Response) => {
    try {
      const root = tierManager?.getRoot() || null;
      
      if (!root) {
        res.json({ root: null });
        return;
      }

      const serialized = serializeTierNode(root);
      res.json({ root: serialized });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/tiers/:id
   * Returns a specific tier with path and children.
   */
  router.get('/tiers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const node = tierManager?.findNode(id) || null;

      if (!node) {
        res.status(404).json({
          error: `Tier not found: ${id}`,
          code: 'TIER_NOT_FOUND',
        } as ErrorResponse);
        return;
      }

      // Build path to root using getPath() method
      const path = node.getPath();

      // Get children
      const children = node.children.map(child => serializeTierNode(child));

      res.json({
        tier: serializeTierNode(node),
        path,
        children,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/progress
   * Returns recent progress entries.
   * Query: ?limit=10
   */
  router.get('/progress', async (req: Request, res: Response) => {
    try {
      const limit = validateLimitParam(req.query.limit as string | undefined);
      
      let entries: ProgressEntry[] = [];
      
      if (progressManager) {
        const allEntries = await progressManager.read();
        entries = allEntries.slice(-limit).reverse();
      }

      res.json({ entries });
    } catch (error) {
      const err = error as Error;
      res.status(400).json({
        error: err.message || 'Invalid request',
        code: 'BAD_REQUEST',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/agents
   * Returns root AGENTS.md content.
   */
  router.get('/agents', async (_req: Request, res: Response) => {
    try {
      let document = '';
      
      if (agentsManager) {
        const contents = await agentsManager.loadForContext({
          filesTargeted: [],
          phaseId: '',
          taskId: '',
        });
        document = contents.map(c => c.content).join('\n\n---\n\n');
      }

      res.json({ document });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as ErrorResponse);
    }
  });

  return router;
}

/**
 * Serialize TierNode for JSON response.
 * Handles circular references by flattening parent/children.
 * TierNode class has: id, type, data (TierNodeData), parent, children, getState()
 */
function serializeTierNode(node: TierNode): Record<string, unknown> {
  const state = node.getState();
  const data = node.data;

  return {
    id: node.id,
    type: node.type,
    state,
    parentId: node.parent?.id || null,
    childIds: node.children.map(child => child.id),
    plan: data.plan,
    acceptanceCriteria: data.acceptanceCriteria || [],
    testPlan: data.testPlan,
    evidence: data.evidence || [],
    iterations: data.iterations || 0,
    maxIterations: data.maxIterations || 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    title: data.title,
    description: data.description,
  };
}

/**
 * Calculate completion statistics from tier manager.
 */
function calculateCompletionStats(
  tierManager: TierStateManager | null
): { total: number; passed: number; failed: number; pending: number } {
  if (!tierManager) {
    return { total: 0, passed: 0, failed: 0, pending: 0 };
  }

  const allPhases = tierManager.getAllPhases() || [];
  const allTasks = tierManager.getAllTasks() || [];
  const allSubtasks = tierManager.getAllSubtasks() || [];

  const total = allPhases.length + allTasks.length + allSubtasks.length;
  const passed = [
    ...allPhases.filter(n => n.getState() === 'passed'),
    ...allTasks.filter(n => n.getState() === 'passed'),
    ...allSubtasks.filter(n => n.getState() === 'passed'),
  ].length;
  const failed = [
    ...allPhases.filter(n => n.getState() === 'failed'),
    ...allTasks.filter(n => n.getState() === 'failed'),
    ...allSubtasks.filter(n => n.getState() === 'failed'),
  ].length;
  const pending = total - passed - failed;

  return { total, passed, failed, pending };
}

/**
 * Validate and parse limit query parameter.
 */
function validateLimitParam(limitStr: string | undefined): number {
  if (!limitStr) {
    return 10; // Default
  }

  const limit = parseInt(limitStr, 10);
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new Error('Invalid limit parameter. Must be between 1 and 100.');
  }

  return limit;
}
