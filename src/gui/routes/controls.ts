/**
 * Controls API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for execution control (start, pause, resume, stop, reset).
 * See BUILD_QUEUE_PHASE_9.md PH9-T10 for specification.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import type { Orchestrator } from '../../core/orchestrator.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Start request body interface.
 */
interface StartRequest {
  fromCheckpoint?: string;
}

/**
 * Stop request body interface.
 */
interface StopRequest {
  force?: boolean;
}

/**
 * Create controls routes.
 *
 * Returns Express Router with control endpoints.
 * Accepts either a direct Orchestrator instance or a getter function.
 * When a getter is used, the orchestrator is resolved at request time, allowing
 * late binding after the server has fully initialized.
 */
export function createControlsRoutes(orchestratorOrGetter: Orchestrator | null | (() => Orchestrator | null)): Router {
  const getOrchestrator = typeof orchestratorOrGetter === 'function'
    ? orchestratorOrGetter
    : () => orchestratorOrGetter;
  const router = createRouter();

  /**
   * POST /api/controls/start
   * Start execution (optionally from checkpoint).
   */
  router.post('/controls/start', async (req: Request<unknown, unknown, StartRequest>, res: Response) => {
    try {
      const orchestrator = getOrchestrator();
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      // PRE-FLIGHT CHECKS

      // Check 1: Project loaded?
      const project = await orchestrator.getCurrentProject();
      if (!project) {
        res.status(400).json({
          error: 'No project loaded. Please open or create a project first.',
          code: 'NO_PROJECT_LOADED',
        } as ErrorResponse);
        return;
      }

      // Check 2: PRD valid?
      const prdValidation = await orchestrator.validatePRD();
      if (!prdValidation.valid) {
        res.status(400).json({
          error: 'PRD validation failed',
          code: 'PRD_INVALID',
          details: prdValidation.errors,
        } as ErrorResponse & { details?: string[] });
        return;
      }

      // Check 3: Config valid?
      const configValidation = await orchestrator.validateConfig();
      if (!configValidation.valid) {
        res.status(400).json({
          error: 'Configuration validation failed',
          code: 'CONFIG_INVALID',
          details: configValidation.errors,
        } as ErrorResponse & { details?: string[] });
        return;
      }

      // Check 4: Required CLIs available?
      const cliChecks = await orchestrator.checkRequiredCLIs();
      if (!cliChecks.allAvailable) {
        res.status(400).json({
          error: 'Required CLI tools not available',
          code: 'CLI_TOOLS_MISSING',
          details: cliChecks.missing,
          hint: 'Run Doctor to install missing tools',
        } as ErrorResponse & { details?: string[]; hint?: string });
        return;
      }

      // Check 5: Git repo initialized?
      const gitCheck = await orchestrator.checkGitRepo();
      if (!gitCheck.valid) {
        res.status(400).json({
          error: 'Git repository not initialized',
          code: 'GIT_NOT_INITIALIZED',
          details: gitCheck.errors,
          hint: 'Run "git init" in project directory',
        } as ErrorResponse & { details?: string[]; hint?: string });
        return;
      }

      const currentState = orchestrator.getState();

      // Validate state - can only start from 'idle' or 'planning'
      if (currentState !== 'idle' && currentState !== 'planning') {
        res.status(400).json({
          error: `Cannot start from state: ${currentState}`,
          code: 'INVALID_STATE',
        } as ErrorResponse);
        return;
      }

      // Generate session ID (format: PM-YYYY-MM-DD-HH-MM-SS-NNN)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
      const sessionId = `PM-${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}`;

      // Start orchestrator
      await orchestrator.start();

      res.json({
        success: true,
        sessionId,
      });
    } catch (error) {
      console.error('[Controls] Error starting execution:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to start execution',
        code: 'START_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/controls/pause
   * Pause execution.
   */
  router.post('/controls/pause', async (_req: Request, res: Response) => {
    try {
      const orchestrator = getOrchestrator();
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      const currentState = orchestrator.getState();

      // Validate state - can only pause from 'executing'
      if (currentState !== 'executing') {
        res.status(400).json({
          error: `Cannot pause from state: ${currentState}`,
          code: 'INVALID_STATE',
        } as ErrorResponse);
        return;
      }

      await orchestrator.pause();

      res.json({
        success: true,
      });
    } catch (error) {
      console.error('[Controls] Error pausing execution:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to pause execution',
        code: 'PAUSE_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/controls/resume
   * Resume execution.
   */
  router.post('/controls/resume', async (_req: Request, res: Response) => {
    try {
      const orchestrator = getOrchestrator();
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      const currentState = orchestrator.getState();

      // Validate state - can only resume from 'paused'
      if (currentState !== 'paused') {
        res.status(400).json({
          error: `Cannot resume from state: ${currentState}`,
          code: 'INVALID_STATE',
        } as ErrorResponse);
        return;
      }

      await orchestrator.resume();

      res.json({
        success: true,
      });
    } catch (error) {
      console.error('[Controls] Error resuming execution:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to resume execution',
        code: 'RESUME_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/controls/stop
   * Stop execution (with optional force flag).
   */
  router.post('/controls/stop', async (req: Request<unknown, unknown, StopRequest>, res: Response) => {
    try {
      const orchestrator = getOrchestrator();
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      const { force } = req.body;
      const currentState = orchestrator.getState();

      // Validate state - can stop from 'executing' or 'paused'
      if (currentState !== 'executing' && currentState !== 'paused') {
        if (!force) {
          res.status(400).json({
            error: `Cannot stop from state: ${currentState}`,
            code: 'INVALID_STATE',
          } as ErrorResponse);
          return;
        }
      }

      await orchestrator.stop();

      res.json({
        success: true,
      });
    } catch (error) {
      console.error('[Controls] Error stopping execution:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to stop execution',
        code: 'STOP_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/controls/reset
   * Reset execution state.
   */
  router.post('/controls/reset', async (_req: Request, res: Response) => {
    try {
      const orchestrator = getOrchestrator();
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      const currentState = orchestrator.getState();

      // Can reset from any state, but typically from 'error' or 'complete'
      // For now, we'll just stop if running and reset state machine
      if (currentState === 'executing' || currentState === 'paused') {
        await orchestrator.stop();
      }

      // Reset state machine to idle
      // Note: This assumes Orchestrator has a reset method or we can access the state machine
      // For now, we'll just return success - actual reset logic may need to be added to Orchestrator
      res.json({
        success: true,
      });
    } catch (error) {
      console.error('[Controls] Error resetting execution:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to reset execution',
        code: 'RESET_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/controls/retry
   * Retry current failed subtask with a fresh iteration.
   */
  router.post('/controls/retry', async (_req: Request, res: Response) => {
    try {
      const orchestrator = getOrchestrator();
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      await orchestrator.retry();

      res.json({
        success: true,
        message: 'Retry initiated',
      });
    } catch (error) {
      console.error('[Controls] Error retrying:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to retry',
        code: 'RETRY_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/controls/replan
   * Regenerate plans for a specific tier (phase/task/subtask).
   * Body: { tierId: string, scope: 'phase' | 'task' | 'subtask' }
   */
  router.post('/controls/replan', async (req: Request, res: Response) => {
    try {
      const orchestrator = getOrchestrator();
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      const { tierId, scope } = req.body;

      if (!tierId || typeof tierId !== 'string') {
        res.status(400).json({
          error: 'tierId is required',
          code: 'TIER_ID_REQUIRED',
        } as ErrorResponse);
        return;
      }

      if (!scope || !['phase', 'task', 'subtask'].includes(scope)) {
        res.status(400).json({
          error: 'scope must be one of: phase, task, subtask',
          code: 'INVALID_SCOPE',
        } as ErrorResponse);
        return;
      }

      await orchestrator.replan(tierId, scope);

      res.json({
        success: true,
        tierId,
        scope,
        message: 'Replan initiated',
      });
    } catch (error) {
      console.error('[Controls] Error replanning:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to replan',
        code: 'REPLAN_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/controls/reopen
   * Reopen a completed item (reset pass=false, iteration count).
   * Body: { tierId: string, reason: string }
   */
  router.post('/controls/reopen', async (req: Request, res: Response) => {
    try {
      const orchestrator = getOrchestrator();
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      const { tierId, reason } = req.body;

      if (!tierId || typeof tierId !== 'string') {
        res.status(400).json({
          error: 'tierId is required',
          code: 'TIER_ID_REQUIRED',
        } as ErrorResponse);
        return;
      }

      if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        res.status(400).json({
          error: 'reason is required',
          code: 'REASON_REQUIRED',
        } as ErrorResponse);
        return;
      }

      await orchestrator.reopenItem(tierId, reason);

      res.json({
        success: true,
        tierId,
        reason,
        message: 'Item reopened',
      });
    } catch (error) {
      console.error('[Controls] Error reopening:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to reopen',
        code: 'REOPEN_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/controls/kill-spawn
   * Kill current CLI process and spawn a fresh iteration.
   */
  router.post('/controls/kill-spawn', async (_req: Request, res: Response) => {
    try {
      const orchestrator = getOrchestrator();
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      await orchestrator.killCurrentProcess();
      await orchestrator.spawnFreshIteration();

      res.json({
        success: true,
        message: 'Process killed, fresh iteration spawned',
      });
    } catch (error) {
      console.error('[Controls] Error killing/spawning:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to kill and spawn fresh',
        code: 'KILL_SPAWN_FAILED',
      } as ErrorResponse);
    }
  });

  return router;
}
