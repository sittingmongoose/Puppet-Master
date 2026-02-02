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

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Dependency holder for state routes.
 * Allows routes to access current dependencies even after initial registration.
 */
interface StateRouteDependencies {
  getTierManager: () => TierStateManager | null;
  getOrchestrator: () => OrchestratorStateMachine | null;
  getProgressManager: () => ProgressManager | null;
  getAgentsManager: () => AgentsManager | null;
  getQuotaManager?: () => import('../../platforms/quota-manager.js').QuotaManager | null;
  getUsageTracker?: () => import('../../memory/usage-tracker.js').UsageTracker | null;
}

/**
 * Create state routes.
 * 
 * Returns Express Router with state query endpoints.
 * Uses dependency getters to access current dependencies at request time.
 */
export function createStateRoutes(
  dependencies: StateRouteDependencies
): Router {
  const router = createRouter();

  /**
   * GET /api/state
   * Returns current orchestrator state and completion statistics.
   */
  router.get('/state', async (_req: Request, res: Response) => {
    try {
      const orchestrator = dependencies.getOrchestrator();
      const tierManager = dependencies.getTierManager();
      const orchestratorState: OrchestratorState = orchestrator?.getCurrentState() || 'idle';
      const currentPhase = tierManager?.getCurrentPhase() || null;
      const currentTask = tierManager?.getCurrentTask() || null;
      const currentSubtask = tierManager?.getCurrentSubtask() || null;

      // Calculate completion stats
      const stats = calculateCompletionStats(tierManager);

      // P1: Get usage/quota info if available
      let budgets: Record<string, { used: number; limit: number | 'unlimited'; remaining: number; resetsAt?: string }> | undefined;
      if (dependencies.getQuotaManager && dependencies.getUsageTracker) {
        const quotaManager = dependencies.getQuotaManager();
        const usageTracker = dependencies.getUsageTracker();
        if (quotaManager && usageTracker) {
          try {
            const platforms: Array<'cursor' | 'codex' | 'claude' | 'gemini' | 'copilot'> = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];
            budgets = {};
            for (const platform of platforms) {
              try {
                const quotaInfo = await quotaManager.checkQuota(platform);
                const used = quotaInfo.limit - quotaInfo.remaining;
                budgets[platform] = {
                  used,
                  limit: quotaInfo.limit === Number.MAX_SAFE_INTEGER ? 'unlimited' : quotaInfo.limit,
                  remaining: quotaInfo.remaining,
                  resetsAt: quotaInfo.resetsAt,
                };
              } catch (error) {
                // Quota exhausted or error - still include info
                budgets[platform] = {
                  used: 0,
                  limit: 'unlimited',
                  remaining: 0,
                };
              }
            }
          } catch (error) {
            // Non-fatal - budgets will be undefined
            console.warn('[State] Failed to get quota info:', error);
          }
        }
      }

      res.json({
        orchestratorState,
        currentPhaseId: currentPhase?.id || null,
        currentTaskId: currentTask?.id || null,
        currentSubtaskId: currentSubtask?.id || null,
        completionStats: stats,
        budgets,
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
   * When TierStateManager is not registered (e.g. standalone `npm run gui`), returns
   * 200 with empty tiers so the Tiers page shows "No tiers loaded" instead of a raw error.
   */
  router.get('/tiers', async (_req: Request, res: Response) => {
    try {
      const tierManager = dependencies.getTierManager();
      if (!tierManager) {
        return res.json({
          root: null,
          metadata: {
            totalPhases: 0,
            totalTasks: 0,
            totalSubtasks: 0,
            completedPhases: 0,
            completedTasks: 0,
            completedSubtasks: 0,
          },
          message:
            'No tiers loaded. Start a project from the Wizard, or run `puppet-master gui` from a project directory to enable tier state.',
        });
      }

      const root = tierManager.getRoot();
      
      if (!root) {
        return res.json({
          root: null,
          metadata: {
            totalPhases: 0,
            totalTasks: 0,
            totalSubtasks: 0,
            completedPhases: 0,
            completedTasks: 0,
            completedSubtasks: 0,
          },
          message: 'No tiers loaded. Open a project first.',
        });
      }

      // Serialize full tree (root node with children)
      const rootSerialized = serializeTierTree(root);
      
      // Get metadata
      const allPhases = tierManager.getAllPhases() || [];
      const allTasks = tierManager.getAllTasks() || [];
      const allSubtasks = tierManager.getAllSubtasks() || [];
      
      const completedPhases = allPhases.filter(n => n.getState() === 'passed').length;
      const completedTasks = allTasks.filter(n => n.getState() === 'passed').length;
      const completedSubtasks = allSubtasks.filter(n => n.getState() === 'passed').length;

      res.json({
        root: rootSerialized,
        metadata: {
          totalPhases: allPhases.length,
          totalTasks: allTasks.length,
          totalSubtasks: allSubtasks.length,
          completedPhases,
          completedTasks,
          completedSubtasks,
        },
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 'TIER_FETCH_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/tiers/:id
   * Returns a specific tier with path and children.
   */
  router.get('/tiers/:id', async (req: Request, res: Response) => {
    try {
      const tierManager = dependencies.getTierManager();
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
      const progressManager = dependencies.getProgressManager();
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
   * Returns list of AGENTS.md files (per GUI_SPEC.md Section 9.1).
   */
  router.get('/agents', async (_req: Request, res: Response) => {
    try {
      const agentsManager = dependencies.getAgentsManager();
      
      if (!agentsManager) {
        res.json({ files: [] });
        return;
      }

      const files = await agentsManager.listFiles();
      res.json({ files });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/agents/:path
   * Returns AGENTS.md content for a specific file (per GUI_SPEC.md Section 9.1).
   */
  router.get('/agents/:path(*)', async (req: Request, res: Response) => {
    try {
      const agentsManager = dependencies.getAgentsManager();
      const filePath = req.params.path;
      
      if (!agentsManager) {
        res.status(404).json({
          error: 'AgentsManager not available',
          code: 'NOT_FOUND',
        } as ErrorResponse);
        return;
      }

      // Load file content
      // Note: This is a simplified implementation - in production, you'd want
      // to resolve the path safely and load the specific file
      const contents = await agentsManager.loadForContext({
        filesTargeted: [],
        phaseId: '',
        taskId: '',
      });
      
      // Find the file matching the path
      const file = contents.find(c => c.path === filePath || c.path.endsWith(filePath));
      if (!file) {
        res.status(404).json({
          error: `AGENTS.md file not found: ${filePath}`,
          code: 'NOT_FOUND',
        } as ErrorResponse);
        return;
      }

      res.json({ document: file.content, path: file.path, level: file.level });
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
 * Serialize tier tree for /api/tiers endpoint.
 * Matches the format expected by the GUI implementation plan.
 */
function serializeTierTree(tier: TierNode): Record<string, unknown> {
  const state = tier.getState();
  const data = tier.data;

  // Extract verifiers from acceptanceCriteria (verifiers are criteria)
  const verifiers = (data.acceptanceCriteria || []).map((v) => ({
    type: v.type,
    target: v.target,
    status: v.passed !== undefined ? (v.passed ? 'PASS' : 'FAIL') : 'PENDING',
    evidence: [],
  }));

  return {
    id: tier.id,
    title: data.title,
    type: tier.type,
    status: state,
    pass: state === 'passed',
    currentIteration: data.iterations || 0,
    maxIterations: data.maxIterations || 0,
    platform: null, // Platform not stored in TierNodeData - would need config access
    model: null, // Model not stored in TierNodeData - would need config access
    acceptance: data.acceptanceCriteria || [],
    verifiers,
    children: tier.children.map(child => serializeTierTree(child)),
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
