/**
 * State API Routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for querying orchestrator state, tier hierarchy,
 * progress entries, and agents documentation.
 */

import { Router, type Request, type Response } from 'express';
import type { TierStateManager } from '../../core/tier-state-manager.js';
import type { OrchestratorStateMachine } from '../../core/orchestrator-state-machine.js';
import type { ProgressManager, ProgressEntry } from '../../memory/progress-manager.js';
import type { AgentsManager, AgentsContent } from '../../memory/agents-manager.js';
import type { TierNode } from '../../core/tier-node.js';
import type { OrchestratorState, TierState } from '../../types/state.js';
import type { TierNodeData } from '../../core/tier-node.js';

/**
 * Response type for GET /api/state
 */
export interface StateResponse {
  orchestratorState: OrchestratorState;
  currentPhaseId: string | null;
  currentTaskId: string | null;
  currentSubtaskId: string | null;
  completionStats: {
    total: number;
    passed: number;
    failed: number;
    pending: number;
  };
}

/**
 * Serialized tier node with state and children
 */
export interface SerializedTierNode extends TierNodeData {
  state: TierState;
  childIds: string[];
  children?: SerializedTierNode[];
}

/**
 * Response type for GET /api/tiers
 */
export interface TiersResponse {
  root: SerializedTierNode;
}

/**
 * Response type for GET /api/tiers/:id
 */
export interface TierDetailResponse {
  tier: SerializedTierNode;
  path: string[];
  children: SerializedTierNode[];
}

/**
 * Response type for GET /api/progress
 */
export interface ProgressResponse {
  entries: ProgressEntry[];
}

/**
 * Response type for GET /api/agents
 */
export interface AgentsResponse {
  document: AgentsContent | null;
}

/**
 * Error response format
 */
export interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Completion statistics
 */
interface CompletionStats {
  total: number;
  passed: number;
  failed: number;
  pending: number;
}

/**
 * Recursively serialize a tier node and its children
 */
function serializeTierNode(node: TierNode): SerializedTierNode {
  const serialized: SerializedTierNode = {
    ...node.toJSON(),
    children: node.children.map((child) => serializeTierNode(child)),
  };
  return serialized;
}

/**
 * Calculate completion statistics by traversing the tier tree
 */
function calculateCompletionStats(root: TierNode): CompletionStats {
  const stats: CompletionStats = {
    total: 0,
    passed: 0,
    failed: 0,
    pending: 0,
  };

  function traverse(node: TierNode): void {
    // Only count phases, tasks, and subtasks (not iterations or root)
    if (node.type !== 'iteration' && node.id !== 'root') {
      stats.total++;
      const state = node.getState();
      if (state === 'passed') {
        stats.passed++;
      } else if (state === 'failed' || state === 'escalated') {
        stats.failed++;
      } else {
        stats.pending++;
      }
    }

    // Traverse children
    for (const child of node.children) {
      traverse(child);
    }
  }

  // Start traversal from root's children (phases)
  for (const phase of root.children) {
    traverse(phase);
  }

  return stats;
}

/**
 * Validate and parse limit query parameter
 */
function validateLimitParam(limit: string | undefined): number {
  if (!limit) {
    return 10;
  }

  const parsed = parseInt(limit, 10);
  if (isNaN(parsed) || parsed < 1) {
    return 10;
  }

  // Cap at 100
  return Math.min(parsed, 100);
}

/**
 * Create state API routes
 */
export function createStateRoutes(
  tierManager: TierStateManager,
  orchestrator: OrchestratorStateMachine,
  progressManager: ProgressManager,
  agentsManager: AgentsManager
): Router {
  const router = Router();

  /**
   * GET /api/state
   * Returns current orchestrator state and completion statistics
   */
  router.get('/state', async (_req: Request, res: Response<StateResponse | ErrorResponse>) => {
    try {
      const context = orchestrator.getContext();
      const root = tierManager.getRoot();
      const stats = calculateCompletionStats(root);

      const response: StateResponse = {
        orchestratorState: context.state,
        currentPhaseId: context.currentPhaseId,
        currentTaskId: context.currentTaskId,
        currentSubtaskId: context.currentSubtaskId,
        completionStats: stats,
      };

      res.json(response);
    } catch (error) {
      console.error('Error in GET /api/state:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  /**
   * GET /api/tiers
   * Returns full tier hierarchy
   */
  router.get('/tiers', async (_req: Request, res: Response<TiersResponse | ErrorResponse>) => {
    try {
      const root = tierManager.getRoot();
      const serialized = serializeTierNode(root);

      const response: TiersResponse = {
        root: serialized,
      };

      res.json(response);
    } catch (error) {
      console.error('Error in GET /api/tiers:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  /**
   * GET /api/tiers/:id
   * Returns specific tier node with path and children
   */
  router.get('/tiers/:id', async (req: Request, res: Response<TierDetailResponse | ErrorResponse>) => {
    try {
      const { id } = req.params;
      const node = tierManager.findNode(id);

      if (!node) {
        res.status(404).json({
          error: `Tier not found: ${id}`,
          code: 'TIER_NOT_FOUND',
        });
        return;
      }

      const path = node.getPath();
      const serialized = serializeTierNode(node);
      const children = node.children.map((child) => serializeTierNode(child));

      const response: TierDetailResponse = {
        tier: serialized,
        path,
        children,
      };

      res.json(response);
    } catch (error) {
      console.error('Error in GET /api/tiers/:id:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  /**
   * GET /api/progress
   * Returns recent progress entries
   */
  router.get('/progress', async (req: Request, res: Response<ProgressResponse | ErrorResponse>) => {
    try {
      const limit = validateLimitParam(req.query.limit as string | undefined);
      const entries = await progressManager.getLatest(limit);

      const response: ProgressResponse = {
        entries,
      };

      res.json(response);
    } catch (error) {
      console.error('Error in GET /api/progress:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  /**
   * GET /api/agents
   * Returns root AGENTS.md content
   */
  router.get('/agents', async (_req: Request, res: Response<AgentsResponse | ErrorResponse>) => {
    try {
      let document: AgentsContent | null = null;

      try {
        // Try to load root AGENTS.md
        // Use a minimal context to load root level only
        const { readFile } = await import('fs/promises');
        const { existsSync } = await import('fs');
        const { join } = await import('path');

        // Get root path from process.cwd() or try common locations
        const rootPath = process.cwd();
        const agentsPath = join(rootPath, 'AGENTS.md');

        if (existsSync(agentsPath)) {
          const content = await readFile(agentsPath, 'utf-8');
          const sections = agentsManager.parseSections(content);
          document = {
            level: 'root',
            path: agentsPath,
            content,
            sections,
          };
        }
      } catch (fileError) {
        // File doesn't exist or can't be read - return null document
        console.warn('Could not load AGENTS.md:', fileError);
      }

      const response: AgentsResponse = {
        document,
      };

      res.json(response);
    } catch (error) {
      console.error('Error in GET /api/agents:', error);
      res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
    }
  });

  return router;
}
